const router = require('express').Router()
const clubHeadsModel = require('../models/ClubHead.model')
const superAdminModel = require('../models/SuperAdmin.model')
const cookieParser = require('cookie-parser')
const adminAuth = require('../middleware/adminAuth')

// for rendering password page
router.route('/password/change').get(adminAuth, (req, res) => {
  res.render('update_password_admin', { page_name: 'home' })
})

// password changing route
router.route('/password/change/').post(adminAuth, async (req, res) => {
  var pswd = req.body.pswd
  // superAdminModel.findByIdAndUpdate(req.admin._id, { pswd: pswd })
  //   .then(() => {
  //     res.redirect(307, '/admin/profile')
  //   }).catch(err => {
  //     res.json(err)
  //   })

  try {
    req.admin.pswd = pswd
    await req.admin.save()

    res.redirect(307, '/admin/profile')
  } catch (e) {
    res.json(e)
  }
})

// viewing the profile after logging in
router.route('/profile').post(adminAuth, (req, res) => {
  // console.log('already logged in')
  admins = {
    _id: req.admin._id,
    name: req.admin.name,
    user_id: req.admin.user_id,
    email_id: req.admin.email_id,
    contact: req.admin.contact
  }

  return res.render('landing_admin', { admin: admins, page_name: 'home' })
})

// login to admin
router.route('/login').post(async (req, res) => {
  const user_id = req.body.user_id
  const pswd = req.body.pswd
  try {
    // const admin = await superAdminModel.findByCredentials( user_id, pswd )
    const admin = await superAdminModel.findByCredentials(user_id, pswd)

    if (!admin) {
      throw new Error()
    }

    const token = await admin.generateAuthToken(req, res)
    res.render('landing_admin', { admin: admin, page_name: 'home' })
  } catch (e) {
    // res.json(e)
    res.render('index', { alerts: 'Sorry, you do not have admin privileges' })
  }
})

// for rendering the form
router.route('/profile/update').get(adminAuth, async (req, res) => {
  try {
    const admin = req.admin

    res.render('update_profile_admin', { id: admin._id, page_name: 'home', user_id: admin.user_id, name: admin.name, contact: admin.contact, email_id: admin.email_id })
  } catch (e) {
    res.status(400).json(e)
  }
})

// for updating through the form
router.route('/profile/update').post(adminAuth, async (req, res) => {
  const updates = Object.keys(req.body)

  try {
    const admin = req.admin

    updates.forEach((update) => {
      admin[update] = req.body[update]
    })

    await admin.save()

    res.render('landing_admin', { admin: admin, page_name: 'home' })
  } catch (e) {
    res.status(400).json(e)
  }
})

// by this route the club-head values will be set on default which can be changed by thhe club-head later on

router.route('/club_head/reset/:id').get(adminAuth, (req, res) => {
  const club_head_id = req.params.id
  clubHeadsModel.findById(club_head_id)
    .then(user => {
      const l_club_name = user.club_name.toLowerCase()
      clubHeadsModel.findByIdAndUpdate(user._id, {
        pswd: l_club_name,
        name: '',
        contact: '',
        email_id: '',
        dp_url: '',
        bio: ''
      })
        .then(() => {
          res.redirect('/club/view_all')
        }).catch(err => {
          res.json(err)
        })
    }).catch(err => {
      res.json(err)
    })
})

router.route('/logout').get(adminAuth, async (req, res) => {
  try {
    req.admin.tokens = req.admin.tokens.filter((token) => {
      return token.token !== req.token
    })

    await req.admin.save()

    res.redirect('/admin')
  } catch (e) {
    res.json({ e })
  }
})

module.exports = router
