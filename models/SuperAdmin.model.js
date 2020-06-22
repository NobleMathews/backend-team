const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken');

const superAdminSchema = new Schema({
    user_id:{type:String,required:true},
    pswd:{type:String,required:true},
    name:{type:String},
    contact:{type:String},
    email_id:{type:String},
    tokens:[{
        token: {
            type: String,
            required: true
        }
    }]
},{
    timestamps:true
});

superAdminSchema.methods.generateAuthToken = async function(req, res){
    const admin = this
    const token = jwt.sign({_id: admin._id.toString()}, 'my_jwt_secret', {expiresIn: '1 day'})

    admin.tokens = admin.tokens.concat({ token })
    await admin.save()

    res.cookie('authToken', token)
    return token 
}

// superAdminSchema.statics.findByCredentials = async (user_id, password){
//     const admin = SuperAdmin.findOne({user_id, pswd: password})

// }

const SuperAdmin = mongoose.model('superadmins',superAdminSchema);

module.exports = SuperAdmin;
