const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const crypto = require('crypto')
const path = require('path')
const multer = require('multer')
const GridFsStorage = require('multer-gridfs-storage')
const Grid = require('gridfs-stream')
const methodOverride = require('method-override')
const Event = require('./models/Event')
const Users = require('./models/Users')
const session = require('express-session')

// activate morgan in order to get an idea of the get and post requests which are being send to
const morgan = require('morgan');

const app = express()
const port = process.env.PORT || 5000
app.use(session({ secret: 'test', saveUninitialized: true, resave: true }))
app.use(cors())
app.use(session({ secret: 'secret_key', saveUninitialized: true, resave: true }))
app.use(methodOverride('_method'))

app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'ejs')
app.set('useFindAndModify', false)

const uri = 'mongodb+srv://heads:heads@cluster0-v6kuo.mongodb.net/techsite?retryWrites=true&w=majority'
// for testing if using a local server for gridfs
// const uri ="mongodb://127.0.0.1:27017/database";

mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })
// the following gridFS structure assumes a collection name of uploads, please change accordingly once it is in place.
let gfs
const connection = mongoose.connection
connection.once('open', () => {
  console.log('MongoDB database connection established successfully')
  gfs = new mongoose.mongo.GridFSBucket(connection.db, { bucketName: 'uploads' })
})

const userRouter = require('./routes/users')
const gformRouter = require('./routes/gform')
const eventRouter = require('./routes/events')
const registerRouter = require('./routes/register')
const adminRouter = require('./routes/admin')
const projectRouter = require('./routes/project')
// default login page can pass alerts to it on load
// hence can notify user easily of failed login routes
app.get('/', (req, res) => {
  // also add in a UI button to switch to admin login
  // backend handles fallbacks to normal login
  res.render('index', { alerts: '' })
})

app.get('/profile', (req, res) => {
  Users.findById(req.query.id, (err, user) => {
    res.render('profile', {
      user_id: user.user_id,
      name: user.name,
      contact: user.contact,
      email_id: user.email_id,
      dp_url: user.dp_url,
      club_head: user.club_head,
      club_name: user.club_name,
      bio: user.bio

    }) // it is ObjectId
  })
})

app.get('/admin/', (req, res) => {
  res.render('adminLogin')
})

app.use(morgan('tiny'));

app.use('/users', userRouter)
app.use('/gform', gformRouter)
app.use('/events', eventRouter)
app.use('/register', registerRouter)
app.use('/admin', adminRouter)
app.use('/project', projectRouter)
app.listen(port, () => {
  console.log(`listening on port : ${port}`)
})

// the following uses the crypto module to generate random names hence make sure to use the corresponding data from fileinfo
const storage = new GridFsStorage({
  url: uri,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err)
        }
        const filename = buf.toString('hex') + path.extname(file.originalname)
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        }
        resolve(fileInfo)
      })
    })
  }
})

const upload = multer({ storage })

// <form method="POST" action="/users/profile/image/upload/<%=id%>"
// invoked from form to upload
app.post('/users/profile/image/upload/:id', upload.single('file'), (req, res) => {
  const id = req.params.id
  // Sending back file name to server
  // console.log(req.file);
  res.redirect(`/users/profile/image/update?id=${id}&url=${req.file.filename}`)
  // res.json({file:req.file});
})

// returns an image stream to show as prof pic  
app.get('/image/:filename', (req, res) => {
  const file = gfs
    .find({
      filename: req.params.filename
    })
    .toArray((err, files) => {
      if (!files || files.length === 0) {
        return res.status(404).json({
          err: 'no files exist'
        })
      }
      gfs.openDownloadStreamByName(req.params.filename).pipe(res)
    })
})

// delete request as per documentation to clear all chunks probably need to preserve the object id
// implement only if required based on front end design. Since it requires and additional param preserved
app.post('/image/del/:img', (req, res) => {
  gfs.delete(new mongoose.Types.ObjectId(req.params.img), (err, data) => {
    if (err) return res.status(404).json({ err: err.message })
    res.status(200)
  })
})

// to save the event in database
// <form action="/users/add_event/<%=club_head_id%>/add_event/<%=club_name%>/add" method="POST" enctype="multipart/form-data">
// from the add_event form
app.post('/users/add_event/:club_head_id/save', upload.single('poster'), (req, res) => {
  let poster_url
  if (req.file == undefined) {
    poster_url = ' '
  } else {
    poster_url = `${req.file.filename}`
  }

  const event = new Event({
    name: req.body.event_name,
    venue: req.body.event_venue,
    date: req.body.event_date,
    description: req.body.description,
    poster_url: poster_url, // url to find poster of the event
    owner: new mongoose.Types.ObjectId(req.params.club_head_id),
    categories: req.body.categories,
    speaker: req.body.speaker

  })

  event.save((err, event) => { // saving the event in database
    if (err) throw err
  })

  // poupulate the owner field
  Event.findById(mongoose.Schema.Types.ObjectId(event._id))
    .populate('owner')
    .exec((err, event) => {
      if (err) throw err
      console.log(event) // <--- you can delete this line
    })

  res.sendStatus(200)
})

app.get('/test', (req, res) => {
  res.render('contact')
})

// use the following format for update requests in this route
app.post('/users/profile/:id', upload.single('profpic'), function (req, res, next) {
  const id = req.body.id;
  const uid = req.params.id;
  console.log(req.file.filename);
  var dpurl = req.file.filename;
  if(!dpurl){
    dpurl=req.body.dp_url;
  }
  const change = {
    // pswd: req.body.pswd,
    dp_url:dpurl,
    name: req.body.name,
    contact: req.body.contact,
    email_id: req.body.email_id
  }
  Users.findByIdAndUpdate(id, change)
    .then((user) => {
      res.redirect('/users/profile/'+uid)
    })
})
