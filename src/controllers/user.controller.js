import asyncHandler from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import { deleteResource, uploadResource } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import fs from "fs"
import crypto from "crypto"
import { sendMail } from "../utils/Mail.js";

const generateToken = async (userId) =>{
  try {
    const user = await User.findById(userId)
    const accessToken = await user.generateAccessToken()
    return accessToken ;
    
  } catch (error) {
    throw new ApiError(500,"Error While generating access token")
  }
}

const forgotPasswordTokenGenerator = async(email)=>{
    try {

        const user = await User.findOne({email})
        if(!user){
            throw new ApiError(400,"Given Email doesnt exist")
        }
        const forgotPasswordToken = await user.generateForgotPassowordToken();
        user.save();

        return forgotPasswordToken;
        
    } catch (error) {
        throw new ApiError(500,"Internal Server Error")
    }
}

const register = asyncHandler(async(req,res)=>{
    
    //Getting Model Parameter from body
    //Validation whether all are present
    //Check whether same user exist
    // Create a user 
    // Get user avatar save to local storage upload to cloudinary when done

    const { email,password,fullName } = req.body;
    
    
    if(!email || !password || !fullName){
        req.file ? fs.unlinkSync(req.file.path) : ""
        throw new ApiError(400,"All fields are required")
    }
 
    const userExist = await User.findOne({email})

    if(userExist){
        req.file ? fs.unlinkSync(req.file.path) : ""
        throw new ApiError(400,"User Already Exist with following email")
    }
    
    console.log("hi", req.file)
    
    const avatarLocalPath = req.file?.path
    
    if(!avatarLocalPath){
        throw new ApiError(400,"Kidnly Upload Avatar")
    }

    const uploadResponse = await uploadResource(avatarLocalPath);

    const user = await User.create({
        fullName,
        email,
        password,
        avatar:uploadResponse?.url || "",
        avatarId:uploadResponse.public_id || "",
    })

    if(!user){
        throw new ApiError(500,"Error While Creating User")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,"User Registration Success" , user)
    )

})

const login = asyncHandler(async(req,res)=>{

    //get email and password 
    //check in db whether email exist
    // if yes then check current password matches my encrypted pass
    // create a JWT token and put it into into cookie

    const { email , password } = req.body;

    if(!email || !password){
        throw new ApiError(400,"All Fields are required")
    }
     
    const user = await User.findOne({email}).select("+password");

    if(!user){
        throw new ApiError(400,"No User exist with following email")
    }

    const isValid = await user.isPasswordValid(password);


    if(!isValid){
        throw new ApiError(400,"Incorrect Password")
    }
      
    
    const accessToken = await generateToken(user._id);

    const loggedInUserDetails = await User.findById(user._id)

    const options = {
        httpOnly:true,
        secure:true,
        sameSite: 'None'
    }


    return res
    .cookie("accessToken",accessToken,options)
    .status(200)
    .json(
        new ApiResponse(200,"User Login Success",{loggedInUserDetails,accessToken})
    )


})

const logout = asyncHandler(async(req,res)=>{
    
    const options = {
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .json(
        new ApiResponse(200,"User logout success")
    )
})

const userProfile = asyncHandler(async(req,res)=>{

     const user = await User.findById(req.user?._id).select("-role");
    
    return res
    .status(200)
    .json(
        new ApiResponse(200,"User Data Fetched Success",user)
    )
})

const forgotPassword = asyncHandler(async(req,res)=>{
    
    // get email
    // create token 
    // create expiry 
    //store them in db
    // send them an API to hit which has token embeded in it 

    const {email} = req.body

    if(!email){
        throw new ApiError(400,"Kindly Provide Token")
    }

    const forgotToken = await forgotPasswordTokenGenerator(email);

    const resetPasswordURL = `http://localhost:9000/api/v1/user/reset-password/${forgotToken}`

    await sendMail(email,resetPasswordURL)

    return res
    .status(200)
    .json(
        new ApiResponse(200,"Reset Email Sent Successfully")
    )
})

const resetPassword = asyncHandler(async(req,res)=>{
  
    const resetToken = req.params.resetToken;
    const {password} = req.body;

    if(!resetToken){
        throw new ApiError(400,"Invaild reset token")
    }

    const encryptedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const user = await User.findOne({forgotPasswordToken:encryptedResetToken , forgotPasswordExpiry:{$gt:Date.now()}})

    console.log(user)

    if(!user){
        throw new ApiError(400,"Session Expired Try Again Later")
    }

    user.password = password ;

    user.forgotPasswordToken = null;
    user.forgotPasswordExpiry = null;

    await user.save();
     
    console.log(user)
    return res
    .status(200)
    .json(
        new ApiResponse(200,"Reset Password Success")
    )
    
})

const changePassword = asyncHandler(async(req,res)=>{

    const {oldPassword,newPassword} = req.body

    if( !oldPassword || !newPassword ){
        throw new ApiError(400,"All Fields are Required")
    }

    const user = await User.findById(req.user._id).select("password")
     
    const result = await user.isPasswordValid(oldPassword)

    if(!result){
        throw new ApiError(400,"Incorrect Old password")
    }

    user.password = newPassword
    await user.save()

    return res
    .status(200)
    .json(
        new ApiResponse(200,"Password Changes Succesfully")
    )

})

const changeAvatar = asyncHandler(async(req,res)=>{
   
    const userD = await User.findById(req.user?._id)

    const oldAvatarId = userD.avatarId
    
    const avatarPath = req.file?.path 
    
    if(!avatarPath){
        throw new ApiError(400,"Kindly Upload Avatar")
    }

    const avatarURL = await uploadResource(avatarPath)

    const user = await User.findByIdAndUpdate(req.user?._id , {
        avatar : avatarURL.url,
        avatarId : avatarURL.public_id
    },
    {new:true})

    await user.save();

    await deleteResource(oldAvatarId)

    return res
    .status(200)
    .json(
        new ApiResponse(200,"Avatar Changes Sucess",user)
    )
})



export {
    register,
    login,
    logout,
    userProfile,
    forgotPassword,
    resetPassword,
    changePassword,
    changeAvatar
}

