// for rendering achievement create page
router.route('/achievement/create/').get((req, res) => {
    res.render('create_achievement')
})

// route to create achievement
router.route('/achievement/create/').post(upload.any('snapshot_url', 20), (req, res) => {
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
      res.redirect('/admin/achievement/')
    })
})

// route for rendering achievement update page
router.route('/achievement/update/:id').get((req, res) => {
    achievementModel.findById(req.params.id)
      .then(ach => {
        res.render('update_achievement', { ach: ach })
      }).catch(err => {
        res.status(404).send('Does nit exist')
      })
})

// route to update achievement
router.route('/achievement/update/:id').post( upload.any('pics', 20), (req, res) => { // for updating the achievement of a given id
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
        res.status(200).send('Achievement updated successfully')
      }).catch(err => {
        res.status(400).send(err)
      })
})

// route to delete achievement
router.route('/achievements/delete/:id').get((req, res) => {
    const achievement_id = req.params.id
    achievementModel.findByIdAndDelete(achievement_id)
      .then(() => {
        res.redirect('/admin/achievement')
      }).catch(err => {
        res.json(err)
      })
})

// route to view all achievemnts
router.route('/achievement/').get((req, res) => {
    achievementModel.find()
    .then(achievements => {
        res.render('view_achievement', { achievements })
    })
})

