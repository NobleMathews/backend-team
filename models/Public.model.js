const mongoose = require('mongoose');
const { TokenExpiredError } = require('jsonwebtoken');
const Schema = mongoose.Schema;

//Creator as a public
const PublicSchema = new Schema({
    googleId:{
        type: String,
        required: true,
    },
    token:{
        type:String,
        required: true
    }
})

const Public = mongoose.model('Public', PublicSchema)
module.exports = Public

