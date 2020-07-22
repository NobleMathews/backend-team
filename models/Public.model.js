const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const PublicSchema = new Schema({
    googleId:{
        type: String,
        required: true,
    }
})

const Public = mongoose.model('Public', PublicSchema)
module.exports = Public

