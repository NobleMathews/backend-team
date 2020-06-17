const router = require('express').Router()
const Users = require('../models/Users')
const Events = require('../models/Event')
const moment = require('moment')
var upload = require('./images');

var sess



// <form method="POST" action="/users/profile/image/upload/<%=id%>"
// invoked from form to upload
router.route('/profile/image/upload/:id').post( upload.single('file'), (req, res) => {
  const id = req.params.id
  // Sending back file name to server
  // console.log(req.file);
  res.redirect(`/users/profile/image/update?id=${id}&url=${req.file.filename}`)
  // res.json({file:req.file});
})

module.exports = router
