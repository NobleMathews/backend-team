const router = require('express').Router()
const {upload}= require('../db/upload')
const clubMemberModel = require('../models/ClubMember.model')
const clubAuth = require('../middleware/clubAuth')
const { updateOne } = require('../models/ClubMember.model')

// for rendering the create club members page
router.route('/create/').get(clubAuth, (req, res) => {
    res.render('create_club_member', { alerts: '',page_name:'club_members'})
})

// route to create the club members
router.route('/create').post(clubAuth, upload.single('dp_url') ,async  (req, res) => {
    let dpurl = "";

    if (req.file != undefined) {
        dpurl = req.file.filename
    }
    
    const updates = Object.keys(req.body)

    try{

        let member = {}

        updates.forEach((update) => {
        member[update] = req.body[update]
        })
        member["dp_url"] = dpurl
        clubMemberModel.count({owner: req.user.id}, function (err, count){ 
            if(count>0){
                clubMemberModel.updateOne({owner:req.user.id},{$push:{members:member}},(err, user) => {
                    if (err) {
                    res.json(err)
                    }else{
                    res.redirect('/club_members/view_all')
                    }
                    })
            }
            else{
                const club_member = new clubMemberModel({
                    owner: req.user.id,
                    members:member
                  })
                club_member.save((err, user) => {
                if (err) {
                res.json(err)
                }else{
                res.redirect('/club_members/view_all')
                }
                })
            }
        }); 
    }catch(e){
        res.status(400).json(e)
    }

})

// for rendering the club member update page
router.route('/update/:id').get(clubAuth, async (req, res) => {
    const member_id = req.params.id
    let memberv={};
    try {
        clubMemberModel.findOne({owner:req.user._id,"members._id":member_id},function(err,member){
            if(err) return res.status(404).send(err)
            memberv=(member.members).find(o => {return o._id == member_id;})
            console.log(memberv)
            res.render('update_club_member', { alerts: '','member':memberv,page_name:'club_members'})
          });
    } catch (error) {
        res.json(error)
    }
})

// route to update the club member details
router.route('/update/:id').post(clubAuth, upload.single('dp') ,async (req, res) => {

    const member_id = req.params.id

    let dpurl = req.body.dp_url;

    if (req.file != undefined) {
        dpurl = req.file.filename
    }
    
    const updates = Object.keys(req.body)

    try{

        let member = {}

        updates.forEach((update) => {
        if(update!="dp")
        member[update] = req.body[update]
        })
        member["dp_url"] = dpurl

        await clubMemberModel.findOneAndUpdate({owner:req.user._id,"members._id":member_id}, {'$set': {'members.$':member} })

        res.redirect('/club_members/view_all')
    }catch(e){
        res.status(400).json(e)
    }

})

// route to delete club members
router.route('/delete/:id').get(clubAuth, async (req, res) => {
    clubMemberModel
    .updateOne( 
      {owner: req.user.id}, 
      { $pull: {'members':{"_id":[req.params.id] }}}, { safe: true },function(err, user){
        if (err) {
        res.json(err)
        }else{
        console.log(user);
        res.redirect('/club_members/view_all')
        }
    })
})

// for rendering view page of all club members
router.route('/view_all').get(clubAuth, async (req, res) => {
    let club_members;
    try {
        club_members = await clubMemberModel.findOne({owner:req.user._id})
        if(club_members)
        res.render('view_club_members', { alerts: '',members:club_members.members,page_name:'club_members'})
        else
        res.render('view_club_members', { alerts: '',members:[],page_name:'club_members'})
    } catch (error) {
        res.json(error)
    }
})


module.exports = router
