const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const achievementSchema = new Schema({
    title:{type:String,required:true},
    caption:{type:String},
    description:{type:String},
    pics_url:[String],
    documentIDs:{type:[[String]]}
},{
    timestamps : true
})

const Achievements = mongoose.model('achievements',achievementSchema)

module.exports = Achievements