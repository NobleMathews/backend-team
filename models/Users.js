const mongoose = require('mongoose');
const Event = require('./Event')
const Schema = mongoose.Schema;

const userSchema = new Schema({
    user_id:{type:String,required:true},
    pswd:{type:String,required:true},
    name:{type:String},
    contact:{type:String},
    email_id:{type:String},
    dp_url:{type:String},
    club_head:{type:Boolean,required:true},
    club_name:{type:String},
    bio:{type:String}
},{
    timestamps:true
});

userSchema.virtual('events',{
    ref: 'Event',
    localField: '_id',
    foreignField: 'owner'
})

const Users = mongoose.model('Users',userSchema);

module.exports = Users;
