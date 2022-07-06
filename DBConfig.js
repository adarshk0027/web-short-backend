
///const { default: mongoose } = require('mongoose');
const Mongoose=require('mongoose');
const Validator=require('validator')
const ResetSchema=Mongoose.Schema({
    FirstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        lowercase:true,
        validate:(value)=>{
           return Validator.isEmail(value)
        }
    },
    ExpiresIn:{type:String},
    password:{
        type:String,
        required:true,
        
    },
    otpString:{
        type:String,
        required:false
    },
    loggedIn:{
        type:Boolean,
        required:false,
        default:false
    },
    Activation:{
        type:Boolean,
        require:false,
        default:false
    }
})

const UserDetails=Mongoose.model('userdata',ResetSchema)
module.exports={UserDetails};