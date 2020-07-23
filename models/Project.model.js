const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema({
    title : {type:String,required:true},
    featured : {type:Boolean,required:true},
    published : {type:Boolean,required:true},
    team_members : [String],
    description : {type:String,required:true},
    branch : {type:String},
    club : {type:String},
    degree : {type:String},
    snapshot_url : [String],
    documentIDs:{type:[[String]]},
    keywords:[String]
},{
    timestamps : true
})

projectSchema.index({title : 'text', description : 'text' });

const Projects = mongoose.model('projects',projectSchema)

module.exports = Projects