import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.env.CLOUDNAME, 
    api_key: process.env.CLOUDINARYAPIKEY, 
    api_secret: process.env.CLOUDINARYAPISECRETKEY,
    secure: true
});

const uploadResource = async(filePath) =>{
    try {
        
        if(!filePath) return null ;
        const response = await cloudinary.uploader.upload(filePath,{resource_type:"auto"})
        fs.unlinkSync(filePath)
        return response;

    } catch (error) {
        console.log("Error While Uploading Avatar" , error)
        fs.unlinkSync(filePath)        
    }
}

const deleteResource = async(publicId) =>{
    try {
        
        if(!imageURL) return null ;
        await cloudinary.uploader.destroy(publicId)

    } catch (error) {
        return null
    }
}

export {uploadResource,deleteResource} 