const mongoose = require('mongoose');
const Event = require('./Event')
const Schema = mongoose.Schema;

const clubHeadSchema = new Schema({
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

userSchema.virtual('clubs',{
    ref: 'Club',
    localField: '_id',
    foreignField: 'head'
})

const ClubHeads = mongoose.model('Users',clubHeadSchema);

module.exports = ClubHeads;
