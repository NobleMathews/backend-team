const jwt = require('jsonwebtoken')
const SuperAdmin = require('../models/SuperAdmin.model')

const adminAuth = async (req, res, next) => {

    try{
        const token = req.cookies.authToken
        const decoded = jwt.verify(token, 'my_jwt_secret')
        const admin = await SuperAdmin.findOne({_id:decoded._id, 'tokens.token': token})
        if(!token){
            // return res.status(403).send({error: 'You need to Login'})
            req.flash("error",'You need to be logged in')
            return res.redirect("/admin")
        }
        
        if(!admin){
            throw new Error()
        }

        req.admin = admin
        req.token = token

        next()
        
    }catch(e){
        // res.json('Please Authenticate as Admin')
        req.flash("error",'Please Authenticate as Admin')
        res.redirect("/admin")
    }


}

module.exports = adminAuth