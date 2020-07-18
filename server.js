const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const session = require('express-session')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const connection = require('./db/mongoose')
var flash = require('connect-flash')
// const methodOverride = require('method-override')

const adminRouter = require('./routes/admin')
const clubHeadRouter = require('./routes/club_head')
const clubMembersRouter = require('./routes/club_members')
const clubsRouter = require('./routes/club')
const eventsRouter = require('./routes/events')
const imagesRouter = require('./routes/supporting/images')
const fileRouter = require('./routes/supporting/files')
const projectRouter = require('./routes/projects')
const achievementsRouter = require('./routes/achievements')
const notifyRouter = require('./routes/supporting/notify')
const blogRouter = require('./routes/blog')
const newsRouter = require('./routes/news')
const frontEndRouter = require('./routes/front')
const techteamRouter = require('./routes/tech_teams')
const publicRouter = require('./routes/public')
const app = express()
const port = process.env.PORT || 5000
app.use(session({ secret: 'test', saveUninitialized: true, resave: true }))
app.use(cors())
app.use(cookieParser())

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.set('view engine', 'ejs')
app.set('useFindAndModify', false)
app.use(flash())

app.use('/admin', adminRouter)
app.use('/club_head', clubHeadRouter)
app.use('/club_members', clubMembersRouter)
app.use('/events', eventsRouter)
app.use('/club', clubsRouter)
app.use('/images', imagesRouter)
app.use('/files', fileRouter)
app.use('/projects', projectRouter)
app.use('/achievements', achievementsRouter)
app.use('/notify', notifyRouter)
app.use('/blog', blogRouter)
app.use('/news', newsRouter)
app.use('/front', frontEndRouter)
app.use('/tech_teams', techteamRouter)
app.use('/public', publicRouter)

app.listen(port, () => {
  console.log(`listening on port : ${port}`)
})

let gfs
connection.once('open', () => {
  gfs = new mongoose.mongo.GridFSBucket(connection.db, { bucketName: 'uploads' })
  app.locals.gfs = gfs
})

app.get('/', (req, res) => {
  res.render('index', { alerts: req.flash('error') })
})

app.get('/admin/', (req, res) => {
  res.render('adminLogin', { alerts: req.flash('error') })
})
