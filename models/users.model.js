const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    user_id:{type:String,required:true},
    pswd:{type:String,required:true},
    name:{type:String,required:false},
    contact:{type:String,required:false},
    email_id:{type:String,required:false},
    dp_url:{type:String,required:false},
    club_head:{type:Boolean,required:true},
    club_name:{type:String,required:false}
},{
    timestamps:true
});

const Users = mongoose.model('Users',userSchema);

module.exports = Users;