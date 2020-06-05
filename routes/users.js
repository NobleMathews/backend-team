const router = require('express').Router();
let Users = require('../models/users.model');

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
// setup the method on startup in server.js to get gfs set
//
// app.post('/upload', upload.single('file'), (req, res) => {
//     res.sendStatus(200);
// });
router.route("/profile/image/:filename").get((req, res) => {
    const file = gfs
      .find({
        filename: req.params.filename
      })
      .toArray((err, files) => {
        if (!files || files.length === 0) {
          return res.sendStatus(404);
        }
        gfs.openDownloadStreamByName(req.params.filename).pipe(res);
      });
  });

module.exports = router;