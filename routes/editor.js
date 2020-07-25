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
      
  
      res.render('landing_clubHead', { alerts: req.flash('error'),user : user,page_name:'home'})
  
    }catch(e){
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
module.exports = router