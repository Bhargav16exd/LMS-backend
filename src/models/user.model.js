import mongoose from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import crpyto from "crypto"

const userSchema = new mongoose.Schema({
    
    fullName:{
        type:String,
        required:true,
        lowercase:true,
        minLength:[5,'Name should be atleast 5 char'],
        maxLength:[50,'Max 50 char allowed'],
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true,
        select:false
    },
    avatar:{
        type:String,
        required:true,
    },
    avatarId:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        enum:["ADMIN","USER"],
        default:"USER"
    },
    subscribedCourse:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course"
    }],

    forgotPasswordToken:String,
    forgotPasswordExpiry:Date

},{timestamps:true})

userSchema.pre("save", async function(next){

    if(!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password,10);
    
    next()
})

userSchema.methods.isPasswordValid = async function(password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function(){
   
    return jwt.sign({
        _id:this._id,
        email:this.email,
        role:this.role,
    }, 
    process.env.SECRETACCESSKEYJWT,
    {
        expiresIn:process.env.JWTEXPIRY
    })
}

userSchema.methods.generateForgotPassowordToken = function(){
   const resetToken = crpyto.randomBytes(16).toString('hex')
   const encryptedResetToken = crpyto.createHash('sha256').update(resetToken).digest('hex')
   this.forgotPasswordToken = encryptedResetToken;
   this.forgotPasswordExpiry = Date.now() + 1000*60*5;
   return resetToken;
}


export const User = mongoose.model("User",userSchema);