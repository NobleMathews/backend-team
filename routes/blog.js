const router = require('express').Router()
const blogModel = require('../models/Blog.model')
const upload = require('../db/upload');
//  for rendering blog creation page
router.route('/create').get((req,res)=>{
  res.render('create_summary',{id:req.params.id})
})

// route to create blog
router.route('/create').post( upload.any('gallery',20), (req, res)=>{
  const id = req.session._id
  var pics_url=[""]
  if (req.files != undefined) {
    pics_url = req.files.map((file) => {
      return file.filename
    })
  }
  const evsum= new blogModel({
      owner: id,
      gallery : pics_url,                          
      chief_guest : req.body.chief_guest,
      award_winners : req.body.award_winners,
      summary : req.body.summary,
      outside_links : req.body.outside_links,
      file_attachment : req.body.file_attachment,
      video_links : req.body.video_links
  })
  evsum.save((err, event) => { // creating the blog in database
    if (err) {
      res.json(err)
    } else {
      res.redirect("/blog/view_all")
    }
  })
})

// for rendering blog updating page
router.route('/update/:id').get((req,res)=>{
  const id = req.params.id
  blogModel.findById(id)
  .then(event=>{
      res.render('update_summary',{id:req.params.id,summary:event.blog})
  }).catch(err=>{
      res.json(err)
  })
})

//  route to update blog
router.route('/update/:id').post( upload.any('gallery',20), (req, res)=>{
    const id = req.params.id;
    var pics_url
    if (req.files != undefined) {
      pics_url = req.files.map((file) => {
        return file.filename
      })
    }
    const evsum={
        gallery : pics_url,                          
        chief_guest : req.body.chief_guest,
        award_winners : req.body.award_winners,
        summary : req.body.summary,
        outside_links : req.body.outside_links,
        file_attachment : req.body.file_attachment,
        video_links : req.body.video_links
    }
    for(let field in evsum) if(!evsum[field]) delete evsum[field];
    blogModel.findByIdAndUpdate(id,evsum)
    .then((event)=>{
        res.redirect("/blog/view_all");
    });
});

router.route('/view_all').get((req,res)=>{
  blogModel.find({ owner: req.session._id })
  .then(blogs => {
  // res.json(blogs)
    res.render('view_blog', {blogs: blogs})
  }).catch((err) => {
    res.json('Error: ' + err)
  })
})

// route to delete blog
router.route('/delete/:id').get((req,res)=>{
  const id = req.params.id
  blogModel.findByIdAndDelete(id)
  .then(()=>{
      var club_head_id = req.session._id
      blogModel.find({ owner: club_head_id })
      .then(blogs => {
      // res.json(blog)
          res.render('view_blog', { blogs: blogs})
      }).catch((err) => {
      res.json('Error: ' + err)
      })
  }).catch(err=>{
      res.json(err)
  })
})

module.exports = router