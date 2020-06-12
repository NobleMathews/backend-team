const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clubSchema = new Schema({
    name:{type:String,required:true},
    head:{type:Schema.Types.ObjectId,required:true,ref:'Users'},
    club_head_name:{type:String},
    head_exists:{type:Boolean,required:true},
    description:{type:String},
    logo_url:{type:String}
})

const Club = mongoose.model('club',clubSchema)

module.exports = Club