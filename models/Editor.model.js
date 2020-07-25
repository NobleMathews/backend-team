const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const editorSchema = new Schema({
    user_id:{type:String,required:true,trim:true,unique:true},
    pswd:{type:String,required:true},
    tokens:[{
        token: {
            type: String,
            required: true
        }
    }]
},{
    timestamps:true
});

editorSchema.methods.generateAuthToken = async function(req, res){
    const editor = this
    const token = jwt.sign({_id:editor._id.toString()}, 'my_jwt_secret', {expiresIn: '1 day'})
    
    editor.tokens = user.tokens.concat({token})
    await editor.save()
    res.cookie('authToken', token)
    return token
}

editorSchema.statics.findByCredentials = async (user_id, pswd) => {
    const editor = await Editors.findOne({user_id})

    if(!editor){
        throw new Error('Unable to Login')
    }

    const isMatch = await bcrypt.compare(pswd, editor.pswd)

    if(!isMatch){
        throw new Error('Unable to Login')
    }

    return editor

}

editorSchema.pre('save',async function(next) {
    const editor = this

    if(editor.isModified('pswd')){
        editor.pswd = await bcrypt.hash(editor.pswd, 8)
    }

    next()
})

const Editors = mongoose.model('editors',editorSchema);

module.exports = Editors;
