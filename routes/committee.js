const router = require('express').Router()
const { upload } = require('../db/upload')
const committeemodel = require('../models/Committee.model')
const adminAuth = require('../middleware/adminAuth')
// const { updateOne } = require('../models/ClubMember.model')

// for rendering the create club members page
router.route('/create/').get(adminAuth, (req, res) => {
  res.render('create_committee_member', { alerts: req.flash('error'), page_name: 'Committee_members' })
})

router.route('/create/').post(adminAuth, upload.single('dp_url'), async (req, res) => {
  let dpurl = ''

  if (req.file != undefined) {
    dpurl = req.file.filename
  }

  const updates = Object.keys(req.body)

  try {
    const member = {}

    updates.forEach((update) => {
      member[update] = req.body[update]
    })
    member.dp_url = dpurl
    const committee = new committeemodel({
      members: member
    })
    // console.log(committee)
    committeemodel.updateOne({ _id: '5f149d11bad71e2d6c7bcb46' }, { $push: { members: member } }, (err, user) => {
      if (err) {
        req.flash('error', err.message)
        res.redirect('/committee_members/view_all')
      } else {
        res.redirect('/committee_members/view_all')
      }
    })
  } catch (err) {
    req.flash('error', err.message)
    res.redirect('/committee_members/view_all')
  }
})

router.route('/update/:id').get(async (req, res) => {
  const member_id = req.params.id
  try {
    committeemodel.findOne({ _id: '5f149d11bad71e2d6c7bcb46' }, (err, member) => {
      if (err) {
        req.flash('error', err.message)
        return res.redirect('/committee_members/view_all')
      }
      member_details = member.members.find(o => { return o._id == member_id })
      res.render('update_committee_member', { alerts: req.flash('error'), member: member_details, page_name: 'Committee_members' })
    })
  } catch (err) {
    req.flash('error', err.message)
    res.redirect('/committee_members/view_all')
  }
})

router.route('/update/:id').post(upload.single('dp'), async (req, res) => {
  const member_id = req.params.id

  let dpurl = req.body.dp_url

  if (req.file != undefined) {
    dpurl = req.file.filename
  }

  const updates = Object.keys(req.body)

  try {
    const member = {}

    updates.forEach((update) => {
      if (update != 'dp') { member[update] = req.body[update] }
    })
    member.dp_url = dpurl

    await committeemodel.findOneAndUpdate({ _id: '5f149d11bad71e2d6c7bcb46', 'members._id': member_id }, { $set: { 'members.$': member } })

    res.redirect('/committee_members/view_all')
  } catch (err) {
    req.flash('error', err.message)
    res.redirect('/committee_members/view_all')
  }
})
router.route('/delete/:id').get(async (req, res) => {
  committeemodel
    .updateOne(
      { _id: '5f149d11bad71e2d6c7bcb46' },
      { $pull: { members: { _id: [req.params.id] } } }, { safe: true }, function (err, user) {
        if (err) {
          req.flash('error', err.message)
          res.redirect('/committee_members/view_all')
        } else {
          res.redirect('/committee_members/view_all')
        }
      })
})

// for rendering view page of all club members
router.route('/view_all').get(async (req, res) => {
  let committee_members
  try {
    committee_members = await committeemodel.findOne({ _id: '5f149d11bad71e2d6c7bcb46' })
    if (committee_members) { res.render('view_committee_members', { alerts: req.flash('error'), members: committee_members.members, page_name: 'Committee_members' }) } else { res.render('view_committee_members', { alerts: req.flash('error'), members: [], page_name: 'Committee_members' }) }
  } catch (error) {
    req.flash('error', err.message)
    res.redirect('/admin/login/')
  }
})

module.exports = router
