const router = require('express').Router();
const moment = require('moment');
let Events = require('../models/Event');

//update summary fields all fields arent neceassary and only those passed will be affected keeping other parameters unchanged
//on front end make sure primary fields that are essential to define the event are kep as required.
router.route('/summary_update/:id').post((req,res)=>{
    const id = req.params.id;
    const evsum={
        'event_summary.gallery' : req.body.gallery,                          
        'event_summary.chief_guest' : req.body.chief_guest,
        'event_summary.award_winners' : req.body.award_winners,
        'event_summary.summary' : req.body.summary,
        'event_summary.outside_links' : req.body.outside_links,
        'event_summary.file_attachment' : req.body.file_attachment,
        'event_summary.video_links' : req.body.video_links
    }
    //{"$push": { "arrays": if they need to retains values } }
    for(let field in evsum) if(!evsum[field]) delete evsum[field];
    Events.findByIdAndUpdate(id,evsum)
    .then((event)=>{
        res.sendStatus(200);
    });
});
// use state variable supplied by this route to populate react layout
router.route('/summary/:id').get((req,res)=>{
    const id =req.params.id;  
    const event={_id:id};
    Events.find(event)
    .then(event=>{
        if(event.length===1){  
            if(event[0].event_summary){
                /// The following are state variables to be used within react
                res.send(event[0].event_summary);
            }
            // take care the following error reponses are handled separately. 
            else{
                res.json("no_summary");

            }
        }
        else{
            res.json("new_event");
        }
    }).catch((err)=>{
        res.json('Error: '+err);
    });
});

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

router.route('/update/:id').get((req,res)=>{
    const id = req.params.id
    Events.findById(id)
    .then(event=>{
        res.render('update_event',{event:event,moment:moment})
    }).catch(err=>{
        res.json(err)
    })
})

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

module.exports = router;
