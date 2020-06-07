const router = require('express').Router();
let Event = require('../models/Event');

router.route('/:id').post((req,res)=>{
    const id = req.params.id
    const email = req.body.email
    Event.update({_id:id},{$push:{email}})
})

module.exports = router