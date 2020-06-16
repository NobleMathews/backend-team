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
const clubmodel = require('./models/Club.model.js')
const Acheievement = require('./models/Achievement.model')
const projectmodel = require('./models/Project.model.js')
const session = require('express-session')

// activate morgan in order to get an idea of the get and post requests which are being send to
// const morgan = require('morgan');

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
const logoutRouter = require('./routes/logout')
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

// app.use(morgan('tiny'));

app.use('/users', userRouter)
app.use('/gform', gformRouter)
app.use('/events', eventRouter)
app.use('/register', registerRouter)
app.use('/admin', adminRouter)
app.use('/logout', logoutRouter)
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
app.post('/users/add_event/save', upload.single('poster'), (req, res) => {
  let poster_url
  if (req.file == undefined) {
    poster_url = ' '
  } else {
    poster_url = `${req.file.filename}`
  }

  const event = new Event({
    name: req.body.event_name + '',
    venue: req.body.event_venue,
    date: req.body.event_date,
    description: req.body.description,
    poster_url: poster_url, // url to find poster of the event
    owner: req.session._id,
    categories: req.body.categories,
    speaker: req.body.speaker

  })

  event.save((err, event) => { // saving the event in database
    if (err) {
      res.json(err)
    } else {
      res.redirect('/users/events/retrieve/')
    }
  })
  // let headid = req.params.club_head_id;
})

app.get('/test', (req, res) => {
  res.render('contact')
})

// use the following format for update requests in this route
app.post('/users/profile/', upload.single('profpic'), function (req, res, next) {
  var sess = req.session
  const id = req.session._id
  const uid = req.params.id
  var dpurl = req.body.dp_url

  if (req.file != undefined) {
    dpurl = req.file.filename
  }
  const change = {
    // pswd: req.body.pswd,
    dp_url: dpurl,
    name: req.body.name,
    contact: req.body.contact,
    email_id: req.body.email_id,
    bio: req.body.bio
  }
  sess.dp_url = dpurl
  sess.email_id = req.body.email_id
  sess.contact = req.body.contact
  sess.name = req.body.name
  sess.bio = req.body.bio
  Users.findByIdAndUpdate(id, change)
    .then(() => {
      res.render('public_landing', {
        id: sess._id,
        club_name: sess.club_name,
        name: sess.name,
        user_id: sess.user_id,
        pswd: sess.pswd,
        email_id: sess.email_id,
        contact: sess.contact,
        bio: sess.bio,
        dp_url: sess.dp_url
      })
    }).catch(err => {
      res.json(err)
    })
})

// to create achievement and upload it into database
app.post('/admin/achievement/create/', upload.any('snapshot_url', 20), (req, res) => {
  var pics_url = []

  if (req.files != undefined) {
    pics_url = req.files.map((file) => {
      return file.filename
    })
  }

  var acheievement = new Acheievement({
    title: req.body.title,
    caption: req.body.caption,
    description: req.body.des,
    pics_url: pics_url
  })

  acheievement.save((err, ach) => {
    if (err) res, json(err)
    res.redirect('/admin/achievement/')
  })
})

// this route handle project creation currently i have set a arbitrary maximum of 20 images simultaneously
// change as per necessity
app.post('/admin/project/create', upload.any('snapshot_url', 20), function (req, res, next) {
  var snaps = []
  // console.log(req.files);
  if (req.files != undefined) {
    snaps = req.files.map(function (file) {
      return file.filename
    })
  }
  var project = new projectmodel({
    title: req.body.title,
    team_members: req.body.team_member,
    description: req.body.description,
    branch: req.body.branch,
    club: req.body.club,
    degree: req.body.degree,
    snapshot_url: snaps
  })

  project.save((err) => {
    console.error.bind(console, 'saving of project not done yet!')
  })
  // const id = req.body.id
  res.redirect('/admin/project_details')
})

app.post('/admin/club/create', upload.single('logo'), function (req, res) { // this is for creating the club-head
  const club_name = req.body.club_name
  let logo
  if (req.file == undefined) {
    logo = ' '
  } else {
    logo = `${req.file.filename}`
  }
  var u_club_name = club_name.toUpperCase()
  var l_club_name = club_name.toLowerCase()
  var user = new Users({
    user_id: l_club_name,
    pswd: l_club_name,
    name: '',
    contact: '',
    email_id: '',
    dp_url: '',
    club_head: true,
    club_name: u_club_name,
    bio: ''
  })
  user.save((err, user) => {
    var club = new clubmodel({
      name: u_club_name,
      head: user._id,
      description: req.body.club_description,
      logo_url: logo
    })
    club.save((err) => {
      console.error.bind(console, 'Creating new user failed')
    })
    res.redirect('/admin/clubs/retrieve')
  })
})

app.post('admin/project/update/:id', upload.any('pics', 20), (req, res) => {
  const id = req.params.id
  var snapshots_url
  if (req.files != undefined) {
    snapshots_url = req.files.map((file) => {
      return file.filename
    })
  }

  var change = {
    title: req.body.title,
    team_members: req.body.team_member,
    description: req.body.description,
    branch: req.body.branch,
    club: req.body.club,
    degree: req.body.degree,
    snapshot_url: snapshots_url
  }

  projectmodel.findByIdAndUpdate(id, change)
    .then(() => {
      res.status(200).send('successfully updated')
    }).catch(err => {
      res.status(400).send(err)
    })
})
app.post('/admin/achievement/update/:id', upload.any('pics', 20), (req, res) => { // for updating the achievement of a given id
  const id = req.params.id
  var pics_url
  if (req.files != undefined) {
    pics_url = req.files.map((file) => {
      return file.filename
    })
  }

  var achievement = {
    title: req.body.title,
    caption: req.body.caption,
    description: req.body.des,
    pics_url: pics_url
  }

  Acheievement.findByIdAndUpdate(id, achievement)
    .then(() => {
      res.status(200).send('Achievement updated successfully')
    }).catch(err => {
      res.status(400).send(err)
    })
})
// route to update the club details
app.post('/admin/club/update/:id', upload.single('logo') ,(req, res) => {
  
      const id = req.params.id
      let club_name=req.body.name;
      if (req.file == undefined) {
        var change = {
          name: club_name,
          description: req.body.description,
        }
      } else {
        var change = {
          name: club_name,
          description: req.body.description,
          logo_url: req.file.filename
        }
      }

      var u_club_name = club_name.toUpperCase()
      var l_club_name = club_name.toLowerCase()
      var changeU={
        user_id: l_club_name,
        pswd: l_club_name,
        club_name: u_club_name
      }
      clubmodel.findByIdAndUpdate(id, change,
        function(err, result) {
          if (err) {
            res.status(400).send(err)
          } else {
            Users.findByIdAndUpdate({ _id: result.head },changeU)
            .then(admin => {
              res.redirect("/admin/clubs/retrieve")
            }).catch(err => {
              res.status(404).send(err)
            })          
          }
        }
        );
})
