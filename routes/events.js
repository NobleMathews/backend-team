const router = require('express').Router()
const eventsModel = require('../models/Event.model')
const moment = require('moment');
const {upload, uploadf}= require('../db/upload')
const clubAuth = require('../middleware/clubAuth')

// route for rendering event creation page
router.route('/create/').get(clubAuth, (req, res) => {
  res.render('create_event',{page_name:'create_event'}) /////// Use new system to get the actual user id here
})

//   route to create event
router.route('/create/').post(clubAuth, upload.single('poster'), (req, res) => {
    let poster_url
    if (req.file == undefined) {
      poster_url = ' '
    } else {
      poster_url = `${req.file.filename}`
    }
  
    const event = new eventsModel({
      name: req.body.event_name + '',
      venue: req.body.event_venue,
      date: req.body.event_date,
      description: req.body.description,
      poster_url: poster_url, // url to find poster of the event
      owner: req.user._id,
      categories: req.body.categories,
      speaker: req.body.speaker
  
    })
  
    event.save((err, event) => { // saving the event in database
      if (err) {
        res.json(err)
      } else {
        res.redirect("/events/view_all")
      }
    })
    // let headid = req.params.club_head_id;
  })
  
// route for viewing all events
router.route('/view_all').get(clubAuth, (req, res) => {
    eventsModel.find({ owner: req.user._id })
      .then(events => {
      // res.json(events)
        res.render('view_events', { events: events, moment: moment, page_name:'view_events' })
      }).catch((err) => {
        res.json('Error: ' + err)
      })
})
  
// route for rendering details of an event
  router.route('/details/:id').get(clubAuth, (req, res) => {
    const id = req.params.id
    eventsModel.find({ _id: id })
      .then(events => {
      // res.json(events)
        res.render('details_event', { events: events, moment: moment, page_name:'view_events'  })
      }).catch((err) => {
        res.json('Error: ' + err)
      })
})
// route for rendering update event page
router.route('/update/:id').get(clubAuth, (req,res)=>{
    const id = req.params.id
    eventsModel.findById(id)
    .then(event=>{
        res.render('update_event',{event:event,moment:moment, page_name:'view_events' })
    }).catch(err=>{
        res.json(err)
    })
})

// route to update the event
router.route('/update/:id').post(clubAuth, upload.single('poster'), (req, res) => {
    const id = req.params.id;
    var ev;
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
    eventsModel.findOne({_id: id},function(err,event){
      if(err) return res.status(404).send(err)
      var date = new Date(event.date);
      date.setDate(date.getDate() + 1);
      if ((new Date())<date){
        for (var id in ev ){
          event[id]= ev[id];
        }
        event.save(function(err){
          if(err) return res.status(404).send(ev)
          return res.redirect("/events/view_all");
        })
      }
      else
       return res.status(404).json("Illegal attempt to edit old event !!")
    });
});

// route to delete the event
router.route('/delete/:id').get(clubAuth, (req,res)=>{
    const id = req.params.id
    eventsModel.findOne({_id: id},function(err,event){
      if(err) return res.status(404).send(err)
      var date = new Date(event.date);
      date.setDate(date.getDate() + 1);
      if ((new Date())<date){
        event.remove();
        var club_head_id = req.user._id
        eventsModel.find({ owner: club_head_id })
        .then(events => {
        return res.render('view_events', { events: events, moment: moment, page_name: 'view_events' })
        }).catch((err) => {
        return res.json('Error: ' + err)
        })
      }
      else
       return res.status(404).json("You are not authorised to delete a completed event !!")
    });
})


//routes for collecting events based on month(1-12) and populating them
router.route('/:month').get(clubAuth, (req,res) => {
    month = req.params.month
    const resEvents = new Array()

    eventsModel.find().then((events) => {
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
