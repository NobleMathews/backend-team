const router = require('express').Router()
const blogModel = require('../models/Blog.model')
const clubModel = require('../models/Club.model')
const projectsModel = require('../models/Project.model')
const clubMemberModel = require('../models/ClubMember.model')
const clubHeadsModel = require('../models/ClubHead.model')
const eventsModel = require('../models/Event.model')
const moment = require('moment');
const clubAuth = require('../middleware/clubAuth')
const _ = require('lodash');
const { filter } = require('lodash');
const { route } = require('./blog');

router.route('/home').get((req,res)=>{})
// takes club_name case insensitive
router.route('/club/:club').get((req,res)=>{
    const club_name = req.params.club.toUpperCase()
    clubModel.findOne({name:club_name})
      .then(club => {
        clubHeadsModel.findById(club.head,{tokens:0})
        .then(club_head=>{
          clubMemberModel.find({owner:club.head},{owner:0,_id:0,__v:0,createdAt:0,updatedAt:0})
          .then(members=>{res.json({
            'Club name':club.name,
            'Club Description':club.description,
            'Club logo_url':club.logo_url,
            'Club Object_ID':club._id,
            'Club Head name':club_head.user_id,
            'Club Head dp_url':club_head.dp_url,
            'Club Head bio':club_head.bio,
            'Club Head contact':club_head.contact,
            'Club Head email_id':club_head.email_id,
            'Member details':members
          }).catch(err=>{res.json(err)})
        }).catch(err=>{
          res.json(err)
        })
      }).catch(err=>{
        res.json(err)
      })
  }).catch(err=>{
    res.json(err)
  })
})  
//route for front end to render gallery strings of club_head blog
router.route('/gallery/:club_name').get((req,res)=>{
const club_name = req.params.club_name.toUpperCase();
clubModel.findOne({name:club_name},{_id:0})
.then(club => {
    console.log(club)
    blogModel.find({owner:club.head},{gallery:1,_id:0})
    .then(blog=>{
        res.json({'gallery_strings':blog})
    }).catch(err => {res.json(err)})
}).catch(err => {res.json(err)})
})
// take multiple chainable queries branch club degree and search queries /?=...&..
router.route('/projects').get(async (req,res)=>{

if(Object.keys(req.query).length==0){
    projectsModel.find().limit(30)
    .then(project=>res.json(project))
    .catch(err=>res.json(err))
}
else{
    
    let branch_name = req.query['branch'] 
    let club_name = req.query['club'] 
    let deg_name = req.query['degree'] 
    let query_string = req.query['query_string']
    let filters={
    branch:  branch_name==undefined? /.*/ : branch_name,
    club: club_name==undefined? /.*/ : club_name,
    degree: deg_name==undefined? /.*/ : deg_name,
    $text: {$search: query_string}
    }
    query_string === undefined && delete filters["$text"]
    let projects
    try {
    projects = await projectsModel.find(filters,{score:{$meta:'textScore'}}).limit(30).sort({score:{$meta:'textScore'}})
    res.json(projects)
    } 
    catch (error) {
    res.json(error)
    }
}
})
// takes month number or the type of event competitions talkshows workshops or all
router.route('/events/:filter').get((req,res) => {
    efilter = req.params.filter
    month = parseInt(efilter)
    if(month)
    if(month>=1 && month<=12){
        var date = new Date();
        var init = new Date(date.getFullYear(), month-1, 1);
        var end = (new Date(date.getFullYear(), month, 1));
        eventsModel.filterByRange(init,end)
        .then((events)=>{
          res.send(events);
        })
    }
    var ikeyMap = {
      competitions: 'Competition',
      talkshows: 'Talk-show',
      workshops: 'Workshop',
      all: 'all'
    }
    var keyMap=_.invert(ikeyMap);
    efilter=ikeyMap[efilter];
    eventsModel.filterByType(efilter)
    .then((events)=>{
      if(efilter!="all")
      res.send(events);
      else{
        filteredEvents = _.groupBy(events,'categories')
        respJson=_.mapKeys(filteredEvents, function(value, key) {
          return keyMap[key];
        });
        res.send(respJson);
      }
    })
})
// takes the club_name case insensitive and filter query /?filter= any string
router.route('/blogs/:club_name').get(async (req,res)=>{
    const club = req.params.club_name.toUpperCase()
    const query_string = req.query.filter
  
    let owner_id;
    let club_spec;
    try {
      club_spec = await clubModel.findOne({name:club})
      owner_id = club_spec.head
    } catch (error) {
      res.json(error)    
    }
    let filters={
        owner:owner_id,
        $text: {$search: query_string}
    }
    query_string === undefined && delete filters["$text"]

    let blogs
    try {
      blogs = await blogModel.find(filters,{score:{$meta:'textScore'}}).limit(30).sort({score:{$meta:'textScore'}})
      res.json(blogs)
    } catch (error) {
      res.json(error)
    }
})
  
// router.route('/challenges').get((req,res)=>{})
module.exports = router;