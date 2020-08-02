const router = require('express').Router()
var request = require('request')
const branchModel = require('../models/Branch.model')
const blogModel = require('../models/Blog.model')
const clubModel = require('../models/Club.model')
const projectsModel = require('../models/Project.model')
const clubMemberModel = require('../models/ClubMember.model')
const clubHeadsModel = require('../models/ClubHead.model')
const eventsModel = require('../models/Event.model')
const committeeModel = require('../models/Committee.model')
const challengeModel = require('../models/Challenge.model')
const achievementModel = require('../models/Achievement.model')
const newsModel = require('../models/News.model')
const techTeamModel = require('../models/TechTeam.model')
const editorModel = require('../models/Editor.model')
const feed_url = 'https://www.hackerrank.com/calendar/feed'
const _ = require('lodash')
const { Octokit } = require("@octokit/rest");
const octokit = new Octokit();
const { constant } = require('lodash')

router.route('/home').get((req, res) => {
  const homedata = async function () {
    let [news, f_blogs, f_projects, club_details, club_head_details, achievements] = await Promise.all([
      newsModel.find().lean().exec(),
      blogModel.find({ featured: true }).lean().exec(),
      projectsModel.find({ featured: true }).lean().exec(),
      clubModel.find().lean().exec(),
      clubHeadsModel.find().select({ _id: 1, name: 1, dp_url: 1 }).lean().exec(),
      achievementModel.find().sort({createdAt:-1}).limit(2)
    ])
    club_head_details = club_head_details.map(function (obj) { obj.head = obj.name; delete obj.name; return obj })
    const clubs = _.map(club_details, function (obj) {
      return _.extend(obj, _.find(club_head_details, { _id: (obj.head) }))
    })
    return {
      news: news,
      f_blogs: f_blogs,
      f_projects: f_projects,
      clubs: clubs,
      achievements: achievements
    }
  }
  homedata()
    .then(data => { res.json(data) })
    .catch(e => { console.log(e) })
})

// takes club_name case insensitive
router.route('/club/:club').get(async (req, res) => {
  const club_name = req.params.club.toUpperCase()
  const club = await clubModel.findOne({ name: club_name })
  let club_head
  let blogs
  let members
  try {
    club_head = await clubHeadsModel.findById(club.head, { tokens: 0 })  
    members = await clubMemberModel.find({ owner: club.head }, { owner: 0, _id: 0, __v: 0, createdAt: 0, updatedAt: 0 })
    blogs = await blogModel.find({owner: club.head,published:true})    
    res.json({
      'Club name': club.name,
      'Club Description': club.description,
      'Club logo_url': club.logo_url,
      'Club Object_ID': club._id,
      'Club Youtube channel': club.youtube,
      'Club Instagram page': club.instagram,
      'Club Facebook page': club.facebook,
      'Club Linkedin page': club.linkedin,
      'Club Github page': club.github,
      'Club Head name': club_head.user_id,
      'Club Head dp_url': club_head.dp_url,
      'Club Head bio': club_head.bio,
      'Club Head contact': club_head.contact,
      'Club Head email_id': club_head.email_id,
      'Member details': members,
      'Blogs': blogs
    })
  } catch (err) {
    res.json(err)
  }
})
router.route('/clubs').get((req, res) => {
  clubModel.find({}, { name: 1, _id: 0 }, function (err, clubs) {
    if (err) {
      res.json(err)
    } else {
      res.json(clubs)
    }
  })
})
// route for front end to render gallery strings of club_head blog
router.route('/gallery/:club_name').get((req, res) => {
  const club_name = req.params.club_name.toUpperCase()
  clubModel.findOne({ name: club_name }, { _id: 0 })
    .then(club => {
      blogModel.find({ owner: club.head }, { _id: 0 })
        .then(blog => {
          arr = _.mapValues(_.keyBy(blog, 'title'), 'gallery')
          consolidated = _.pickBy(arr, (value, key) => Array.isArray(value) && value.length);
          res.json(consolidated)
        }).catch(err => { res.json(err) })
    }).catch(err => { res.json(err) })
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
      branch: branch_name == undefined ? /.*/ : branch_name.split(','),
      club: club_name == undefined ? /.*/ : club_name.split(','),
      degree: deg_name == undefined ? /.*/ : deg_name.split(','),
      $text: { $search: query_string }
    }
    query_string === undefined && delete filters.$text
    let projects
    try {
      projects = await projectsModel.find(filters, { score: { $meta: 'textScore' } }).limit(30).sort({ score: { $meta: 'textScore' } })
      var finalList = _.map(projects, function (b) {
        if (b.published) return b
      })
      res.json(finalList)
    } catch (error) {
      res.json(error)
    }
  }
})

