const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const committeeSchema = new Schema({
    members : [
        {
            name : {type:String,required:true},
            position : {type:String},
            roll_num : {type:String},
            email_id: {type:String,unique:true},
            contact : {type:Number},
            dp_url : {type:String}
        }
    ],
},{
    timestamps:true
});

const Committee = mongoose.model('Committeemembers',committeeSchema);

module.exports = Committee;