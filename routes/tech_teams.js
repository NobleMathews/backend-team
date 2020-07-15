const router = require('express').Router()
const techTeamModel = require('../models/TechTeam.model')
const {upload, uploadf}= require('../db/upload')
const mongoose = require('mongoose')
const adminAuth = require('../middleware/adminAuth');

router.route('/create').get(adminAuth, (req, res) => {
})

router.route('/create/').post(adminAuth, (req, res) => {
})

router.route('/update/:id').get(adminAuth, (req,res)=>{
})

router.route('/update/:id').post(adminAuth, (req, res) => {
})

router.route('/delete/:id').get(adminAuth, (req, res) => {
})

router.route('/view_all').get(adminAuth, (req, res) => {
})

module.exports = router