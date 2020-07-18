const jwt = require('jsonwebtoken')
const User = require('../models/ClubHead.model')

const clubAuth = async (req, res, next) => {
    try{
        const token = req.cookies.authToken

        if(!token){
            req.flash("error",['You need to be logged in'])
            return res.redirect("/")
        }

        const decoded = jwt.verify(token, 'my_jwt_secret')
        const user = await User.findOne({_id:decoded._id, 'tokens.token':token})
        
        if(!user){
            throw new Error()
        }

        req.user = user
        req.token = token

        next()

    }catch(e){
        
        // res.json('Please Authenticate as Club head')
        req.flash("error",['Please Authenticate as Club head'])
        return res.redirect("/")
    }
    

}

module.exports = clubAuth