import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiErrors} from "../utils/ApiErrors.js"
import { User } from "../models/user.modal.js"
import {uploadOnCloudinary} from "../utils/cloudnary.js"
import { ApiResponse } from "../utils/ApiRespomse.js"


// method of generating access and refesh token

const generateRefreshTokenAndAccessToken = async (userId) =>{
   // finding the user by their user id 
      try {
          const user = await User.findById(userId)
           const refreshToken = user.generateRefreshtoken()
            const accessToken = user.generateAccesstoken()          
            user.refreshToken = refreshToken
           await  user.save({validateBeforeSave : false})
           return {accessToken ,refreshToken}
      } catch (error) {
         throw ApiErrors(401 , " Something went wrong ")
      }
}

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

const loginUser = asyncHandler(async(req, res) =>{
         // req  body -> data
         // check  for  username or Email
         // check for password 
         // generate refresh or access token
         // send cookie



         const {userName, email, password} = req.body

         if (!(userName || email)) {
            throw new ApiErrors(400 ,  " Enter Valid userName Or Email is required ")
         }

      const user  =  await User.findOne({
         $or : [{userName},{email}]
      })

      if (!user) {
         throw new ApiErrors(404 ," User Not exist ");
      }

      const isPasswordValid = await  user.isPasswordCorrect(password)

      if (!isPasswordValid) {
         throw new ApiErrors(401, " Enter Valid Login credentials")
      }

      const {accessToken , refreshToken} = await generateRefreshTokenAndAccessToken(user._id)


      const loggedInUser =  await User.findById(user._id).select("-password -refreshToken")

      // for sending cookies design options 

     const  options = {
         httpOnly : true,
         secure: true
      }

      //sending response method

      return res
      .status(200)
      .cookie("accessToken" , accessToken , options)
      .cookie("refreshToken",refreshToken ,options)
      .json(
         new ApiResponse(
            200,
            {
               user : loggedInUser ,accessToken ,refreshToken
            },
            "user Logged in suuccessfully"
         )
      )
})

const logoutUser = asyncHandler(async(req ,res) =>{
  await User.findByIdAndUpdate(
   req.user._id,
   {
      $set : {
         refreshToken  :  undefined
      }
      
   },
   {
      new : true
   }
  )
    const options ={
      httpOnly : true,
      secure : true
    }

     return  res
     .status(200)
     .clearCookie("accessToken",options)
     .clearCookie("refreshToken"  ,options)
     .json(
      new ApiResponse(
         200 ,
          {

          }
          ,
          "user is logged Out"
      )
     )
})


export {userRegister , loginUser ,logoutUser}