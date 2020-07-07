const router = require('express').Router()
const achievementModel = require('../models/Achievement.model')
const {upload, uploadf}= require('../db/upload')
const mongoose = require('mongoose')
const adminAuth = require('../middleware/adminAuth');

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
  
    var acheievement = new achievementModel({
      title: req.body.title,
      caption: req.body.caption,
      description: req.body.des,
      pics_url: pics_url,
      documentIDs:documentIDs
    })
  
    acheievement.save((err, ach) => {
      if (err) {
        console.log(err);
        req.flash("error",err)
      }
      res.redirect('/achievements/view_all')
    })
})

// route for rendering achievement update page
router.route('/update/:id').get(adminAuth, (req, res) => {
    achievementModel.findById(req.params.id)
      .then(ach => {
        res.render('update_achievement', { alerts: req.flash('error'), ach: ach, page_name:"achievements" })
      }).catch(err => {
        req.flash("error",err)
        res.redirect('/achievements/view_all')      })
})

// route to update achievement
router.route('/update/:id').post(adminAuth, upload.any('pics', 20), (req, res) => { // for updating the achievement of a given id
    const id = req.params.id
    var pics_url=[],documentIDs=[],pics_url_links=[],masterqueue=[],deletequeue=[];
    if(req.body.documentIDs){
      documentIDs = JSON.parse(req.body.documentIDs); 
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
      documentIDs:documentIDs
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
              console.log(err);
              req.flash("error",["Alert : Delete failed on some images."])
              res.redirect('/achievements/view_all')
            });
        }
        else{
          res.redirect('/achievements/view_all')
        }
      }).catch(err => {
        console.log(err);
        req.flash("error",err)
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
                console.log(err);
                req.flash("error",["Alert : Delete failed on some images."])
                res.redirect('/achievements/view_all')
              });
          }
        }
        else
        res.redirect('/achievements/view_all')
      }).catch(err => {
        console.log(err)
        req.flash("error",err)
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
    achievementModel.find()
    .then(achievements => {
        res.render('view_achievements', { alerts: req.flash('error'), achievements , page_name:"achievements"})
    })
})

module.exports = router