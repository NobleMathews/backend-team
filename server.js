const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const session = require('express-session')
const cors = require('cors')
const methodOverride = require('method-override')

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


let gfs
const connection = mongoose.connection
connection.once('open', () => {
  console.log('MongoDB database connection established successfully')
  gfs = new mongoose.mongo.GridFSBucket(connection.db, { bucketName: 'uploads' })
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