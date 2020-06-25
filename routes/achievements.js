const router = require('express').Router()
const achievementModel = require('../models/Achievement.model')
const {upload, uploadf}= require('../db/upload')
const adminAuth = require('../middleware/adminAuth');

// for rendering achievement create page
router.route('/create/').get(adminAuth, (req, res) => {
    res.render('create_achievement', {page_name:"achievements"})
})

// route to create achievement
router.route('/create/').post(adminAuth, upload.any('snapshot_url', 20), (req, res) => {
    var pics_url = []
  
    if (req.files != undefined) {
      pics_url = req.files.map((file) => {
        return file.filename
      })
    }
  
    var acheievement = new achievementModel({
      title: req.body.title,
      caption: req.body.caption,
      description: req.body.des,
      pics_url: pics_url
    })
  
    acheievement.save((err, ach) => {
      if (err) res, json(err)
      res.redirect('/achievements/view_all')
    })
})

// route for rendering achievement update page
router.route('/update/:id').get(adminAuth, (req, res) => {
    achievementModel.findById(req.params.id)
      .then(ach => {
        res.render('update_achievement', { ach: ach, page_name:"achievements" })
      }).catch(err => {
        res.status(404).send('Does nit exist')
      })
})

// route to update achievement
router.route('/update/:id').post(adminAuth, upload.any('pics', 20), (req, res) => { // for updating the achievement of a given id
    const id = req.params.id
    var pics_url
    if (req.files != undefined) {
      pics_url = req.files.map((file) => {
        return file.filename
      })
    }
  
    var achievement = {
      title: req.body.title,
      caption: req.body.caption,
      description: req.body.des,
      pics_url: pics_url
    }
  
    achievementModel.findByIdAndUpdate(id, achievement)
      .then(() => {
        res.redirect('/achievements/view_all')
      }).catch(err => {
        res.status(400).send(err)
      })
})

// route to delete achievement
router.route('/delete/:id').get(adminAuth, (req, res) => {
    const achievement_id = req.params.id
    achievementModel.findByIdAndDelete(achievement_id)
      .then(() => {
        res.redirect('/achievements/view_all')
      }).catch(err => {
        res.json(err)
      })
})

// route to view all achievemnts
router.route('/view_all').get(adminAuth, (req, res) => {
    achievementModel.find()
    .then(achievements => {
        res.render('view_achievements', { achievements , page_name:"achievements"})
    })
})

module.exports = router