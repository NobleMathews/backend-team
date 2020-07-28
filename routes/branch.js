const branchModel = require('../models/Branch.model')
const router = require('express').Router()
const adminAuth = require('../middleware/adminAuth');

//Create form render
router.route('/create').get(adminAuth,(req,res)=>{
    res.render('create_branch',{alerts:req.flash('error'),page_name:'branch'})
})

//Post create form route for creating branch
router.post('/create').post(adminAuth,(req,res)=>{
    var branch = new branchModel({
        name:req.body.name
    })
    branch.save((err)=>{
        if(err){
            req.flash("error:",err.message)
        }
        res.redirect('/branch/view_all')
    })
})

//Edit form render 
router.route('/edit/:id').get(adminAuth,(req,res)=>{
    branchModel.findById(req.params.id)
    .then(branch=>{
        res.render('edit_branch',{alerts:req.flash('error'),branch:branch,page_name:'branch'})
    })
    .catch(err=>{
        req.flash('error:',err.message)
        res.redirect('/branch/view_all')
    })
})

//Post edit form render for editing branch
router.route('/edit/:id').post(adminAuth,(req,res)=>{
    const id = req.params.id
    branchModel.findById(id)
    .then(branch => {
      branch.name = req.body.name;
      branch.save()
        .then(() => res.redirect('/branch/view_all'))
        .catch(err => req.flash('error:',err.message));
    })
    .catch(err => {
        req.flash('error:',err.message)
        res.redirect('/branch/view_all')
    });
})

// route to view all branches
router.route('/view_all').get(adminAuth, (req, res) => {
    branchModel.find()
    .then(branch => {
        res.render('view_branches', { alerts: req.flash('error'), branch:branch , page_name:'branch'})
    })
    .catch(err=>{
        res.json(err)
    })
})