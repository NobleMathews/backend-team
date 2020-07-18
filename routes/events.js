const router = require('express').Router()
const eventsModel = require('../models/Event.model')
const moment = require('moment');
const {upload, uploadf}= require('../db/upload')
const clubAuth = require('../middleware/clubAuth')
const _ = require('lodash');
const { filter } = require('lodash');

// route for rendering event creation page
router.route('/create/').get(clubAuth, (req, res) => {
  res.render('create_event', { alerts: req.flash('error'),page_name:'create_event'})
})

//   route to create event
router.route('/create/').post(clubAuth, upload.single('poster'), (req, res) => {
    let poster_url
    var documentIDs = []
    if (req.file == undefined) {
      poster_url = ' '
    } else {
      poster_url = `${req.file.filename}`
      // req.files.forEach(function (file,index) {
        documentIDs.push([req.file.filename,req.file.id]);
      // })
    }
  
    const event = new eventsModel({
      name: req.body.event_name + '',
      venue: req.body.event_venue,
      date: req.body.event_date,
      description: req.body.description,
      poster_url: poster_url, // url to find poster of the event
      owner: req.user._id,
      categories: req.body.categories,
      speaker: req.body.speaker,
      documentIDs:documentIDs  
    })
  
    event.save((err, event) => { // saving the event in database
      if (err) {
        req.flash("error",err.message)
      }
        res.redirect("/events/view_all")
    })
    // let headid = req.params.club_head_id;
  })
  
// route for viewing all events
router.route('/view_all').get(clubAuth, (req, res) => {
    eventsModel.find({ owner: req.user._id })
      .then(events => {
        res.render('view_events', { alerts: req.flash('error'),events: events, moment: moment, page_name:'view_events' })
      }).catch((err) => {
        req.flash("error",err.message)
        res.redirect('/club_head/profile')
      })
})
  
// route for rendering details of an event
  router.route('/details/:id').get(clubAuth, (req, res) => {
    const id = req.params.id
    eventsModel.find({ _id: id })
      .then(events => {
        res.render('details_event', { alerts: req.flash('error'), events: events, moment: moment, page_name:'view_events'  })
      }).catch((err) => {
        req.flash("error",err.message)
        res.redirect('/events/view_all')      })
})
// route for rendering update event page
router.route('/update/:id').get(clubAuth, (req,res)=>{
    const id = req.params.id
    eventsModel.findById(id)
    .then(event=>{
        res.render('update_event', { alerts: req.flash('error'),event:event,moment:moment, page_name:'view_events' })
    }).catch(err=>{
        req.flash("error",err.message)
res.redirect('/events/view_all')
    })
})

// route to update the event
router.route('/update/:id').post(clubAuth, upload.single('poster'), (req, res) => {
    const id = req.params.id;
    var ev,documentIDs=[],deletequeue=[],pics_url=[],masterqueue=[];
    if(req.body.documentIDs){
      documentIDs = JSON.parse(req.body.documentIDs); 
    }
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
        // req.files.forEach(function (file,index) {
          masterqueue.push([req.file.filename,req.file.id]);
        // })
        pics_url.push(req.file.filename)
    }
    masterqueue=masterqueue.concat(documentIDs);
    documentIDs =masterqueue.filter(k => pics_url.includes(k[0])); 
    deletequeue = masterqueue.filter(k =>!pics_url.includes(k[0]));
    eventsModel.findOne({_id: id},function(err,event){
      if(err) {
        req.flash("error",err.message)
        return res.redirect('/events/view_all')
      }
      var date = new Date(event.date);
      date.setDate(date.getDate() + 1);
      if ((new Date())<date){
        for (var id in ev ){
          event[id]= ev[id];
        }
        event.save(function(err){
          if (err) {
          req.flash("error",err.message)
          }
          if(deletequeue.length>0){
            var arrPromises = deletequeue.map((path) => 
            {if (req.app.locals.gfs) {
              req.app.locals.gfs.delete(new mongoose.Types.ObjectId(path[1]))
              }
            }
            );
            Promise.all(arrPromises)
              .then((arrdata) => {res.redirect('/events/view_all')})
              .catch(function (err) {
                req.flash("error",["Alert : Delete failed on some images."])
                res.redirect('/events/view_all')
              });
          }
          else{
            res.redirect('/events/view_all')
          }        })
      }
      else{
        req.flash("error",["Illegal attempt to edit old event !!"])
        return res.redirect('/events/view_all')
      }
    });
});

// route to delete the event
router.route('/delete/:id').get(clubAuth, (req,res)=>{
    const id = req.params.id
    eventsModel.findOne({_id: id},function(err,event){
      if(err) {
        req.flash("error",err.message)
        return res.redirect('/events/view_all')
      }
      var date = new Date(event.date);
      date.setDate(date.getDate() + 1);
      if ((new Date())<date){
        event.remove();
        var club_head_id = req.user._id
        eventsModel.find({ owner: club_head_id })
        .then(events => {
        return res.render('view_events', { alerts: req.flash('error'), events: events, moment: moment, page_name: 'view_events' })
        }).catch((err) => {
          req.flash("error",err.message)
          return res.redirect('/events/view_all')        })
      }
      else
       {req.flash("error",["You are not authorised to delete a completed event !!"])
       res.redirect('/events/view_all')}
    });
})

module.exports = router;
