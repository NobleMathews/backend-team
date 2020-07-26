const router = require('express').Router()
const blogModel = require('../models/Blog.model')
const editorModel = require('../models/Editor.model')
const {upload, uploadf}= require('../db/upload')
const editorAuth = require('../middleware/editorAuth')


router.route('/login').post(async (req, res) => {
  
  
    const user_id = req.body.user_id
    const pswd = req.body.pswd
  
    try{
  
      const editor = await editorModel.findByCredentials(user_id, pswd)
  
      if(!editor){
        throw new Error()
      }
  
      const token = await editor.generateAuthToken(req, res)
      const blogs = await blogModel.find({owner: editor._id})
      res.render('view_blogs_editor', { alerts: req.flash('error'),user : editor,blogs: blogs,page_name:'home'})
  
    }catch(e){
      console.log(e)
      res.render('blog_editor',{alerts:req.flash("Please check UserID / Password")})
    }
   
})

router.route('/create').post( (req, res) => {
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

router.route('/logout').get(editorAuth, async (req, res) => {
  try {
    req.editor.tokens = req.editor.tokens.filter((token) => {
      return token.token !== req.token
    })

    await req.editor.save()
    res.redirect('/editor')
  } catch (e) {
    req.flash('error', e)
    res.render('blog_editor', { alerts: req.flash('error') })
  }
})

router.route('/blog/edit/:id').get(editorAuth,(req,res)=>{
  blogModel.findById(req.params.id)
  .then(blog=>{
    res.render('update_blog_editor',{blog:blog})
  }).catch(err=>{
    res.json(err)
  })
})

router.route('/blog/edit/:id').post(editorAuth,(req,res)=>{})

router.route('/blog/details/:id').get(editorAuth,(req,res)=>{
  blogModel.findById(req.params.id)
  .then((blog)=>{
    res.render('details_blog_editor',{blog:blog})
  }).catch(err=>{
    res.json(err);
  })
})

router.route('/blog/delete/:id').post(editorAuth,(req,res)=>{})

module.exports = router