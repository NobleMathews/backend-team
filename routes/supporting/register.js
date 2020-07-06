const router = require('express').Router();
let eventsModel = require('../models/Event.model');

router.route('/:id').post((req,res)=>{
    const id = req.params.id
    const email = req.body.email
    eventsModel.update({_id:id},{$push:{participants:email}})
    .then(res.status(200).json("Subscribed"))
    .catch(err=>{res.json(err)})
})

module.exports = router