import mongoose from "mongoose"

const videoSchema = new mongoose.Schema({
 
    title:{
        type:String,
        required:true 
    },
    description:{
        type:String
    },
    videoURL:{
        type:String,
        required:true,
        unique:true 
    },
    videoId:{
        type:String,
        required:true,
        unique:true
    }
},{timestamps:true})

export const Video = mongoose.model("Video",videoSchema)