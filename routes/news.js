const router = require('express').Router()
const newsModel = require('../models/News.model')
const adminAuth = require('../middleware/adminAuth');

// for rendering the create news page
router.route('/create/').get(adminAuth, (req, res) => {
})

// route to create news
router.route('/create').post(adminAuth,(req, res) => {
})

// for rendering the news update page
router.route('/update').get(adminAuth, async (req, res) => {
})

// route to update/edit the news details
router.route('/update/').post(adminAuth, async (req, res) => {
})

// route to delete a news
router.route('/delete/:id').delete(adminAuth, (req, res) => { 
})

// for rendering view page of all the news present
router.route('/view_all').get(adminAuth, (req, res) => {
})

module.exports = router