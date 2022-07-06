const bcrypt=require('bcryptjs');
const { Verify } = require('crypto');
const Jwt=require('jsonwebtoken')
const Secret="p1ef4tuivf7jkotigcxzsr"

const CreateToken=async(payload)=>{
    const Token= await Jwt.sign(payload,Secret,{
        expiresIn:'5h'
    })
    return Token;
}

const AuthVerify=async(req,res,next)=>{
try{
const token= req.headers.authorization
console.log(token,"token");
const token_verify=await Jwt.verify(token,Secret)
console.log(token_verify,"verify");
req.user=token_verify
next()
}
catch(error){
    console.log(error);
    

}
}


const Hashing=async(password)=>{
    try{
        //const Salt= await bcrypt.genSalt(10)
        const Hashed=await bcrypt.hash(password,10)
        return Hashed;
    }
   catch(error){
       console.log(error);
   }

}

const HashCompare= async(password,Hash)=>{
    try{
        return await bcrypt.compare(password,Hash)
    }
    catch(error){
        console.log(error);
        return res.json({error})
    }
    
}

module.exports={Hashing,HashCompare,CreateToken,AuthVerify}