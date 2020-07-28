const router = require('express').Router()
const achievementModel = require('../models/Achievement.model')
const {upload, uploadf}= require('../db/upload')
const mongoose = require('mongoose')
const adminAuth = require('../middleware/adminAuth');
const _ = require('lodash');
const MonkeyLearn = require('monkeylearn')
const ml = new MonkeyLearn('8b8701a6b32bfe7d6f749095ee6d31123b267daf')
const moment = require('moment')
let model_id = 'ex_YCya9nrn'
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const document = new JSDOM(`<!DOCTYPE html><p>Text Parser</p>`).window.document;

// for rendering achievement create page
router.route('/create/').get(adminAuth, (req, res) => {
    res.render('create_achievement', { alerts: req.flash('error'),page_name:"achievements"})
})

// route to create achievement
router.route('/create/').post(adminAuth, upload.any('snapshot_url', 20), (req, res) => {
    var pics_url = []
    var documentIDs = []
    if (req.files != undefined) {
      pics_url = req.files.map((file) => {
        return file.filename
      })
      req.files.forEach(function (file,index) {
        documentIDs[index]=[file.filename,file.id];
      })
    }
    let DOMelement = document.createElement('span');
    DOMelement.innerHTML = req.body.des;
    let cleanText=  DOMelement.textContent || DOMelement.innerText;
    ml.extractors.extract(model_id,[cleanText]).then(resp => {
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
    var acheievement = new achievementModel({
      title: req.body.title,
      caption: req.body.caption,
      description: req.body.des,
      pics_url: pics_url,
      documentIDs:documentIDs,
      keywords : tags
    })
  
    acheievement.save((err, ach) => {
      if (err) {
        req.flash("error",err.message)
      }
      res.redirect('/achievements/view_all')
    })
  })
})

// route for rendering achievement update page
router.route('/update/:id').get(adminAuth, (req, res) => {
    achievementModel.findById(req.params.id)
      .then(ach => {
        res.render('update_achievement', { alerts: req.flash('error'), ach: ach, page_name:"achievements" })
      }).catch(err => {
        req.flash("error",err.message)
        res.redirect('/achievements/view_all')      })
})

// route to update achievement
router.route('/update/:id').post(adminAuth, upload.any('pics', 20), (req, res) => { // for updating the achievement of a given id
    const id = req.params.id
    var pics_url=[],documentIDs=[],pics_url_links=[],masterqueue=[],deletequeue=[];
    if(req.body.documentIDs){
      documentIDs = JSON.parse(req.body.documentIDs); 
    }
    if(req.body.tags){
      tags = JSON.parse(req.body.tags); 
    }
    if(req.body.pics_url_links)
    pics_url_links=(req.body.pics_url_links).filter(Boolean);
    if (req.files != undefined) {
      pics_url = req.files.map((file) => {
        return file.filename
      })
      req.files.forEach(function (file,index) {
        masterqueue[index]=[file.filename,file.id];
      })
    }
    masterqueue=masterqueue.concat(documentIDs);
    pics_url = pics_url.concat(pics_url_links);
    documentIDs =masterqueue.filter(k => pics_url.includes(k[0])); 
    deletequeue = masterqueue.filter(k =>!pics_url.includes(k[0]));

    var achievement = {
      title: req.body.title,
      caption: req.body.caption,
      description: req.body.des,
      pics_url: pics_url,
      documentIDs:documentIDs,
      keywords : tags
    }
  
    achievementModel.findByIdAndUpdate(id, achievement)
      .then(() => {
        if(deletequeue.length>0){
          var arrPromises = deletequeue.map((path) => 
          {if (req.app.locals.gfs) {
            req.app.locals.gfs.delete(new mongoose.Types.ObjectId(path[1]))
            }
          }
          );
          Promise.all(arrPromises)
            .then((arrdata) => {res.redirect('/achievements/view_all')})
            .catch(function (err) {
              req.flash("error",["Alert : Delete failed on some images."])
              res.redirect('/achievements/view_all')
            });
        }
        else{
          res.redirect('/achievements/view_all')
        }
      }).catch(err => {
        req.flash("error",err.message)
        res.redirect('/achievements/view_all')      })
})

// route to delete achievement
router.route('/delete/:id').get(adminAuth, (req, res) => {
    const achievement_id = req.params.id
    achievementModel.findByIdAndDelete(achievement_id)
      .then((data) => {
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
              .then((arrdata) => {res.redirect('/achievements/view_all')})
              .catch(function (err) {
                req.flash("error",["Alert : Delete failed on some images."])
                res.redirect('/achievements/view_all')
              });
          }
          else{
            res.redirect('/achievements/view_all')
          }
        }
        else
        res.redirect('/achievements/view_all')
      }).catch(err => {
        req.flash("error",err.message)
        res.redirect('/achievements/view_all')      })
})
router.route('/err').get(adminAuth, (req, res) => {
  achievementModel.find()
  .then(achievements => {
      res.render('view_achievements', { alerts: req.flash('error'), achievements , page_name:"achievements"})
  })
})
// route to view all achievemnts
router.route('/view_all').get(adminAuth, (req, res) => {
    achievementModel.find().sort({createdAt:-1})
    .then(achievements => {
        res.render('view_achievements', { alerts: req.flash('error'), achievements , page_name:"achievements", moment:moment})
    })
})

router.route('/details/:id').get(adminAuth,(req,res)=>{
  achievementModel.findById(req.params.id)
  .then(achievement=>{
    res.render('details_achievements',{alerts: req.flash('error'),achievement:achievement, page_name:"achievements", moment:moment})
  }).catch(err=>{
    res.jaon(err)
  })
})

module.exports = router