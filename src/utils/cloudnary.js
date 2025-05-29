import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});


const uploadOnCloudinary = async (localFilePath) => {
  try {
    console.log("inside of the cloudinary", localFilePath);
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("response from cloudinary", response);

    try {
      fs.unlinkSync(localFilePath); // delete the file only if it exists
    } catch (unlinkErr) {
      console.warn("File deletion error:", unlinkErr.message);
    }

    return response;

  } catch (error) {
    console.log("inside the error block in cloudinary", error.message);

    // Also wrap this in try-catch to avoid double errors
    try {
      fs.unlinkSync(localFilePath);
    } catch (err) {
      console.warn("Cleanup deletion failed:", err.message);
    }

    return null;
  }
};


const deleteImageFromCloudinary = async (publicId) => {
  console.log("Calling Cloudinary delete for:", publicId);

  try {
    if (!publicId) {
      console.warn("No publicId provided to delete from Cloudinary.");
      return null;
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "auto", // handles both images & videos
    });

    console.log("Deleted from Cloudinary:", result);
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw new Error("Cloudinary deletion failed");
  }
};




export {uploadOnCloudinary ,deleteImageFromCloudinary}