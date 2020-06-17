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
const gformRouter = require('./routes/notify')
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


// default login page can pass alerts to it on load
// hence can notify user easily of failed login routes
app.get('/', (req, res) => {
  // also add in a UI button to switch to admin login
  // backend handles fallbacks to normal login
  res.render('index', { alerts: '' })
})

app.get('/admin/', (req, res) => {
  res.render('adminLogin',{alerts:''})
})

app.get('/test', (req, res) => {
  res.render('contact')
})

module.exports = connection