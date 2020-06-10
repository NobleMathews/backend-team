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

//use the following format for update requests in this route
//<form method="POST" action="/users/profile/update/<%=id%>"
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
// body of post request must contain the object id as well as the url saved from gfs
// this is automatically done when invoking the upload image route
router.route('/profile/image/update/').get((req,res)=>{
    const id = req.query.id;
    const url = req.query.url;
    const change={
        dp_url : url
    }
    Users.findByIdAndUpdate(id,change)
    .then((user)=>{
        res.sendStatus(200);
    });
});


//primary route to add event
router.route('/add_event/:user_id').get((req,res)=>{
    
    Users.findOne({user_id:req.params.user_id})
    .then((user)=>{
        //check if the user is club head
        if(user.club_head){
            res.render('add_event',{club_head_id:user._id});
        }
        else{
            res.send('you are not club head');
        }
    }).catch(err=>{
        console.log(err);
    })
});




module.exports = router;