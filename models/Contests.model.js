const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contestSchema = new Schema({
    redirect_url = {type:String,required:true},
    organisation : {type:String,required:true},
    logo_url : {type:String}
})

const Contests = mongoose.model('contests',contestSchema);

module.exports = Contests;
