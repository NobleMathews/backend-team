const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blogSchema = new Schema({
    gallery : [String],                           
    chief_guest : {type:String},
    award_winners : {type:String},
    summary : {type:String},
    outside_links : [String],
    file_attachment : [String],
    video_links : {type:String}
})

const Blog = mongoose.model('blogs',blogSchema);
module.exports = Blog