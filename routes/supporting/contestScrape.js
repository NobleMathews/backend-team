const router = require('express').Router();
const axios = require('axios');
const cheerio = require('cheerio');

const codechef_url = 'https://www.codechef.com/contests'
const spoj_url = 'https://www.spoj.com/contests/'
const leetcode_url = 'https://leetcode.com/contest/'   // this one is hard to crack
const codeforces_url = 'http://codeforces.com/contests'
const topcoder_url = 'https://www.topcoder.com/challenges' // same problem !!

axios.get(topcoder_url)
.then(res=>{
    topcoder_getdata(res.data)
})
.catch(err=>{
    console.log(err);
})

let codechef_getdata = (html) =>{
    let data = [];
    const $ = cheerio.load(html)
    $('#primary-content > div > div:nth-child(16) > table tr td:nth-child(2)').each((i,elem)=>{
        data.push({
            link : $(elem).find('a').attr('href')
        })
    })
    console.log(data);
}

let spoj_getdata = (html) =>{
    let data = [];
    const $ = cheerio.load(html)
    $('div.col-md-6 table tr td:nth-child(1)').each((i,elem)=>{
        data.push({
            link : $(elem).find('a').attr('href')
        })
    })
    console.log(data);
}

let leetcode_getdata = (html) =>{
    const $ = cheerio.load(html)
    console.log($('div.col-md-6 table tr td:nth-child(1)'));
}

let codeforces_getdata = (html) =>{
    let data = [];
    const $ = cheerio.load(html)
    $('#pageContent > div.contestList > div.datatable table tr td:nth-child(6)').each((i,elem)=>{
        data.push({
            link : $(elem).find('a.red-link').attr('href')
        })
    })
    console.log(data);
}

let topcoder_getdata = (html) =>{
    let data = [];
    const $ = cheerio.load(html)
    // $('#challengeFilterContainer > div:nth-child(3) > div._3p0GeZ > div:nth-child(1) > div:nth-child(2) > div._1u9jzQ > div._1wy0wX._1Gmjf_ ').each((i,elem)=>{
    //     data.push({
    //         link : $(elem).text
    //     })
    //     console.log($(elem));
    // })
    // #challengeFilterContainer > div:nth-child(3) > div._3p0GeZ > div:nth-child(1) > div:nth-child(2) > div._1u9jzQ > div._1wy0wX._1Gmjf_ > a
    // $('#challengeFilterContainer > div:nth-child(3) > div._3p0GeZ > div:nth-child(1) > div').each((i,elem)=>{
    //     console.log('hi!');
        
    //     console.log($(elem).text())
    // })
    var text = $('#challengeFilterContainer > div:nth-child(3) > div._3p0GeZ > div:nth-child(1) > div:nth-child(2) > div._1u9jzQ > div._1wy0wX._1Gmjf_ > a').text()
    console.log(text);
    
}


//#contest-app > div > div > div.container > div.contest-cards-base > div > div.contest-card-base.col-sm-7.col-xs-6 > div > a
module.exports = router;