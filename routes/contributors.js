const router = require('express').Router()
const { Octokit } = require("@octokit/rest");
const octokit = new Octokit();
const _ = require('lodash');

router.route('/:target').get( async(req, res) => {
    const param = req.params.target=="frontend"?{owner: 'mir-sam-ali',repo: 'frontend-team'}:{owner: 'shobhi1310',repo: 'backend-team'}
    const response=await octokit.request('GET /repos/{owner}/{repo}/stats/contributors',param)
    const data=response.data;
    const filtered = data.map((data) => ({
        id:_.get(data,'author.login'),
        img: _.get(data, 'author.avatar_url'),
        url:_.get(data, 'author.html_url'),
        ..._.pick(data, 'total')
    }));
    const winners = data.map((data) => ({
        id:_.get(data,'author.login'),
        img: _.get(data, 'author.avatar_url'),
        url:_.get(data, 'author.html_url'),
        weekly: _.last(_.get(data, 'weeks')),
    }));
    let winner,reZero=false;
    winner = _.orderBy(winners, function(e) {let score=e.a+e.d; if(score==0)reZero=true; return score}, ['desc']).slice(0,3);
    if(reZero)
    winner = _.orderBy(winners, function(e) {return e.c}, ['desc']).slice(0,3);
    const result = _.orderBy(filtered, ['total'],['desc']);
    res.render('contributors', { authors:result,winners:winner })
})

module.exports = router
