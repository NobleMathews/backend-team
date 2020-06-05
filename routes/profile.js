const router = require('express').Router();
let Profile = require('../models/profile.model');

router.route('/:user_id').get((req,res)=>{
    // const user_id =req.query.id;   // probably not intended since this needs to be called from axios within react
    // console.log(user_id);
    // const user={_id:user_id};

    const user_id =req.params.user_id;  
    const user={user_id:user_id};
    // ○	Name
    // ○	Contact number
    // ○	Email_id
    // ○	User_id
    // ○	Pswd
    // ○	Profile_pic

    // turn on the projections as per necessity
    Profile.find(user,{club_head:0,club_name:0,createdAt:0,updatedAt:0})
    .then(user=>{
        if(user.length===1){  //shouldn't happen since it would mean user is at profile page without even signing up o.O

            if(user[0].name){
                /// The following are state variables to be used within react
                res.send(user[0]);
            }
            else{
                // front end -> updater view
                // res.redirect(`/profile/${user[0].user_id}`);
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

// Handle the 404 and bring up a profile creator form
//<form method="POST" action="/profile/update/<%=id%>"

router.route('/update/:id').post((req,res)=>{
    const id = req.params.id;
    const change={
        // pswd : req.body.pswd,          /// assuming password and dob have a seperate updation due to being login parameters 
        // dob : req.body.dob,           ///  ¯\_(ツ)_/¯ should probably combine into one view for all parameters or remove common factors from doc
        name:req.body.name,             /// unless being used for reauth
        contact:req.body.contact,
        email_id:req.body.email_id,
        dp_url:req.body.dp_url
    }
    Profile.findByIdAndUpdate(id,change)
    .then((user)=>{
        res.redirect('/users/profile');   //since /profile in use for updating passw might be good to rename that route
    })
})

module.exports = router;