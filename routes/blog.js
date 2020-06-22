const router = require('express').Router()
const blogModel = require('../models/Blog.model')
const upload = require('../db/upload');
const clubAuth = require('../middleware/clubAuth')

//  for rendering blog creation page
router.route('/create').get(clubAuth, (req,res)=>{
  res.render('create_blog',{id:req.params.id})
})

// route to create blog
router.route('/create').post(clubAuth, upload.any('gallery',20), (req, res)=>{
  const id = req.user._id
  var pics_url;
  let outside_links=(req.body.outside_links).filter(Boolean);
  let file_attachment=(req.body.file_attachment).filter(Boolean);
  let video_links=(req.body.video_links).filter(Boolean);
  if (req.files != undefined) {
    pics_url = req.files.map((file) => {
      return file.filename
    })
    var evsum= new blogModel({
      owner: id,
      gallery : pics_url,                          
      chief_guest : req.body.chief_guest,
      award_winners : req.body.award_winners,
      summary : req.body.summary,
      outside_links : outside_links,
      file_attachment : file_attachment,
      video_links : video_links
  })
  }
  else{
  var evsum= new blogModel({
      owner: id,
      chief_guest : req.body.chief_guest,
      award_winners : req.body.award_winners,
      summary : req.body.summary,
      outside_links : outside_links,
      file_attachment : file_attachment,
      video_links : video_links
  })
  }
  evsum.save((err, event) => { // creating the blog in database
    if (err) {
      res.json(err)
    } else {
      res.redirect("/blog/view_all")
    }
  })
})

// for rendering blog updating page
router.route('/update/:id').get(clubAuth, (req,res)=>{
  const id = req.params.id
  blogModel.findById(id)
  .then(blog=>{
      res.render('update_blog',{id:req.params.id,summary:blog})
  }).catch(err=>{
      res.json(err)
  })
})

//  route to update blog
router.route('/update/:id').post(clubAuth, upload.any('gallery',20), (req, res)=>{
    const id = req.params.id;
    var pics_url;
    let outside_links=(req.body.outside_links).filter(Boolean);
    let file_attachment=(req.body.file_attachment).filter(Boolean);
    let video_links=(req.body.video_links).filter(Boolean);
    if (req.files != undefined) {
      pics_url = req.files.map((file) => {
        return file.filename
      })

      var evsum= {
        gallery : pics_url,                          
        chief_guest : req.body.chief_guest,
        award_winners : req.body.award_winners,
        summary : req.body.summary,
        outside_links : outside_links,
        file_attachment : file_attachment,
        video_links : video_links
    }
    }
    else{
    var evsum= {
        chief_guest : req.body.chief_guest,
        award_winners : req.body.award_winners,
        summary : req.body.summary,
        outside_links : outside_links,
        file_attachment : file_attachment,
        video_links : video_links
    }
    }
    for(let field in evsum) if(!evsum[field]) delete evsum[field];
    
    blogModel.findOneAndUpdate({_id:id},{$set: evsum},{useFindAndModify: false})
    .then((event)=>{
        res.redirect("/blog/view_all");
    });
});

router.route('/view_all').get(clubAuth, (req,res)=>{
  blogModel.find({ owner: req.user._id })
  .then(blogs => {
  // res.json(blogs)
    res.render('view_blog', {blogs: blogs})
  }).catch((err) => {
    res.json('Error: ' + err)
  })
})

// route to delete blog
router.route('/delete/:id').get(clubAuth, (req,res)=>{
  const id = req.params.id
  blogModel.findByIdAndDelete(id)
  .then(()=>{
      var club_head_id = req.user._id
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