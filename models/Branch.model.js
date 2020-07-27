const mongoose = require('mongoose')
const Schema = mongoose.Schema

const branchSchema = new Schema({
    name:{type: String, required: true}
},{
    timestamps: true
})

const Branch = mongoose.model('Branches', branchSchema)
module.exports = Branch