const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const profSchema = new Schema({
    user_id:{type:String},
    pswd:{type:String},
    // dob:{type:String},
    name:{type:String},
    contact:{type:String},
    email_id:{type:String},
    dp_url:{type:String}
},{
    timestamps:true
});

const profile = mongoose.model('users',profSchema);

module.exports = profile;