router.route('/project/:id').get((req,res)=>{
  projectsModel.findById(req.params.id)
  .then(project=>{
    res.json(project);
  })
  .catch(err=>{
    res.json(err);
  })
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
  let editor
  if(club==="GENERAL"){
    try{
      editor = await editorModel.findOne()
      owner_id = editor._id
    } catch(error){
      res.json(error)
    }
  }else{
    try {
      club_spec = await clubModel.findOne({ name: club })
      owner_id = club_spec.head
    } catch (error) {
      res.json(error)
    }
  }
  const filters = {
    owner: owner_id,
    $text: { $search: query_string },
    published: true
  }
  query_string === undefined && delete filters.$text

  let blogs
  try {
    blogs = await blogModel.find(filters, { score: { $meta: 'textScore' } }).limit(30).sort({ score: { $meta: 'textScore' } })
    res.json(blogs)
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

router.route('/blogs/tags/:filter').get(async(req,res)=>{
  const tags = req.params.filter;
  const filters = {
    $text: { $search: tags },
    published: true
  }
  let blogs
  try {
    blogs = await blogModel.find(filters, {_id:1,title:1,score: { $meta: 'textScore' } }).lean().limit(30).sort({ score: { $meta: 'textScore' } })
    res.json(blogs)
  } catch (error) {
    res.json(error)
  }
})

router.route('/challenges/:category').get((req, res) => {
  const category = req.params.category
  const exp = req.query.exp
  var codingAppendData=[]
  filter=(category == "all")?{}:{category:{ $regex : new RegExp(category, "i") }}

  challengeModel.find(filter,{__v:0,_id:0,documentIDs:0}).lean()
    .then(challenges => {
      let result = challenges
      if(exp)
      result =_.filter(challenges, function(o) { 
        if(exp=="only") return new Date(o.registration_end) < new Date();
        else return new Date(o.registration_end) >= new Date();
      });
      let check_str=String(category).toLowerCase();
      if(check_str=="coding" || check_str=="all"){
        request.get({
          url: feed_url,
          json: true,
          headers: { 'User-Agent': 'request' }
        }, (e, r, data) => {
          if (e) {
            return res.json(e)
          } else {
            reqdata = data.models
            reqdata.sort(function (a, b) {
              return a.start.localeCompare(b.start)
            })
            map={
              "title":"name",
              "end":"registration_end",
              "start":"registration_start",
              "url":"ref_url"
            }
            const formattedData = reqdata.map(item => {
              let url= new URL(item.url)
              let host=url.hostname.replace(/.com|www./gi, function(){ 
                return ""; 
              });
              let known_hosts=["hackerrank","topcoder","codechef","codeforces"]
              if(!known_hosts.includes(host)) host="unknown_host"
              return { 
                name: item.title,description:item.description, registration_end: item.end,registration_start:item.start, ref_url:item.url,category:"Coding", photo:host
              };
            });
            codingAppendData=formattedData;
            return res.json(result.concat(codingAppendData))
          }
        })
      }
      else
      res.json(result)
    }).catch(err => {
      return res.status(404).json(err)
    })
})

router.route('/categories/:target').get(async(req, res) => {
  const target = req.params.target,all = req.query.all
  var targetModel,static 
  let arr = await branchModel.find({})
  let branchlist =  arr.map(a => a.name);
  var options = ["Coding","Open"].concat(branchlist)
  if(target=="blog"){
    targetModel=blogModel;
    static=["Workshop","Competition","Talk-show","Activity"]
  }
  else if(target=="challenge"){
    targetModel=challengeModel;
    static=options;
  }
  else if(target=="branch"){
    return res.status(200).send(branchlist)
  }
  else
  res.status(404).json("Invalid parameter passed. Route is valid for |blog| and |challenges|")
  if(all){
    // This is a static response shouldnt be used in my opinion... use if all even those not in use are required
    // But then should be updated based on changes in respective files except branchlist
    res.status(200).send(static)
  }
  else
  targetModel.distinct('category', {}, function(err, options){if(err)res.status(404).json(err);res.status(200).send(options)})
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

router.route('/contributors/:target').get( async(req, res) => {
  const param = req.params.target=="frontend"?{owner: 'mir-sam-ali',repo: 'frontend-team'}:{owner: 'shobhi1310',repo: 'backend-team'}
  const response=await octokit.request('GET /repos/{owner}/{repo}/stats/contributors',param)
  const datam=response.data;
  const filtered = datam.map((data) => ({
      id:_.get(data,'author.login'),
      img: _.get(data, 'author.avatar_url'),
      url:_.get(data, 'author.html_url'),
      ..._.pick(data, 'total')
  }));
  const winners = datam.map((data) => ({
      id:_.get(data,'author.login'),
      img: _.get(data, 'author.avatar_url'),
      url:_.get(data, 'author.html_url'),
      weekly: _.last(_.sortBy(_.get(data, 'weeks'),'w'))
    }));
    var winner,reZero=0,total_c=0;
    const latestData=winners[0]["weekly"].w
    datam.forEach(element => {
        element['weeks'].forEach(week=>{
            if(week.w==latestData)
            total_c=total_c+week.c
          })
        });
        total_c=total_c/10
        winner = _.orderBy(winners, function(e) {let score=(e["weekly"].a * Math.ceil((e["weekly"].c)/total_c)); if(score!=0)reZero=reZero+1; return score}, ['desc']).slice(0,3);
        if(reZero<3)
        winner = _.orderBy(winners, function(e) {return e["weekly"].c}, ['desc']).slice(0,3);
        const result = _.orderBy(filtered, ['total'],['desc']);
  res.json({ authors:result,winners:winner,total_c:total_c })
})

router.route('/achievements/:year').get((req, res) => {
  year = req.params.year
  if(year=="all"){
    achievementModel.find({}, { _id: 0, __v: 0, updatedAt: 0 }).lean()
    .then((com) => {
      res.json(_.groupBy(com, function(item) {
        date_o=item.createdAt.getFullYear()
        return date_o;
      }))
    })
    .catch(err => res.json(err))
  }
  else{
    var curr_year = new Date(year)
    var next_year = new Date(curr_year.getFullYear() + 1, curr_year.getMonth(), curr_year.getDate())
    next_year.setUTCHours(23, 59, 59)
    achievementModel.filterByRange(curr_year, next_year)
      .then((achievement) => {
        res.json(achievement)
    })
  }
})

router.route('/tech_teams').get((req,res)=>{
  techTeamModel.find({},{team_name:1,_id:1})
  .then(tech_team=>{
    res.json(tech_team)
  })
})

router.route('/tech_team/:id').get((req,res)=>{
  techTeamModel.findById(req.params.id)
  .then(team=>{
    res.json(team)
  }).catch(err=>{
    res.json(err)
  })
})

module.exports = router
