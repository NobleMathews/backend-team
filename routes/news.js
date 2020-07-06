const router = require('express').Router()
const newsModel = require('../models/News.model')
const adminAuth = require('../middleware/adminAuth');

// for rendering the create news page
router.route('/create/').get(adminAuth, (req, res) => {
    res.render('create_news', { alerts: '',page_name:'news'})
})

// route to create news
router.route('/create').post(adminAuth,(req, res) => {
    
    var news = new newsModel({
        snippet:req.body.snippet
    })

    news.save((err,news)=>{
        if (err){
            console.log(err);
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
        res.render('update_news', { alerts: '',news:news,page_name:'news'})
    }).catch(err => {
        res.json(err)
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
        res.json(err)
    })

})

// route to delete a news
router.route('/delete/:id').get(adminAuth, (req, res) => { 
    var id = req.params.id;
    newsModel.findByIdAndDelete(id)
    .then(() => {
        res.redirect('/news/view_all');
    }).catch(err=>{
        res.json(err)
    })
})

// for rendering view page of all the news present
router.route('/view_all').get(adminAuth, (req, res) => {
    newsModel.find()
    .then(newss=>{
        res.render('view_news', { alerts: '',newss:newss,page_name:'news'})
    })
})

router.route('/front').get((req,res) => {
    newsModel.find()
    .then(news => {
        res.json(news);
    }).catch(err => {
        res.json(err);
    })
})

module.exports = router