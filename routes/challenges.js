const router = require('express').Router()
const challengeModel = require('../models/Challenge.model')
const branchModel = require('../models/Branch.model')
const {upload, uploadf}= require('../db/upload')
const moment = require('moment');
const adminAuth = require('../middleware/adminAuth');
const mongoose = require('mongoose')

router.route('/create/').get(adminAuth, async (req, res) => {
    let arr = await branchModel.find({})
    let branchlist =  arr.map(a => a.name);
    let extraoptions = ["Coding","Open"]
    var options = extraoptions.concat(branchlist)
    res.render('create_challenge', { alerts: req.flash('error'),page_name:"challenge",options:options})
})

router.route('/create').post(adminAuth,upload.single('photo'), (req, res) => {
    let photo_url
    var documentIDs = []
    if (req.file == undefined) {
      photo_url = ' '
    } else {
      photo_url = `${req.file.filename}`
      // req.files.forEach(function (file,index) {
        documentIDs.push([req.file.filename,req.file.id]);
      // })
    }
    const challenge = new challengeModel({
        name: req.body.name,
        description: req.body.description,
        registration_end: req.body.registration_end,
        registration_start: req.body.registration_start,
        ref_url:req.body.ref_url,
        photo: photo_url,
        category: req.body.category,
        documentIDs:documentIDs
      })
    
      challenge.save((err, challenge) => { // saving the challenge in database
        if (err) {
          req.flash("error",err.message)
        }
          res.redirect("/challenges/view_all")
      }) 
})

router.route('/update/:id').get(adminAuth, async (req, res) => {
    const id = req.params.id
    let arr = await branchModel.find({})
    let branchlist =  arr.map(a => a.name);
    let extraoptions = ["Coding","Open"]
    var options = extraoptions.concat(branchlist)
    challengeModel.findById(id)
    .then(challenge=>{
        res.render('update_challenge', { alerts: req.flash('error'),challenge:challenge,moment:moment, page_name:'challenge',options:options })
    }).catch(err=>{
        req.flash("error",err.message)
        res.redirect('/challenges/view_all')
    })
})


router.route('/update/:id').post(adminAuth, upload.single('photo') ,(req, res) => {
    const id = req.params.id;
    var ev,documentIDs=[],deletequeue=[],pics_url=[],masterqueue=[];
    if(req.body.documentIDs){
      documentIDs = JSON.parse(req.body.documentIDs); 
    }
    if (req.file == undefined) {
        ev={
            name: req.body.name,
            description: req.body.description,
            registration_end: req.body.registration_end,
            registration_start: req.body.registration_start,
            ref_url:req.body.ref_url,
            category: req.body.category,
            documentIDs:documentIDs
        }
    } else {
        // req.files.forEach(function (file,index) {
          masterqueue.push([req.file.filename,req.file.id]);
        // })
        pics_url.push(req.file.filename)
        masterqueue=masterqueue.concat(documentIDs);
        documentIDs =masterqueue.filter(k => pics_url.includes(k[0])); 
        deletequeue = masterqueue.filter(k =>!pics_url.includes(k[0]));
        ev={
            name: req.body.name,
            description: req.body.description,
            registration_end: req.body.registration_end,
            registration_start: req.body.registration_start,
            ref_url:req.body.ref_url,
            category: req.body.category,
            documentIDs:documentIDs,
            photo:`${req.file.filename}`,
      }
    }

    challengeModel.findOne({_id: id},function(err,challenge){
      if(err) {
        req.flash("error",err.message)
        return res.redirect('/challenges/view_all')
      }
        for (var id in ev ){
          challenge[id]= ev[id];
        }
        challenge.save(function(err){
          if (err) {
          req.flash("error",err.message)
          }
          if(deletequeue.length>0){
            var arrPromises = deletequeue.map((path) => 
            {if (req.app.locals.gfs) {
              req.app.locals.gfs.delete(new mongoose.Types.ObjectId(path[1]))
              }
            }
            );
            Promise.all(arrPromises)
              .then((arrdata) => {res.redirect('/challenges/view_all')})
              .catch(function (err) {
                req.flash("error",["Alert : Delete failed on some images."])
                res.redirect('/challenges/view_all')
              });
          }
          else{
            res.redirect('/challenges/view_all')
          }        
        })
    });
})

router.route('/delete/:id').get(adminAuth, (req,res)=>{
    const id = req.params.id
    challengeModel.findOne({_id: id},function(err,challenge){
      if(err) {
        req.flash("error",err.message)
        return res.redirect('/challenges/view_all')
      }
        challenge.remove();
        let data = challenge;
        if(data.documentIDs){
          deletequeue = data.documentIDs;
          if(deletequeue.length>0){
            var arrPromises = deletequeue.map((path) => 
            {if (req.app.locals.gfs) {
              req.app.locals.gfs.delete(new mongoose.Types.ObjectId(path[1]))
              }
            }
            );
            Promise.all(arrPromises)
              .then((arrdata) => {
                challengeModel.find({})
                .then(challenges => {
                return res.render('view_challenges', { alerts: req.flash('error'), challenges: challenges, moment: moment, page_name: 'challenges' })
                }).catch((err) => {
                  req.flash("error",err.message)
                  return res.redirect('/challenges/view_all')        })
              })
              .catch(function (err) {
                req.flash("error",["Alert : Delete failed on some images."])
                res.redirect('/challenges/view_all')
              });
          }
          else{
            res.redirect('/challenges/view_all')
          }
        }
    });
})

router.route('/view_all').get(adminAuth, (req, res) => {
    challengeModel.find({}).sort({registration_end:-1})
      .then(challenges => {
        res.render('view_challenges', { alerts: req.flash('error'),challenges: challenges, moment: moment, page_name:'challenge' })
      }).catch((err) => {
        req.flash("error",err.message)
        res.redirect('/admin/profile')
      })
})



module.exports = router
