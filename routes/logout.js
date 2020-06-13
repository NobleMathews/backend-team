const router = require('express').Router()

router.route('/').get((req,res)=>{
    req.session.destroy((err) => {
        if (err) {
            return console.log(err)
        }
        res.redirect('/')
    })
})

module.exports = router