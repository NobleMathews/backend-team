const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const session = require('express-session')
const cors = require('cors')
//const methodOverride = require('method-override')

const adminRouter = require('./routes/admin')
const clubHeadRouter = require('./routes/club_head')
const clubsRouter = require('./routes/club')
const eventsRouter = require('./routes/events')
const imagesRouter = require('./routes/images')
const projectRouter = require('./routes/projects')
const achievementsRouter = require('./routes/achievements') 
const notifyRouter = require('./routes/notify')
const eventSummaryRouter = require('./routes/event_summary')

const app = express()
const port = process.env.PORT || 5000
app.use(session({ secret: 'test', saveUninitialized: true, resave: true }))
app.use(cors())

//app.use(methodOverride('_method'))
app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'ejs')
app.set('useFindAndModify', false)

//fill all the used routes with appropriate names
app.use('/admin',adminRouter)


const uri = process.env.URI
mongoose.connect(uri, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true })

const connection = mongoose.connection
connection.once('open', () => {
  console.log('MongoDB database connection established successfully')
})


app.listen(port, () => {
  console.log(`listening on port : ${port}`)
})

app.get('/', (req, res) => {
  res.render('index', { alerts: '' })
})

app.get('/admin/', (req, res) => {
  res.render('adminLogin',{alerts:''})
})

module.exports = connection