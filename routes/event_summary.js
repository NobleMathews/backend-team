const router = require("./users");

//  for rendering summary creation page
router.route('/event_summary/create').get((req,res)=>{
})

// route to create event_summary
router.route('/event_summary/create').post((req,res)=>{
})

// for rendering event_summary updating page
router.route('/summary_edit/:id').get((req,res)=>{
    res.render('add_summary',{id:req.params.id})
})

//  route to update event_summary
router.route('/summary_update/:id').post( upload.any('gallery',20), (req, res)=>{
    const id = req.params.id;
    var pics_url
    if (req.files != undefined) {
      pics_url = req.files.map((file) => {
        return file.filename
      })
    }
    const evsum={
        'event_summary.gallery' : pics_url,                          
        'event_summary.chief_guest' : req.body.chief_guest,
        'event_summary.award_winners' : req.body.award_winners,
        'event_summary.summary' : req.body.summary,
        'event_summary.outside_links' : req.body.outside_links,
        'event_summary.file_attachment' : req.body.file_attachment,
        'event_summary.video_links' : req.body.video_links
    }
    for(let field in evsum) if(!evsum[field]) delete evsum[field];
    Events.findByIdAndUpdate(id,evsum)
    .then((event)=>{
        res.redirect("/users/events/retrieve");
    });
});

// route to delete event_summary
router.route('/event_summary/delete').delete((req,res)=>{})