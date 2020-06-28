const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const superAdminSchema = new Schema({
    user_id:{type:String,required:true},
    pswd:{type:String,required:true,
        validate(value){
            if(value.length < 6){
                throw new Error('Password must contain atleast 6 characters')
            }
        }
    },
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

superAdminSchema.statics.findByCredentials = async (user_id, password) => {
    const admin = await SuperAdmin.findOne({user_id})
    
    if(!admin){
        throw new Error('Unable to login')
    }
    
    const isMatch = await bcrypt.compare(password, admin.pswd)

    if(!isMatch){
        throw new Error('Unable to Login')
    }

    return admin
}

superAdminSchema.pre('save', async function (next) {
    const admin = this

    if(admin.isModified('pswd')){
        admin.pswd = await bcrypt.hash(admin.pswd, 8)
    }

    next()
})

const SuperAdmin = mongoose.model('superadmins',superAdminSchema);

module.exports = SuperAdmin;
