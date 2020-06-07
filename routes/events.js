const router = require('express').Router();
let Events = require('../models/Event');

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

module.exports = router;