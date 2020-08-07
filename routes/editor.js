const router = require('express').Router()
const blogModel = require('../models/Blog.model')
const editorModel = require('../models/Editor.model')
const {upload, uploadf}= require('../db/upload')
const editorAuth = require('../middleware/editorAuth')
const e = require('method-override')
const mongoose = require('mongoose')
const path = require('path')
const _ = require('lodash');

router.route('/login').post(async (req, res) => {
  
  
    const user_id = req.body.user_id
    const pswd = req.body.pswd
  
    try{
  
      const editor = await editorModel.findByCredentials(user_id, pswd)
  
      if(!editor){
        throw new Error()
      }
  
      const token = await editor.generateAuthToken(req, res)
      res.redirect('/editor/home')
    }catch(e){
      req.flash("error",["Please check UserID / Password"])
      res.render('blog_editor',{alerts:req.flash('error')})
    }
   
})

router.route('/create').post((req, res) => {
    const editor = new editorModel({
      user_id: req.body.user_id,
      pswd: req.body.pswd,
    })
  
    editor.save((err, user) => {
      if (err) {
        res.json(err);
      }else{
        res.status(200).json("Succesfully created")
      }
    })
})

router.route('/home').get(editorAuth, async (req, res) => {
  try {
    const blogs = await blogModel.find({owner: req.editor._id})
    res.render('view_blogs_editor', { alerts: req.flash('error'),blogs: blogs,page_name:'home'})
  } catch (e) {
    req.flash('error', e.message)
    res.redirect('/editor')
  }
})

router.route('/logout').get(editorAuth, async (req, res) => {
  try {
    req.editor.tokens = req.editor.tokens.filter((token) => {
      return token.token !== req.token
    })

    await req.editor.save()
    res.redirect('/editor')
  } catch (e) {
    req.flash('error', e.message)
    res.render('blog_editor', { alerts: req.flash('error'),page_name:'home'})
  }
})

router.route('/blog/edit/:id').get(editorAuth,(req,res)=>{
  blogModel.findById(req.params.id)
  .then(blog=>{
    res.render('update_blog_editor',{alerts: req.flash('error'),id:req.params.id,blog:blog,page_name:'home'})
  }).catch(e=>{
    req.flash('error', e.message)
    res.redirect('/editor/home')
  })
})

router.route('/blog/edit/:id').post(editorAuth, uploadf.fields([{name:'file_attachment[]',maxCount:40}]), (req, res)=>{
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
        extract:req.body.extract, 
        chief_guest_url : chief_guest_url,
        award_winners : req.body.award_winners,
        summary : req.body.summary,
        featured : vfeatured,
        outside_links : outside_links,
        file_attachment : file_attachment,
        video_links : video_links,
        documentIDs:documentIDs,
        published : vpublished,
        keywords : tags,
      }
    }
    else{
      var evsum= {
        gallery : pics_url,
        title : req.body.title,                          
        category:req.body.category,      
        extract:req.body.extract,                    
        chief_guest : req.body.chief_guest,
        award_winners : req.body.award_winners,                    
        summary : req.body.summary,
        featured : vfeatured,
        outside_links : outside_links,
        file_attachment : file_attachment,
        video_links : video_links,
        documentIDs:documentIDs,
        published : vpublished,
        keywords : tags,
      }
    }
  }
  else{
  if(req.body.pics_url_links)
  pics_url_links=(req.body.pics_url_links).filter(Boolean);
  if(req.body.documentIDs){
    documentIDs = JSON.parse(req.body.documentIDs); 
  }
  if(req.body.tags){
    tags = JSON.parse(req.body.tags); 
  }
  deletequeue = documentIDs.filter(k =>!pics_url_links.includes(k[0]));
  documentIDs = documentIDs.filter(k => pics_url.includes(k[0])); 
  var evsum= {
      gallery : pics_url_links,
      category:req.body.category,
      title : req.body.title,                          
      extract: req.body.extract,
      chief_guest : req.body.chief_guest,
      award_winners : req.body.award_winners,
      summary : req.body.summary,
      featured : vfeatured,
      outside_links : outside_links,
      file_attachment : file_attachment_links,
      video_links : video_links,
      documentIDs:documentIDs,
      published : vpublished,
      keywords : tags,
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
        req.flash("error",e.message)
        res.redirect('/editor/home')       })
    }
    if(deletequeue.length>0){
      var arrPromises = deletequeue.map((path) => 
      {if (req.app.locals.gfs) {
        req.app.locals.gfs.delete(new mongoose.Types.ObjectId(path[1]))
        }
      }
      );
      Promise.all(arrPromises)
        .then((arrdata) => {res.redirect('/editor/home')})
        .catch(function (err) {
          req.flash("error",["Alert : Delete failed on some images."])
          res.redirect('/editor/home')
        });
    }
    else{
      res.redirect('/editor/home')
    }    }).catch(err => {
    req.flash("error",err.message)
    res.redirect('/editor/home')      })
});

router.route('/blog/details/:id').get(editorAuth,(req,res)=>{
  blogModel.findById(req.params.id)
  .then((blog)=>{
    res.render('details_blog_editor',{alerts: req.flash('error'),blog:blog,page_name:'home'})
  }).catch(e=>{
    req.flash('error', e.message)
    res.redirect('/editor/home')
  })
})

router.route('/blog/delete/:id').get(editorAuth, (req,res)=>{
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
            
            res.redirect('/editor/home'))
          .catch(function (err) {
            req.flash("error",["Alert : Delete failed on some images."])
            res.redirect('/editor/home')
          });
      }
      else{
        res.redirect('/editor/home')
      }
    }
    else
    res.redirect('/editor/home')

  }).catch(err=>{
    req.flash("error",err.message)
    res.redirect('/editor/home')
  })
})

module.exports = router