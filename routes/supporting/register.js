const router = require('express').Router();
let eventsModel = require('../../models/Event.model');

router.route('/:id').post((req,res)=>{
    const id = req.params.id
    const email = req.body.email
    
    eventsModel.findById(id)
    .then(event => {

    let i=0;
    for(i=0;i<event.participants.length;i++){
        if(event.participants[i] === email){
            break;
        }
    }

    if(i === event.participants.length){
        event.participants.push(email);
        event.save();
        res.status(200).json("Subscribed");
    }else{
        res.status(200).json("Email already exists");
    }

    }).catch(err => {
        res.status(404).json(err);
    })

    


})

module.exports = router