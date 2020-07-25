const jwt = require('jsonwebtoken')
const Editor = require('../models/Editor.model')

const editorAuth = async (req, res, next) => {
    try{
        const token = req.cookies.authToken

        if(!token){
            req.flash("error",['You need to be logged in'])
            return res.redirect("/")
        }

        const decoded = jwt.verify(token, 'my_jwt_secret')
        const editor = await Editor.findOne({_id:decoded._id, 'tokens.token':token})
        
        if(!editor){
            throw new Error()
        }

        req.editor = editor
        req.token = token

        next()

    }catch(e){
        
        // res.json('Please Authenticate as Club head')
        req.flash("error",['Please Authenticate as Blog Editor'])
        return res.redirect("/")
    }
    

}

module.exports = editorAuth