const router = require('express').Router();
let Profile = require('../models/profile.model');

router.route('/:user_id').get((req,res)=>{

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

router.route('/update/:id').post((req,res)=>{
    const id = req.params.id;
    const change={
        pswd : req.body.pswd,
        name:req.body.name,             
        contact:req.body.contact,
        email_id:req.body.email_id
    }
    Profile.findByIdAndUpdate(id,change)
    .then((user)=>{
        res.redirect('/users/profile');
    });
});
// setup the method on startup in server.js to get gfs set
//
// app.post('/upload', upload.single('file'), (req, res) => {
//     res.sendStatus(200);
// });
router.route("/image/:filename").get((req, res) => {
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