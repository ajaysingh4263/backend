import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiErrors} from "../utils/ApiErrors.js"
import { User } from "../models/user.modal.js"
import {uploadOnCloudinary} from "../utils/cloudnary.js"
import { ApiResponse } from "../utils/ApiRespomse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

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
      $unset : {
         refreshToken : 1 
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

const  refreshAccessToken = asyncHandler(async(req , res)  => {
   // getting refreshToken from user  cookies 
   // comparing the incoming token with the backend store token 
   // generating new refreshToken for user
         const incomingRefreshToken = req.cookies.refreshToken  ||  req.body

         if (!incomingRefreshToken) {
            throw new ApiErrors(401 , "unauthorized request")
            
         }
    
       try {
         const decodeToken =  jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET)
  
            const user =   await User.findById(decodeToken?._id)
  
            if (!user) {
              throw new ApiErrors(401 , "invalid user found")
            }
  
            if(incomingRefreshToken !== user?.refreshToken){
              throw new ApiErrors(401 , "Expired refresh Token")
            }
    
             const options = {
              httpOnly  : true,
              secure : true
             }
       
                const {accessToken , newRefreshtoken} = await  generateRefreshTokenAndAccessToken(user._id)
  
  
                return res
                .status(200)
                .cookie("accessToken" , accessToken , options)
                .cookie("refreshToken" , newRefreshtoken , options)
                .json(
                 new ApiResponse(
                    200 ,
                    {accessToken , refreshToken : newRefreshtoken},
                    "access token refreshed"
                 )
                )
       } catch (error) {
          throw new ApiErrors( 401 , error?.message || "invalid refresh token ")
       }

})

const changeCurrentPassword = asyncHandler(async(req, res) => {
   // getting the oldpassword and new password from the user
   //  fetching the user based on id 
   // checking whether the old password is correct or not 
        const {oldPassword  , newPassword}     =  req.body
        
        const user  =  await  User.findById(req.user?._id)

          const isPasswordCorrect  =    await  user.isPasswordCorrect(oldPassword)
     if (!isPasswordCorrect) {
           throw new ApiErrors(401 , "invalid old Password")
     }

     user.password =  newPassword
      await  user.save({validateBeforeSave  : false})


      return res
      .status(200)
      .json( new ApiResponse(200 , user , "Password Change Successfully "))
})
   
const getCurrentUser = asyncHandler(async(req , res) => {
      return res
      .status(200)
      .json(new ApiResponse(200 , res.user , "User Fetched Successfully"))
})

const updateUserDetails = asyncHandler(async(req , res) => {
            const {fullName , email} =  req.body
           
             const user = User.findByIdAndUpdate(
               req.user?._id,
               {
                  $set : {
                     fullName : fullName,
                     email : email
                  }
               },
               {new : true}
            ).select("-password")

            return res 
            .status(200)
            .json( new ApiResponse(200 , user , "User Details Updated Successfully "))

})

const updateUserAvatar = asyncHandler(async (req , res ) => {
          const localAvatar = req.file?.path 

          if(!localAvatar){
            throw new ApiErrors(400 , "Avatar File is missing")
          }

          const avatar  =  await  uploadOnCloudinary(localAvatar)

          if (!avatar.url) {
             throw new ApiErrors(400 , " Avatar is not Uploaded on Cloudinary " )
          }

           const user = await User.findByIdAndUpdate(
            req.user?._id ,
            { 
               $set : {
               avatar  : avatar.url
            }
         }  ,
            {new : true}
          ).select("-password")


          return res
          .status(200)
          .json(
            new ApiResponse(
               200 ,
               user,
               "Avatar is uploaded successfully"
            )
          )
})

const updateCoverImage = asyncHandler(async (req , res ) => {
   const localCoverImage = req.file?.path 

   if(!localCoverImage){
     throw new ApiErrors(400 , "coverImage File is missing")
   }

   const coverImage  =  await  uploadOnCloudinary(localCoverImage)

   if (!coverImage.url) {
      throw new ApiErrors(400 , " coverImage is not Uploaded on Cloudinary " )
   }

      const user = await User.findByIdAndUpdate(
     req.user?._id ,
     { 
        $set : {
         coverImage  : coverImage.url
     }
  }  ,
     {new : true}
   ).select("-password")


    return res 
    .status(200)
    .json(
      new ApiResponse(
         200 ,
         user,
         "Cover Image uploaded successfully "
      )
    )
    
})

const  getUserChannelProfile = asyncHandler(async (req , res ) => {
      const {userName}   =  req.params

      if (!userName?.trim()) {
          throw new ApiErrors( 400 , "UserName not Found")
      }

      // using  aggregate  pipelines

         const  channel   =   await User.aggregate([
             {
               $match  : {
                  userName : userName?.toLowerCase()
               }
             } ,
             {
               $lookup :{
                  from : "subscriptions",
                  localField : "_id",
                  foreignField : "channel",
                  as : "subscribers"
               }
             },
             {
               $lookup :{
                  from : "subscriptions",
                  localField  :  "_id",
                  foreignField  : "subscriber",
                  as : "subscribedTo"
               }
             },
             
            {
               $addFields : {
                  subscribersCount : {
                     $size : "$subscribers"                // use $ as the subscribers is a field
                  },

                  channelsSubscribedToCount : {
                     $size : "$subscribedTo"
                  },

                  isSubscribed : {
                     $cond : {
                        if :{ $in  : [req.user?._id , "$subscribers?.subscriber"]},
                        then : true,
                        else : false
                     }
                  }
               }

             },
             {
               $project : {
                  fullName  :1 ,
                  userName : 1,
                  subscribersCount :1,
                  channelsSubscribedToCount :1,
                  isSubscribed :1 ,
                  avatar  :1,
                  coverImage : 1 ,
                  email  : 1 ,
               }
             }
         ])
         console.log("channel --- bahi --" , channel)
      if(!channel?.length ){
         throw new ApiErrors(400 , "channel doenot exist")
      }

      return res 
      .status(200)
      .json(
         new ApiResponse(200 , channel[0] , "User channel fetched  Successfully ")
      )
})

const getWatchHistory = asyncHandler(async(req , res) => {
        const user =   await  User.aggregate([
         {
            $match :{
               _id :  new mongoose.Types.ObjectId(req.user._id)
            }
         },
         {
            $lookup : {
               from : "videos",
               localField  : "watchHistory",
               foreignField : "_id",
               as  :"watchHistory",
               pipeline : [
                 {
                  $lookup : {
                     from : "users",
                     localField  : " owner",
                     foreignField : "_id",
                     as : "owner",
                     pipeline : [
                        {
                           $project:{
                              userName: 1,
                              fullName : 1,
                              avatar  :1
                           }
                        }
                     ]
                  }
                 },
                 {
                  $addFields :{
                     owner : {
                        $first : "$owner"
                     }
                  }
                 }
            ]
            }
         }

        ])
        console .log("user--from history" , user)
     
        return res 
        .status(200)
        .json(
        new ApiResponse(
         200 ,
         user[0].watchHistory,
         "watdhed History fetched successfully "
        )
        )
})
     


export {userRegister , loginUser ,logoutUser 
   ,refreshAccessToken , changeCurrentPassword , 
   getCurrentUser , updateUserDetails,
   updateUserAvatar ,updateCoverImage,
   getUserChannelProfile , getWatchHistory


}