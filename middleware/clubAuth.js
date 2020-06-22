const jwt = require('jsonwebtoken')
const User = require('../models/ClubHead.model')

const clubAuth = async (req, res, next) => {
    try{
        const token = req.cookies.authToken

        if(!token){
            return res.status(403).send({error: 'You need to Login'})
        }

        const decoded = jwt.verify(token, 'my_jwt_secret')
        const user = await User.findOne({_id:decoded._id, 'tokens.token':token})
        //console.log(decoded._id)
        if(!user){
            throw new Error()
        }

        req.user = user
        req.token = token

        next()

    }catch(e){
        console.log(e)
        res.json('Please Authenticate as Club head')
    }
    

}

module.exports = clubAuth