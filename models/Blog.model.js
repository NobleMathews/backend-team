const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blogSchema = new Schema({
    owner:{
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Users'
    },
    category : {type:String,required:true},
    gallery : [String],                           
    chief_guest : {type:String},
    chief_guest_url : {type:String},
    award_winners : {type:String},
    summary : {type:String},
    outside_links : [String],
    file_attachment : [String],
    video_links : [String]
})

const Blog = mongoose.model('blogs',blogSchema);
module.exports = Blog
