const router = require('express').Router()
var request = require('request')
const blogModel = require('../models/Blog.model')
const clubModel = require('../models/Club.model')
const projectsModel = require('../models/Project.model')
const clubMemberModel = require('../models/ClubMember.model')
const clubHeadsModel = require('../models/ClubHead.model')
const eventsModel = require('../models/Event.model')
const committeeModel = require('../models/Committee.model')
const achievementModel = require('../models/Achievement.model')
const newsModel = require('../models/News.model')
const feed_url = 'https://www.hackerrank.com/calendar/feed'
const _ = require('lodash')
const { constant } = require('lodash')

router.route('/home').get((req, res) => {
  const homedata = async function(){
    let [news,f_blogs,f_projects,club_details,club_head_details] = await Promise.all([
      newsModel.find().lean().exec(),
      blogModel.find({featured:true}).lean().exec(),
      projectsModel.find({featured:true}).lean().exec(),
      clubModel.find().lean().exec(),
      clubHeadsModel.find().select({_id:1,name:1,dp_url:1}).lean().exec()    
    ]);
    club_head_details= club_head_details.map(function(obj) {obj["head"] = obj["name"];delete obj["name"];return obj;}); 
    const clubs =_.map(club_details, function(obj) {
      return _.extend(obj, _.find(club_head_details, {_id: (obj.head)}));
    });
    return {
      news:news,
      f_blogs:f_blogs,
      f_projects:f_projects,
      clubs:clubs
    }
  }
  homedata()
  .then(data=>{res.json(data)})
  .catch(e => {console.log(e)})

})

