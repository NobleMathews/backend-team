const router = require('express').Router()
const techTeamModel = require('../models/TechTeam.model')
const { upload, uploadf } = require('../db/upload')
const mongoose = require('mongoose')
const adminAuth = require('../middleware/adminAuth')

router.route('/create').get(adminAuth,(req, res) => {
  res.render('create_tech_team',{page_name:"tech_teams"})
})

router.route('/create/').post(adminAuth, uploadf.fields([{name:'team_poster_url',maxCount:1},{name:'dp_url',maxCount:1}]), (req, res) => {
  var dp_url="",team_poster_url="";
  if (req.files != undefined) {
  if(req.files['team_poster_url'])
  team_poster_url=req.files['team_poster_url'][0].filename;
  if(req.files['dp_url'])
  dp_url=req.files['dp_url'][0].filename;
  }
  var TechTeam = new techTeamModel({
    team_name: req.body.team_name,
    tech_head: req.body.tech_head,
    contact: req.body.contact,
    dp_url: dp_url,
    email_id: req.body.email_id,
    ref_link: req.body.ref_link,
    description: req.body.description,
    team_poster_url: team_poster_url
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
    res.json(err);
  })

})

router.route('/update/:id').post(adminAuth, (req, res) => {
  var change = {
    team_name: req.body.team_name,
    tech_head: req.body.tech_head,
    contact: req.body.contact,
    dp_url: req.body.dp_url,
    email_id: req.body.email_id,
    ref_link: req.body.ref_link,
    description: req.body.description,
    team_poster_url: req.body.team_poster_url
  }

  techTeamModel.findByIdAndUpdate(req.params.id, change, (err, result) => {
    if (err) {
      res.status(400).send(err.message)
    }
  }).then(
    res.redirect('/admin/'))
})

router.route('/delete/:id').get(adminAuth, (req, res) => {
  techTeamModel.deleteOne({ _id: req.params.id }, err => {
    res.status(400).send(err.message)
  }).then(
    res.redirect('/admin/'))
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
