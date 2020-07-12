const router = require('express').Router()
const eventsModel = require('../models/Event.model')
const moment = require('moment');
const {upload, uploadf}= require('../db/upload')
const clubAuth = require('../middleware/clubAuth')
const _ = require('lodash');
const { filter } = require('lodash');
const { route } = require('./blog');

router.route('/home').get((req,res)=>{})


// router.route('/club').get((req,res)=>{})
// router.route('/projects').get((req,res)=>{})
// router.route('/challenges').get((req,res)=>{})
// router.route('/blogs').get((req,res)=>{})


module.exports = router;