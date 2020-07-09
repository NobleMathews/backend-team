const router = require('express').Router()
var request = require('request');
const moment = require('moment');
const feed_url = `https://www.hackerrank.com/calendar/feed`;

router.route('/view_all').get((req, res) => {
    request.get({
        url: feed_url,
        json: true,
        headers: {'User-Agent': 'request'}
      }, (e, r, data) => {
        if (e) {
            res.json(e);
        } else {
            reqdata=data.models
            reqdata.sort(function (a, b) {
                return a.start.localeCompare(b.start);
            });
            res.render('view_contests', {contests: data.models, moment: moment});
        }
    });
})
module.exports = router