const mongoose = require('mongoose')
const Schema = mongoose.Schema

const eventsSummarySchema = new Schema({
    gallery : [],                           // will contain url of the uploaded images in simple array
    chief_guest : {type:String},
    award_winners : {type:String},
    summary : {type:String},
    outside_links : [],
    file_attachment : [],
    video_links : {type:String}
})


const eventSchema = new Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    venue:{type:String},
    date : {type: Date,required : true},
    description:{type: String,required: true},
    poster_url:{type: String,required: true},
    owner:{
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    participants : [],
    categories : {type:String,required:true},       // workshop, competiotion, talk-show
    speaker : {type:String},
    event_summary : {type:Schema.Types.ObjectId, ref: 'event_summary'},
    showcase_url : []
},{
    timestamps: true
})

const event_summary = mongoose.model('event_summary',eventsSummarySchema)
const Event = mongoose.model('Events',eventSchema);

module.exports = Event
