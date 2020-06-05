const mongoose = require('mongoose')
const validator = require('validator')

const eventSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    venue:{
        type:String
    },
    date : {
        type: Date,
        required : true
    },
    description:{
        type: String,
        required: true
    },
    poster_url:{
        type: String,
        required: true
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
},{
    timestamps: true
})
