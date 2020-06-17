const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const session = require('express-session')
const cors = require('cors')
const methodOverride = require('method-override')
const Users = require('./models/Users')

// activate morgan in order to get an idea of the get and post requests which are being send to
// const morgan = require('morgan');
// app.use(morgan('tiny'));

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
mongoose.connect(uri, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true })
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
app.use('/users', userRouter)
app.use('/gform', gformRouter)
app.use('/events', eventRouter)
app.use('/register', registerRouter)
app.use('/admin', adminRouter)
app.use('/logout', logoutRouter)
app.listen(port, () => {
  console.log(`listening on port : ${port}`)
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

app.get('/test', (req, res) => {
  res.render('contact')
})
