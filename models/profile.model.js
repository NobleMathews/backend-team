const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const profSchema = new Schema({
    user_id:{type:String,required:false},
    pswd:{type:String,required:false},
    name:{type:String,required:false},
    contact:{type:String,required:false},
    email_id:{type:String,required:false},
    dp_url:{type:String,required:false}
},{
    timestamps:true
});

const profile = mongoose.model('users',profSchema);

module.exports = profile;