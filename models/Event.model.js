const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Users = require('./ClubHead.model');

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
        ref: 'Users'
    },
    participants : [String],
    categories : {type:String,required:true},       // workshop, competiotion, talk-show
    speaker : {type:String}
},{
    timestamps: true
})

eventSchema.statics.filterByMonth = function(month) {
    const event = this
    const mon_of_event = this.date.getMonth()+1

    if(month===mon_of_event){
        return true
    }

    return false
}

eventSchema.statics.filterByType = function(filter) {
    if(filter=="all")
    return this.find({});
    return this.find({'categories':filter});
};

const Event = mongoose.model('event',eventSchema,'events');

module.exports = Event
