const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const keywordSchema = new Schema({
    projects : [String],
    blogs : [String],
    achievements : [String]
})

const Keyword = mongoose.model('blogs',keywordSchema);
module.exports = Keyword
