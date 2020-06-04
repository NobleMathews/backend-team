const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    user_id:{type:String,required:true},
    pswd:{type:String,required:true},
    dob:{type:String,required:true}
},{
    timestamps:true
});

const Users = mongoose.model('Users',userSchema);

module.exports = Users;