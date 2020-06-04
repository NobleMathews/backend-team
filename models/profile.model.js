const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const profSchema = new Schema({
    user_id:{type:String,required:true},
    pswd:{type:String,required:true},
    // dob:{type:String,required:true},
    name:{type:String,required:true},
    contact:{type:String,required:true},
    email_id:{type:String,required:true},
    dp_url:{type:String,required:true}
});

const profile = mongoose.model('users',profSchema);

module.exports = profile;