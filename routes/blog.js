const router = require('express').Router()
const blogModel = require('../models/Blog.model')
const clubModel = require('../models/Club.model')
const clubHeadModel = require('../models/ClubHead.model')
const {upload, uploadf}= require('../db/upload')
const mongoose = require('mongoose')
const clubAuth = require('../middleware/clubAuth')
const path = require('path')

//  for rendering blog creation page
router.route('/create').get(clubAuth, (req,res)=>{
  res.render('create_blog', { alerts: req.flash('error'),id:req.params.id, page_name:'blogs'})
})

// route to create blog
router.route('/create').post(clubAuth, uploadf.fields([{name:'chief_guest_url',maxCount:1},{name:'file_attachment[]',maxCount:40}]), (req, res)=>{  
  vfeatured=req.body.featured==="on"?true:false;
  const id = req.user._id
  var documentIDs = []
  var pics_url=[],file_attachment=[],chief_guest_url;
  let outside_links=(req.body.outside_links).filter(Boolean);
  // let file_attachment=(req.body.file_attachment).filter(Boolean);
  let video_links=(req.body.video_links).filter(Boolean);
  if (req.files != undefined) {
    let allfiles=req.files['file_attachment[]'];
    let ext;
    if(allfiles){
      file_attachment= allfiles.filter((file) => { ext=path.extname(file.originalname); return (ext != '.png' && ext != '.jpg' && ext != '.gif' && ext != '.jpeg') })
      .map((file)=> { return file.filename });
      pics_url = allfiles.filter((file) => { ext=path.extname(file.originalname); return (ext == '.png' || ext == '.jpg' || ext == '.gif' || ext == '.jpeg') })
      .map((file)=> { return file.filename });
      allfiles.filter((file) => { ext=path.extname(file.originalname); return (ext == '.png' || ext == '.jpg' || ext == '.gif' || ext == '.jpeg') })
      .forEach(function (file,index) {
        documentIDs[index]=[file.filename,file.id];
      })
    }
  }
    if(req.files['chief_guest_url']){
    chief_guest_url=req.files['chief_guest_url'][0].filename;
    var evsum= new blogModel({
      owner: id,
      title : req.body.title,
      gallery : pics_url,
      category:req.body.category,                          
      chief_guest : req.body.chief_guest,
      chief_guest_url : chief_guest_url,
      award_winners : req.body.award_winners,
      summary : req.body.summary,
      featured : vfeatured,
      outside_links : outside_links,
      file_attachment : file_attachment,
      video_links : video_links,
      documentIDs:documentIDs
  })
  }
  else{
    var evsum= new blogModel({
      owner: id,
      title : req.body.title,
      gallery : pics_url,
      category:req.body.category,                          
      chief_guest : req.body.chief_guest,
      award_winners : req.body.award_winners,
      summary : req.body.summary,
      featured : vfeatured,
      outside_links : outside_links,
      file_attachment : file_attachment,
      video_links : video_links,
      documentIDs:documentIDs
  })
  }
  evsum.save((err, event) => {
     // creating the blog in database
    // console.log(event.featured)
    if(event.featured===true){
      blogModel.find({owner: event.owner}).then((blogs) => {
        blogs.forEach(async (blog) => {
          // console.log(blog._id)
          if(!blog._id.equals(event._id)){
            blog.featured = false
            await blog.save()
          }
        })
      })
    }
    if (err) {
    req.flash("error",err.message)
    res.redirect('/blog/view_all')
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
      res.render('update_blog', { alerts: req.flash('error'),id:req.params.id,summary:blog, page_name:'blogs' })
  }).catch(err=>{
    req.flash("error",err.message)
    res.redirect('/blog/view_all')
  })
})

//  route to update blog
router.route('/update/:id').post(clubAuth, uploadf.fields([{name:'chief_guest_url',maxCount:1},{name:'file_attachment[]',maxCount:40}]), (req, res)=>{
    const id = req.params.id;
    vfeatured=req.body.featured==="on"?true:false;
    var pics_url=[],file_attachment=[],pics_url_links=[],chief_guest_url,documentIDs=[],masterqueue=[],deletequeue=[];
    if(req.body.documentIDs){
      documentIDs = JSON.parse(req.body.documentIDs); 
    }
    let outside_links=(req.body.outside_links).filter(Boolean);
    let file_attachment_links=[]
    if(req.body.file_attachment_links)
      file_attachment_links=(req.body.file_attachment_links).filter(Boolean);
    if(req.body.pics_url_links)
    pics_url_links=(req.body.pics_url_links).filter(Boolean);
    let video_links=(req.body.video_links).filter(Boolean);
    if (req.files != undefined) {
      let allfiles=req.files['file_attachment[]'];
      let ext;
      if(allfiles){
      file_attachment= allfiles.filter((file) => { ext=path.extname(file.originalname); return (ext != '.png' && ext != '.jpg' && ext != '.gif' && ext != '.jpeg') })
      .map((file)=> { return file.filename });
      file_attachment = file_attachment.concat(file_attachment_links);
      pics_url = allfiles.filter((file) => { ext=path.extname(file.originalname); return (ext == '.png' || ext == '.jpg' || ext == '.gif' || ext == '.jpeg') })
      .map((file)=> { return file.filename });
      allfiles.filter((file) => { ext=path.extname(file.originalname); return (ext == '.png' || ext == '.jpg' || ext == '.gif' || ext == '.jpeg') })
      .forEach(function (file,index) {
        masterqueue[index]=[file.filename,file.id];
      })
      }
      masterqueue=masterqueue.concat(documentIDs);
      pics_url = pics_url.concat(pics_url_links);
      documentIDs =masterqueue.filter(k => pics_url.includes(k[0])); 
      deletequeue = masterqueue.filter(k =>!pics_url.includes(k[0]));
      if(req.files['chief_guest_url']){
      chief_guest_url=req.files['chief_guest_url'][0].filename;
      var evsum= {
        gallery : pics_url,
        title : req.body.title,                          
        category:req.body.category,                          
        chief_guest : req.body.chief_guest,
        chief_guest_url : chief_guest_url,
        award_winners : req.body.award_winners,
        summary : req.body.summary,
        featured : vfeatured,
        outside_links : outside_links,
        file_attachment : file_attachment,
        video_links : video_links,
        documentIDs:documentIDs
    }
    }
    else{
      var evsum= {
        gallery : pics_url,
        title : req.body.title,                          
        category:req.body.category,                          
        chief_guest : req.body.chief_guest,
        award_winners : req.body.award_winners,
        summary : req.body.summary,
        featured : vfeatured,
        outside_links : outside_links,
        file_attachment : file_attachment,
        video_links : video_links,
        documentIDs:documentIDs

    }
    }
    }
    else{
    if(req.body.pics_url_links)
    pics_url_links=(req.body.pics_url_links).filter(Boolean);
    if(req.body.documentIDs){
      documentIDs = JSON.parse(req.body.documentIDs); 
    }
    deletequeue = documentIDs.filter(k =>!pics_url_links.includes(k[0]));
    documentIDs = documentIDs.filter(k => pics_url.includes(k[0])); 
    var evsum= {
        gallery : pics_url_links,
        category:req.body.category,
        title : req.body.title,                          
        chief_guest : req.body.chief_guest,
        award_winners : req.body.award_winners,
        summary : req.body.summary,
        featured : vfeatured,
        outside_links : outside_links,
        file_attachment : file_attachment_links,
        video_links : video_links,
        documentIDs:documentIDs
    }
    }
    for(let field in evsum) if(!evsum[field] && field!="featured") delete evsum[field];
    blogModel.findOneAndUpdate({_id:id},{$set: evsum},{useFindAndModify: false})
    .then((blog) => {
      // console.log(blog.featured)
      if(vfeatured===true){
        // console.log('here')
        blogModel.find({owner: blog.owner ,featured: true}).then((blogs) => {
          blogs.forEach(async (blg) => {
            // console.log(blg._id)
            if(!blg._id.equals(blog._id)){
              blg.featured = false
              await blg.save()
            }
          })
        }).catch((e)=> {
          // console.log(e)
          res.json(e)
        })
      }
      if(deletequeue.length>0){
        var arrPromises = deletequeue.map((path) => 
        {if (req.app.locals.gfs) {
          req.app.locals.gfs.delete(new mongoose.Types.ObjectId(path[1]))
          }
        }
        );
        Promise.all(arrPromises)
          .then((arrdata) => {res.redirect('/blog/view_all')})
          .catch(function (err) {
            req.flash("error",["Alert : Delete failed on some images."])
            res.redirect('/blog/view_all')
          });
      }
      else{
        res.redirect('/blog/view_all')
      }    }).catch(err => {
      req.flash("error",err.message)
      res.redirect('/blog/view_all')      })
});

router.route('/view_all').get(clubAuth, (req,res)=>{
  blogModel.find({ owner: req.user._id })
  .then(blogs => {
    res.render('view_blogs', { alerts: req.flash('error'),blogs: blogs,page_name:'blogs'})
  }).catch((err) => {
    req.flash("error",err.message)
    res.redirect('/club_head/profile')  })
})

router.route('/details/:id').get(clubAuth, (req,res)=>{
  const id = req.params.id
  blogModel.findById(id)
  .then(blog=>{
      res.render('details_blog', { alerts: req.flash('error'),id:req.params.id,blog:blog, page_name:'blogs' })
  }).catch(err=>{
    req.flash("error",err.message)
    res.redirect('/blog/view_all')
  })
})
// route to delete blog
router.route('/delete/:id').get(clubAuth, (req,res)=>{
  const id = req.params.id
  blogModel.findByIdAndDelete(id)
  .then((data) => {
    if(data.documentIDs){
      deletequeue = data.documentIDs;
      if(deletequeue.length>0){
        var arrPromises = deletequeue.map((path) => 
        {
          req.app.locals.gfs.delete(new mongoose.Types.ObjectId(path[1]))
          
        }
        );
        Promise.all(arrPromises)
          .then((arrdata) => 
            
            res.redirect('/blog/view_all'))
          .catch(function (err) {
            req.flash("error",["Alert : Delete failed on some images."])
            res.redirect('/blog/view_all')
          });
      }
    }
    else
    res.redirect('/blog/view_all')

  }).catch(err=>{
    req.flash("error",err.message)
    res.redirect('/blog/view_all')
  })
})

// route to provide search query
router.route('/search/:club_name').get(async (req,res)=>{
  const club = req.params.club_name.toUpperCase()
  const query_string = req.query.filter

  let owner_id;
  let club_spec;
  try {
    club_spec = await clubModel.findOne({name:club})
    owner_id = club_spec.head
  } catch (error) {
    res.json(error)    
  }

  let blogs
  try {
    blogs = await blogModel.find({owner:owner_id, $text: {$search: query_string}},{score:{$meta:'textScore'}}).limit(30).sort({score:{$meta:'textScore'}})
    res.json(blogs)
  } catch (error) {
    res.json(error)
  }
})

module.exports = router