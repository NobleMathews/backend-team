const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const session = require('express-session')
const cors = require('cors')
// const methodOverride = require('method-override')

const adminRouter = require('./routes/admin')
const clubHeadRouter = require('./routes/club_head')
const clubsRouter = require('./routes/club')
const eventsRouter = require('./routes/events')
const imagesRouter = require('./routes/images')
const projectRouter = require('./routes/projects')
const achievementsRouter = require('./routes/achievements')
const notifyRouter = require('./routes/notify')
const blogRouter = require('./routes/blog')
// const registerRouter = require('./routes/register')

const app = express()
const port = process.env.PORT || 5000
app.use(session({ secret: 'test', saveUninitialized: true, resave: true }))
app.use(cors())

// app.use(methodOverride('_method'))
app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'ejs')
app.set('useFindAndModify', false)

app.use('/admin', adminRouter) // was /admin before
app.use('/club_head', clubHeadRouter) // was /users before
app.use('/events', eventsRouter) // was /events before
//  --- the following are totally new and were added by removing sub-dir
app.use('/club', clubsRouter)
app.use('/images', imagesRouter)
app.use('/projects', projectRouter)
app.use('/achievements', achievementsRouter)
app.use('/notify', notifyRouter)
app.use('/blog', blogRouter)

// ---- the following were scrapped so takeout from views
// app.use('/gform', gformRouter)
// app.use('/logout', logoutRouter)
// app.use('/register', registerRouter) // was /register before
// const uri = process.env.URI

app.listen(port, () => {
  console.log(`listening on port : ${port}`)
})

app.get('/', (req, res) => {
  res.render('index', { alerts: '' })
})

app.get('/admin/', (req, res) => {
  res.render('adminLogin', { alerts: '' })
})
