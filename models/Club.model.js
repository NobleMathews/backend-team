const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clubSchema = new Schema({
    name:{type:String,required:true},
    head:{type:String},
    description:{type:String},
    logo:{type:String}
})

const Club = mongoose.model('club',clubSchema)

module.exports = Club