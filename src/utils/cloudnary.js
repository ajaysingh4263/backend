import {v2 as cloudinary} from "cloudinary"
import {fs} from "fs"

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath)=>{
    try {
        if (!localFilePath) return null
        //uploadFile on Cloudinary
             const response =  await cloudinary.uploader.upload(localFilePath , {
          resource_type :"auto"
        })
        console.log("response--file upload",response)
        //filehasbeen Uploaded successfully 
        console.log("File i suploaded on cloudiary",response.url)
        return response
        
    } catch (error) {
        fs.unlinkSync(localFilePath) //remove thwe locally saved temporary as the upload operation got failed

        return null
    }
}


export {uploadOnCloudinary}