// takes club_name case insensitive
router.route('/club/:club').get( async (req,res)=>{
    const club_name = req.params.club.toUpperCase()
    const club = await clubModel.findOne({name:club_name})
    try{
        clubHeadsModel.findById(club.head,{tokens:0})
        .then(club_head=>{
          clubMemberModel.find({owner:club.head},{owner:0,_id:0,__v:0,createdAt:0,updatedAt:0})
          .then(members=>{res.json({
            'Club name':club.name,
            'Club Description':club.description,
            'Club logo_url':club.logo_url,
            'Club Object_ID':club._id,
            'Club Youtube channel':club.youtube,
            'Club Instagram page':club.instagram,
            'Club Facebook page':club.facebook,
            'Club Linkedin page':club.linkedin,
            'Club Github page':club.github,
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
    }catch(err){
      res.json(err)
    }
  
})  
//route for front end to render gallery strings of club_head blog
router.route('/gallery/:club_name').get((req,res)=>{
const club_name = req.params.club_name.toUpperCase();
clubModel.findOne({name:club_name},{_id:0})
.then(club => {
    blogModel.find({owner:club.head},{gallery:1,_id:0})
    .then(blog=>{
        arr=_.map(blog, 'gallery');
        consolidated=[].concat.apply([], arr);
        res.json({'gallery_strings':consolidated})
    }).catch(err => {res.json(err)})
}).catch(err => {res.json(err)})

})
// take multiple chainable queries branch club degree and search queries /?=...&..
router.route('/projects').get(async (req, res) => {
  if (Object.keys(req.query).length == 0) {
    projectsModel.find().limit(30)
      .then(project => res.json(project))
      .catch(err => res.json(err))
  } else {
    const branch_name = req.query.branch
    const club_name = req.query.club
    const deg_name = req.query.degree
    const query_string = req.query.query_string
    const filters = {
      branch: branch_name == undefined ? /.*/ : branch_name,
      club: club_name == undefined ? /.*/ : club_name,
      degree: deg_name == undefined ? /.*/ : deg_name,
      $text: { $search: query_string }
    }
    query_string === undefined && delete filters.$text
    let projects
    try {
      projects = await projectsModel.find(filters, { score: { $meta: 'textScore' } }).limit(30).sort({ score: { $meta: 'textScore' } })
      res.json(projects)
    } catch (error) {
      res.json(error)
    }
  }
})
// takes month number or the type of event competitions talkshows workshops or all
router.route('/events/:filter').get((req, res) => {
  efilter = req.params.filter
  month = parseInt(efilter)
  if (month) {
    if (month >= 1 && month <= 12) {
      var date = new Date()
      var init = new Date(date.getFullYear(), month - 1, 1)
      var end = (new Date(date.getFullYear(), month, 1))
      eventsModel.filterByRange(init, end)
        .then((events) => {
          res.send(events)
        })
    }
  }
  var ikeyMap = {
    competitions: 'Competition',
    talkshows: 'Talk-show',
    workshops: 'Workshop',
    all: 'all',
    activity: 'Activity'
  }
  var keyMap = _.invert(ikeyMap)
  efilter = ikeyMap[efilter]
  eventsModel.filterByType(efilter)
    .then((events) => {
      if (efilter != 'all') { res.send(events) } else {
        filteredEvents = _.groupBy(events, 'categories')
        respJson = _.mapKeys(filteredEvents, function (value, key) {
          return keyMap[key]
        })
        res.send(respJson)
      }
    })
})
// takes the club_name case insensitive and filter query /?filter= any string
router.route('/blogs/:club_name').get(async (req, res) => {
  const club = req.params.club_name.toUpperCase()
  const query_string = req.query.filter

  let owner_id
  let club_spec
  try {
    club_spec = await clubModel.findOne({ name: club })
    owner_id = club_spec.head
  } catch (error) {
    res.json(error)
  }
  const filters = {
    owner: owner_id,
    $text: { $search: query_string }
  }
  query_string === undefined && delete filters.$text

  let blogs
  try {
    blogs = await blogModel.find(filters, { score: { $meta: 'textScore' } }).limit(30).sort({ score: { $meta: 'textScore' } })
    var finalList = _.map(blogs, function (b) {
      if (b.published) return b
    })
    res.json(finalList)
  } catch (error) {
    res.json(error)
  }
})
router.route('/blog/:id').get((req, res) => {
  const id = req.params.id
  blogModel.findById(id)
    .then(blog => {
      res.json(blog)
    }).catch(err => {
      res.json(err)
    })
})
// returns a json with open upcoming challenges from hackerank topcoder and codeforces
router.route('/challenges').get((req, res) => {
  request.get({
    url: feed_url,
    json: true,
    headers: { 'User-Agent': 'request' }
  }, (e, r, data) => {
    if (e) {
      res.json(e)
    } else {
      reqdata = data.models
      reqdata.sort(function (a, b) {
        return a.start.localeCompare(b.start)
      })
      res.json(reqdata)
    }
  })
})
// route for registering pusposes to an event, takes emailid as input parameter in body
router.route('/register/:id').post((req, res) => {
  const id = req.params.id
  const email = req.body.email

  eventsModel.findById(id)
    .then(event => {
      let i = 0
      for (i = 0; i < event.participants.length; i++) {
        if (event.participants[i] === email) {
          break
        }
      }

      if (i === event.participants.length) {
        event.participants.push(email)
        event.save()
        res.status(200).json('Subscribed')
      } else {
        res.status(200).json('Email already exists')
      }
    }).catch(err => {
      res.status(404).json(err)
    })
})

// route for front end to render committee members details
router.route('/committee').get((req, res) => {
  committeeModel.find({}, { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 })
    .then(com => res.json(com))
    .catch(err => res.json(err))
})

router.route('/achievements/:year').get((req, res) => {
  year = req.params.year

  var curr_year = new Date(year)
  var next_year = new Date(curr_year.getFullYear() + 1, curr_year.getMonth(), curr_year.getDate())
  next_year.setUTCHours(23, 59, 59)

  achievementModel.filterByRange(curr_year, next_year)
    .then((achievement) => {
      res.json(achievement)
    })
})
module.exports = router
