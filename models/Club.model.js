const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clubSchema = new Schema({
    name:{type:String,required:true},
    head:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'Club_Heads'
    },
    description:{type:String},
    logo_url:{type:String},
    youtube:{type:String},
    instagram:{type:String},
    facebook:{type:String},
    linkedin:{type:String},
    github:{type:String},
})

const Club = mongoose.model('club',clubSchema)

module.exports = Club