const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blogSchema = new Schema({
    owner:{
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Users',
    },
    featured : {type:Boolean,required:true},
    published : {type:Boolean,required:true},
    title : {type:String,required:true},
    category : {type:String,required:true},
    gallery : [String],                           
    chief_guest : {type:String},
    chief_guest_url : {type:String},
    award_winners : {type:String},
    summary : {type:String, required: true},
    outside_links : [String],
    file_attachment : [String],
    video_links : [String],
    documentIDs:{type:[[String]]},
    keywords:[String],
    extract : {type:String}
})

blogSchema.index({title: 'text', summary: 'text', category: 'text'});

const Blog = mongoose.model('blogs',blogSchema);
module.exports = Blog
