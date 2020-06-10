const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema({
    title : {type:String,required:true},
    team_members : [String],
    description : {type:String},
    branch : {type:String},
    club : {type:String},
    degree : {type:String},
    snapshot_url : [String]
},{
    timestamps : true
})

const Projects = mongoose.model('projects',projectSchema)

module.exports = Projects