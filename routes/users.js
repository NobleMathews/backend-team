const router = require('express').Router();
let Users = require('../models/users.model');
let clubList = require('../models/club_head.model');

router.route('/').post((req,res)=>{
    // console.log(req.body);
    const user_id = req.body.user_id;
    const pswd = req.body.pswd;
    const user={user_id,pswd}
    Users.find(user)
    .then(user=>{
        if(user.length===1){
            res.redirect(`/profile?id=${user[0]._id}`);
        }
        else{
            res.redirect('/');
        }
    }).catch((err)=>{
        res.json('Error: '+err);
    })
});

router.route('/update/:id').post((req,res)=>{
    const id = req.params.id;
    const change={
        // please fill it accordingly
    }
    Users.findByIdAndUpdate(id,change)
    .then((user)=>{
        res.redirect('/');
    })
})

router.route('/add_event/:user_id').get((req,res)=>{
    const u_id = req.params.user_id;
    Users.findOne({user_id:u_id})
    .then((user)=>{
        if(user.club_head){
            res.redirect(`/users/add_event/${u_id}/add_event/${user.club_name}`)
        }
        else{
            res.send('you are not club head');
        }
    }).catch(err=>{
        console.log(err);
    })
});

router.route('/add_event/:club_head/add_event/:club_name').get((req,res)=>{
    const club_name = req.params.club_name;
    const club_head = req.params.club_head;
    res.render('add_event',{club_name:club_name,club_head:club_head});
});

router.route('/add_event/:club_head/add_event/:club_name/add').post((req,res)=>{
    const club_name = req.params.club_name;
    const club_head = req.params.club_head;

    const event_name = req.body['event_name'];
    const event_date = req.body['event_date'];
    const event_venue = req.body['event_venue'];
    const g_link = req.body['g_link'];

    console.log(club_name);
    
    const club = {club_head:'natesh',club_name:'Astronomy'};
    clubList.findOneAndUpdate(club,{$push:{event_list:{
       date:event_date,
       venue:event_venue,
       embed_link:g_link,
       name:event_name, 
    }}},(err,club)=>{
        if (err) throw err;
        console.log(club);
        
    })
    //res.send(`${req.body['event_name']} ${req.body['event_date']} ${req.body['event_venue']} ${req.body['g_link']}`);
});


module.exports = router;