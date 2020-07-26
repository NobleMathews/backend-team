const router = require('express').Router()
const challengeModel = require('../models/Challenge.model')
const {upload, uploadf}= require('../db/upload')
const adminAuth = require('../middleware/adminAuth');


router.route('/create/').get(adminAuth, (req, res) => {
})

router.route('/create').post(adminAuth, (req, res) => {
  
})

router.route('/update').get(adminAuth, async (req, res) => {
    
})


router.route('/update/').post(adminAuth, upload.single('photo') ,async (req, res) => {
    
})

router.route('/delete/:id').delete(adminAuth, (req, res) => { 
})

router.route('/view_all').get(adminAuth, (req, res) => {
    
})




module.exports = router
