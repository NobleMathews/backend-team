const router = require('express').Router()
const newsModel = require('../models/News.model')
const adminAuth = require('../middleware/adminAuth')
const moment = require('moment')

// for rendering the create news page
router.route('/create/').get(adminAuth, (req, res) => {
    res.render('create_news', { alerts: req.flash('error'),page_name:'news'})
})

// route to create news
router.route('/create').post(adminAuth,(req, res) => {
    
    var news = new newsModel({
        snippet:req.body.snippet
    })

    news.save((err,news)=>{
        if (err){
            req.flash("error",err.message)
            res.redirect('/news/view_all')
            
        }else{
            res.redirect('/news/view_all')
        }
    })
})

// for rendering the news update page
router.route('/update/:id').get(adminAuth, async (req, res) => {
    var id = req.params.id;
    newsModel.findById(id)
    .then(news => {
        res.render('update_news', { alerts: req.flash('error'),news:news,page_name:'news'})
    }).catch(err => {
        req.flash("error",err.message)
res.redirect('/news/view_all')
    })

})

// route to update/edit the news details
router.route('/update/:id').post(adminAuth, async (req, res) => {
    var id = req.params.id;
    
    change = {
        snippet: req.body.snippet
    }
    newsModel.findByIdAndUpdate(id,change)
    .then(news => {
        res.redirect('/news/view_all')
    }).catch(err => {
        req.flash("error",err.message)
res.redirect('/news/view_all')
    })

})

// route to delete a news
router.route('/delete/:id').get(adminAuth, (req, res) => { 
    var id = req.params.id;
    newsModel.findByIdAndDelete(id)
    .then(() => {
        res.redirect('/news/view_all');
    }).catch(err=>{
        req.flash("error",err.message)
res.redirect('/news/view_all')
    })
})

// for rendering view page of all the news present
router.route('/view_all').get(adminAuth, (req, res) => {
    newsModel.find()
    .then(newss=>{
        res.render('view_news', { alerts: req.flash('error'),newss:newss,page_name:'news',moment:moment})
    })
})

router.route('/front').get((req,res) => {
    newsModel.find()
    .then(news => {
        res.json(news);
    }).catch(errf => {
        res.json(errf);
    })
})

module.exports = router