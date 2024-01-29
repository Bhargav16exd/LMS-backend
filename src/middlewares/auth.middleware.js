import jwt from "jsonwebtoken"
import asyncHandler from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"

const authMiddleware = asyncHandler(async(req,res,next)=>{

    try {
        
        const token = req.signedCookies?.accessToken || req.headers['authorization']?.replace("Bearer", "");

    
        if(!token){
            throw new ApiError(400,"You are not authorized")
        }
        
        const decodedToken =  jwt.verify(token,process.env.SECRETACCESSKEYJWT)

        const user = await User.findById(decodedToken._id)
           
        if(!user){
            throw new ApiError(400,"Invalid access token")
        }
        
        req.user = user

        next();

    } catch (error) {
        throw new ApiError(500,error.message)
    }

})

const isAuthorized = asyncHandler(async(req,res,next)=>{
  
    console.log(req.user.role)

    if(req.user.role == "ADMIN"){
        next()
    }
    else{
        throw new ApiError(400,"Not Authorized") 
    }   
})




export {authMiddleware,isAuthorized}
