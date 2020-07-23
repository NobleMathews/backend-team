const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const techTeamSchema = new Schema({
    team_name : {type:String,required:true,unique:true},
    tech_head : {type:String},
    contact : {type:String},
    dp_url : {type:String},
    email_id : {type:String},
    ref_link : {type:String},
    description : {type:String, required: true},
    team_poster_url : {type:String},
    documentIDs:{type:[[String]]}
},{
    timestamps : true
})

const TechTeam = mongoose.model('techTeams',techTeamSchema)
module.exports = TechTeam;