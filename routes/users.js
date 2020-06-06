const router = require('express').Router();
let Users = require('../models/Users');
let Event = require('../models/Event');

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

router.route('/profile/:user_id').get((req,res)=>{

    const user_id =req.params.user_id;  
    const user={user_id:user_id};
    // ○	Name
    // ○	Contact number
    // ○	Email_id
    // ○	User_id
    // ○	Pswd
    // ○	Profile_pic

    // turn on the projections as per necessity
    Users.find(user,{club_head:0,club_name:0,createdAt:0,updatedAt:0})
    .then(user=>{
        if(user.length===1){  
            //shouldn't happen since it would mean user is at profile page without even signing up o.O
            if(user[0].name){
                /// The following are state variables to be used within react
                res.send(user[0]);
            }
            else{
                // front end -> updater view
                res.render('updateprof',{"id":user[0]._id,"user_id":user[0].user_id});

            }
        }
        else{
            res.redirect('/');
        }
    }).catch((err)=>{
        res.json('Error: '+err);
    })
});

//<form method="POST" action="/profile/update/<%=id%>"

router.route('/profile/update/:id').post((req,res)=>{
    const id = req.params.id;
    const change={
        pswd : req.body.pswd,
        name:req.body.name,             
        contact:req.body.contact,
        email_id:req.body.email_id
    }
    Users.findByIdAndUpdate(id,change)
    .then((user)=>{
        res.redirect('/users/profile');
    });
});

router.route('/profile/image/update/').post((req,res)=>{
    const id = req.query.id;
    const url = req.query.url;
    const change={
        dp_url:url
    }
    Users.findByIdAndUpdate(id,change)
    .then((user)=>{
        res.sendStatus(200);
    });
});

router.route('/add_event/:user_id').get((req,res)=>{
    const u_id = req.params.user_id;
    Users.findOne({user_id:u_id})
    .then((user)=>{
        if(user.club_head){
            res.redirect(`/users/add_event/${user._id}/add_event/${user.club_name}`)
        }
        else{
            res.send('you are not club head');
        }
    }).catch(err=>{
        console.log(err);
    })
});

router.route('/add_event/:club_head_id/add_event/:club_name').get((req,res)=>{
    const club_name = req.params.club_name;
    const club_head_id = req.params.club_head_id;
    res.render('add_event',{club_name:club_name,club_head_id:club_head_id});
});

router.route('/add_event/:club_head_id/add_event/:club_name/add').post((req,res)=>{
    const club_name = req.params.club_name;
    const club_head_id = req.params.club_head_id;
    const event_name = req.body['event_name'];
    const event_date = req.body['event_date'];
    const event_venue = req.body['event_venue'];
    const p_url = req.body['p_url'];
    const categories = req.body['categories'];
    const description = req.body['description'];
    const speaker = req.body['speaker'];

    const event = new Event({
        name:event_name,
        venue:event_venue,
        date:event_date,
        description:description,
        poster_url:p_url,
        owner:club_head_id,
        categories:categories,
        speaker:speaker,
        
    });

    event.save((err,event) => {
        if (err) throw err;
        console.log(event);
        
    });

    Event.findById(event._id)
    .populate('owner')
    .exec((err,event)=>{
        if (err) throw err;
        console.log(event);   
    })

    Users.findById(club_head_id)
    .then((user)=>{
        res.redirect(`/users/add_event/${user.user_id}`)
    })
    .catch((err)=>console.log((err))
    )
    
});


module.exports = router;