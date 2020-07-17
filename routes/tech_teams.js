const router = require('express').Router()
const techTeamModel = require('../models/TechTeam.model')
const { upload, uploadf } = require('../db/upload')
const mongoose = require('mongoose')
const adminAuth = require('../middleware/adminAuth')

router.route('/create').get(adminAuth,(req, res) => {
  res.render('create_tech_team',{page_name:"tech_teams"})
})

router.route('/create/').post(adminAuth, uploadf.fields([{name:'team_poster_url',maxCount:1},{name:'dp_url',maxCount:1}]), (req, res) => {
  var dp_url="",team_poster_url="",documentIDs=[];
  if (req.files != undefined) {
  if(req.files['team_poster_url'])
  {
    let file=req.files['team_poster_url'][0]
    team_poster_url=file.filename;
    documentIDs.push([file.filename,file.id]);  
  }
  if(req.files['dp_url'])
  {
    let file=req.files['dp_url'][0]
    dp_url=file.filename;
    documentIDs.push([file.filename,file.id]);  
  }
  }
  var TechTeam = new techTeamModel({
    team_name: req.body.team_name,
    tech_head: req.body.tech_head,
    contact: req.body.contact,
    dp_url: dp_url,
    email_id: req.body.email_id,
    ref_link: req.body.ref_link,
    description: req.body.description,
    team_poster_url: team_poster_url,
    documentIDs:documentIDs
  })
  TechTeam.save((err, club) => {
    if (err) { req.flash('error', err.message) }
    res.redirect('/tech_teams/view_all')
  })
})

router.route('/update/:id').get(adminAuth,(req, res) => {

  techTeamModel.findById(req.params.id)
  .then((team)=>{
    res.render('update_tech_team',{page_name:"tech_teams",team:team})
  }).catch((err)=>{
    if (err) { req.flash('error', err.message) }
    res.redirect('/tech_teams/view_all')
    })

})

router.route('/update/:id').post(adminAuth,uploadf.fields([{name:'team_poster_url',maxCount:1},{name:'dp_url',maxCount:1}]), (req, res) => {
  let dp_url=req.body.dp_url_l,team_poster_url=req.body.team_poster_url_l;
  var documentIDs = [],masterqueue=[],pics_url=[]
  if(req.body.documentIDs){
    documentIDs = JSON.parse(req.body.documentIDs); 
  }
  if (req.files != undefined) {
    if(req.files['team_poster_url'])
    {
      let file=req.files['team_poster_url'][0]
      team_poster_url=file.filename;
      masterqueue.push([file.filename,file.id]);  
    }
    if(req.files['dp_url'])
    {
      let file=req.files['dp_url'][0]
      dp_url=file.filename;
      masterqueue.push([file.filename,file.id]);  
    }
    }
  pics_url.push(dp_url)
  pics_url.push(team_poster_url)
  masterqueue=masterqueue.concat(documentIDs);
  documentIDs =masterqueue.filter(k => pics_url.includes(k[0])); 
  deletequeue = masterqueue.filter(k =>!pics_url.includes(k[0]));

  var change = {
    team_name: req.body.team_name,
    tech_head: req.body.tech_head,
    contact: req.body.contact,
    dp_url: dp_url,
    email_id: req.body.email_id,
    ref_link: req.body.ref_link,
    description: req.body.description,
    team_poster_url: team_poster_url,
    documentIDs:documentIDs
  }
  techTeamModel.findByIdAndUpdate(req.params.id, change)
  .then(()=>{
    if(deletequeue.length>0){
      var arrPromises = deletequeue.map((path) => 
      {if (req.app.locals.gfs) {
        req.app.locals.gfs.delete(new mongoose.Types.ObjectId(path[1]))
        }
      }
      );
      Promise.all(arrPromises)
        .then((arrdata) => {res.redirect('/tech_teams/view_all')})
        .catch(function (err) {
          req.flash("error",["Alert : Delete failed on some images."])
          res.redirect('/tech_teams/view_all')      
        });
    }
    else{
      res.redirect('/tech_teams/view_all')      
    }
  })
  .catch((err) => {
    req.flash("error",err.message)
    res.redirect('/tech_teams/view_all')      
  })
})

router.route('/delete/:id').get(adminAuth, (req, res) => {
  const team_id = req.params.id
  techTeamModel.findByIdAndDelete(team_id)
    .then((data) => { 
        deletequeue = data.documentIDs;
        if(deletequeue.length>0){
          var arrPromises = deletequeue.map((path) => 
          {if (req.app.locals.gfs) {
            req.app.locals.gfs.delete(new mongoose.Types.ObjectId(path[1]))
            }
          }
          );
          Promise.all(arrPromises)
            .then((arrdata) => {res.redirect('/tech_teams/view_all')})
            .catch(function (err) {
              req.flash("error",["Alert : Delete failed on some images."])
              res.redirect('/tech_teams/view_all')      
            });
        }
        else{
          res.redirect('/tech_teams/view_all')      
        }
    }).catch(err => {
      req.flash("error",err.message)
      res.redirect('/tech_teams/view_all')      
    })
  })

router.route('/view_all').get(adminAuth, (req, res) => {
  techTeamModel.find({},(err,tech_teams)=>{
      if(err){
          req.flash("error",err.message)
          res.redirect('/tech_teams/view_all')
      }else{
          res.render('view_tech_teams',{tech_teams:tech_teams,alerts: req.flash('error'), page_name:"tech_teams"})
      }
  })
})
module.exports = router
