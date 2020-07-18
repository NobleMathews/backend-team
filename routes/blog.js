const router = require('express').Router()
const blogModel = require('../models/Blog.model')
const {upload, uploadf}= require('../db/upload')
const mongoose = require('mongoose')
const clubAuth = require('../middleware/clubAuth')
const path = require('path')
const _ = require('lodash');
const MonkeyLearn = require('monkeylearn')
const ml = new MonkeyLearn('8b8701a6b32bfe7d6f749095ee6d31123b267daf')
let model_id = 'ex_YCya9nrn'

//  for rendering blog creation page
router.route('/create').get(clubAuth, (req,res)=>{
  res.render('create_blog', { alerts: req.flash('error'),id:req.params.id, page_name:'blogs'})
})

// route to create blog
router.route('/create').post(clubAuth, uploadf.fields([{name:'chief_guest_url',maxCount:1},{name:'file_attachment[]',maxCount:40}]), (req, res)=>{  
  vfeatured=req.body.featured==="on"?true:false;
  vpublished=req.body.published==="on"?true:false;
  if(vfeatured=true){
    vpublished=true
  }
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

  ml.extractors.extract(model_id,[req.body.summary]).then(resp => {
    let response=resp.body
    let tags=[]
    if(!response[0].error){
      let tagsarray=response[0]["extractions"]
      _.forEach(tagsarray, function(tagel){
        if(parseFloat(tagel.relevance)>0.8){
          tags.push(tagel.parsed_value)
        }
      })
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
        documentIDs:documentIDs,
        published : vpublished,
        keywords : tags
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
        documentIDs:documentIDs,
        published : vpublished,
        keywords : tags
    })
    }
    evsum.save((err, event) => {
      // creating the blog in database
     if(vfeatured){
       blogModel.find({owner: event.owner}).then((blogs) => {
         blogs.forEach(async (blog) => {
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
    vpublished=req.body.published==="on"?true:false;
    if(vfeatured==true){
      vpublished=true
    }
    var pics_url=[],file_attachment=[],pics_url_links=[],chief_guest_url,tags=[],documentIDs=[],masterqueue=[],deletequeue=[];
    if(req.body.documentIDs){
      documentIDs = JSON.parse(req.body.documentIDs); 
    }
    if(req.body.tags){
      tags = JSON.parse(req.body.tags); 
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
        documentIDs:documentIDs,
        published : vpublished,
        keywords : tags
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
        documentIDs:documentIDs,
        published : vpublished,
        keywords : tags
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
        documentIDs:documentIDs,
        published : vpublished,
        keywords : tags
    }
    }
    blogModel.findOneAndUpdate({_id:id},{$set: evsum},{useFindAndModify: false})
    .then((blog) => {
      if(vfeatured===true){
        blogModel.find({owner: blog.owner ,featured: true}).then((blogs) => {
          blogs.forEach(async (blg) => {
            if(!blg._id.equals(blog._id)){
              blg.featured = false
              await blg.save()
            }
          })
        }).catch((e)=> {
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
      else{
        res.redirect('/blog/view_all')
      }
    }
    else
    res.redirect('/blog/view_all')

  }).catch(err=>{
    req.flash("error",err.message)
    res.redirect('/blog/view_all')
  })
})

module.exports = router