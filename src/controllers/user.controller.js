import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiErrors} from "../utils/ApiErrors.js"
import { User } from "../models/user.modal.js"
import {uploadOnCloudinary} from "../utils/cloudnary.js"
import { ApiResponse } from "../utils/ApiRespomse.js"


const userRegister = asyncHandler(async ( req ,res) => {
   // get user data from frontend
   //validation of data
   // check user is already exist - email , username
   // check for image , check for avatar
   // upload them to cloudinary , upload,
   // create user object - create entry db ,
   // remove password and refresh token field from response
   // check for user creation 
   // return res


   // gettiing user data 
   const {fullName ,userName , email ,password ,}  =  req.body
   console.log('emial--' , email)

   if(
      [fullName ,userName , email ,password].some((field) => field?.trim() === "")
   )
   {
      throw new ApiErrors(400 , "All fields are Required")
   }

        const existedUser = await  User.findOne({
         $or : [{ userName },{ email }]
        })

        if(existedUser){
         throw new ApiErrors(409 , "User with  email  or username already exits") 
        }

          // access of files from multer       
       const avatarLocalPath = req.files?.avatar[0]?.path


        let coverImageLocalPath;
        if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
                coverImageLocalPath =  req.files.coverImage[0].path
        }

        if (!avatarLocalPath) {
         throw new ApiErrors(400 ,"Avatar is Required")
         
        }

          const avatar = await uploadOnCloudinary(avatarLocalPath)
           const coverImage =  await  uploadOnCloudinary(coverImageLocalPath)


         if (!avatar) {
            throw new ApiErrors(400 ,"Avatar is Required")

         }

          const user = await  User.create({
            fullName,
            userName : userName.toLowerCase(),
            email,
            password,
            avatar : avatar.url,
            coverImage : coverImage?.url || ""
         })

        const createdUser =  await User.findOne(user._id).select( 
         "-password -refreshToken" 
        )

        if (!createdUser) {
         throw new ApiErrors(400 , "Failed due to technical system")
         
        }

        return res.status(201).json(
         new ApiResponse(200 , createdUser , " User is Registered Successfully ")
        )
})


export {userRegister}