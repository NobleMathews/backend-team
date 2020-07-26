const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const challengeSchema = new Schema({
    name:{type:String,required:true},
    description:{type:String},
    ref_url:{type:String,required:true},
    photo:{type:String},
    category:{type:String,required:true},
    registration_end : {type:Date},
    registration_start : {type:Date}
})

const Challenge = mongoose.model('challenges',challengeSchema)

module.exports = Challenge