const mongoose = require('mongoose');
const Event = require('./Event.model')
const Club = require('./Club.model')
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken')

const clubHeadSchema = new Schema({
    user_id:{type:String,required:true,trim:true},
    pswd:{type:String,required:true},
    name:{type:String},
    contact:{type:String},
    email_id:{type:String,required:true},
    dp_url:{type:String},
    club_head:{type:Boolean},
    club_name:{type:String},
    bio:{type:String},
    tokens:[{
        token: {
            type: String,
            required: true
        }
    }]
},{
    timestamps:true
});

clubHeadSchema.virtual('events',{
    ref: 'Event',
    localField: '_id',
    foreignField: 'owner'
})

clubHeadSchema.virtual('clubs',{
    ref: 'Club',
    localField: '_id',
    foreignField: 'head'
})

clubHeadSchema.methods.generateAuthToken = async function(req, res){
    const user = this
    const token = jwt.sign({_id:user._id.toString()}, 'my_jwt_secret', {expiresIn: '1 day'})
    //console.log(token)
    user.tokens = user.tokens.concat({token})
    await user.save()
    res.cookie('authToken', token)
    return token
}

const ClubHeads = mongoose.model('Users',clubHeadSchema);

module.exports = ClubHeads;
