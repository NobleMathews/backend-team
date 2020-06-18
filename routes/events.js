const router = require('express').Router()
const connection = require('../server')
const crypto = require('crypto')
const path = require('path')
const multer = require('multer')
const Users = require('../models/Users')
const Events = require('../models/Event')
const moment = require('moment')
var upload = require('./images');
const GridFsStorage = require('multer-gridfs-storage')

const uri = 'mongodb+srv://heads:heads@cluster0-v6kuo.mongodb.net/techsite?retryWrites=true&w=majority'
let gfs
connection.once('open', () => {
  console.log('MongoDB database connection established successfully')
  gfs = new mongoose.mongo.GridFSBucket(connection.db, { bucketName: 'uploads' })
})

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

const upload = multer({ storage,
fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    // png jpg gif and jpeg allowed
    if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
      //enable this line if abort should be aborted || currently the file is just ignored & not sent for upload
        // return callback(new Error('Only images are allowed'))              
        return callback(null, false)

    }
    callback(null, true)
},
  limits:{
      fileSize: 50 * 1024 // 50 Mb limit imposed
  } 
})


// route for rendering event creation page
router.route('/add_event/').get((req, res) => {
    Users.findById(req.session._id)
      .then((user) => {
        // check if the user is club head
        if (user.club_head) {
          res.render('add_event', { club_head_id: user._id })
        } else {
          res.send('you are not club head')
        }
      }).catch(err => {
        console.log(err)
      })
})

//   route to create event
router.route('/add_event/save').post( upload.single('poster'), (req, res) => {
    let poster_url
    if (req.file == undefined) {
      poster_url = ' '
    } else {
      poster_url = `${req.file.filename}`
    }
  
    const event = new Events({
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
  
// route for viewing all events
router.route('/events/retrieve/').get((req, res) => {
    Events.find({ owner: req.session._id })
      .then(events => {
      // res.json(events)
        res.render('event_view', { events: events, moment: moment })
      }).catch((err) => {
        res.json('Error: ' + err)
      })
})
  
// route for rendering details of an event
  router.route('/events/details/:id').get((req, res) => {
    const id = req.params.id
    Events.find({ _id: id })
      .then(events => {
      // res.json(events)
        res.render('event_details', { events: events, moment: moment })
      }).catch((err) => {
        res.json('Error: ' + err)
      })
})
// route for rendering update event page
router.route('/update/:id').get((req,res)=>{
    const id = req.params.id
    Events.findById(id)
    .then(event=>{
        res.render('update_event',{event:event,moment:moment})
    }).catch(err=>{
        res.json(err)
    })
})

// route to update the event
router.route('/update/:id').post( upload.single('poster'), (req, res) => {
    const id = req.params.id;
    var evsum;
    if (req.file == undefined) {
        ev={
            'name':req.body.event_name,
            'venue':req.body.event_venue,
            'date':req.body.event_date,
            'description':req.body.description,
            'categories':req.body.categories
        }
    } else {
        ev={
            'name':req.body.event_name,
            'venue':req.body.event_venue,
            'date':req.body.event_date,
            'description':req.body.description,
            'poster_url':`${req.file.filename}`,
            'categories':req.body.categories
        }
    }
    Events.findByIdAndUpdate(id,ev)
    .then((event)=>{
        res.redirect("/users/events/retrieve");
    });
});

// route to delete the event
router.route('/delete/:id').get((req,res)=>{
    const id = req.params.id
    Events.findByIdAndDelete(id)
    .then(()=>{
        var club_head_id = req.session._id
        Events.find({ owner: club_head_id })
        .then(events => {
        // res.json(events)
            res.render('event_view', { events: events, moment: moment })
        }).catch((err) => {
        res.json('Error: ' + err)
        })
    }).catch(err=>{
        res.json(err)
    })
})


//routes for collecting events based on month(1-12) and populating them
router.route('/:month').get((req,res) => {
    month = req.params.month
    const resEvents = new Array()

    Events.find().then((events) => {
        events.forEach(event => {
            if(event.filterByMonth(month)){
                resEvents.push(event)
            }
        })

        res.send(resEvents)
    }).catch((e) => {
        res.status(400).send(e)
    })

})


module.exports = router;
