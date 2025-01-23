import { Like } from "../models/like.modal";
import mongoose, { isValidObjectId } from "mongoose";
import { ApiResponse } from "../utils/ApiRespomse";
import { ApiErrors } from "../utils/ApiErrors";
import { asyncHandler } from "../utils/asyncHandler";
import  {Video} from "../models/video.modal.js"
import { Comment } from "../models/comment.modal.js";
import {Tweet} from "../models/tweet.modal.js"
import {User} from "../models/user.modal.js"


const toggleVideoLike = asyncHandler(async(req , res )=>{
     const {videoId} = req.params
          
     if (!videoId) {
        throw new ApiErrors(400 , " videoId is not valid ")
     }
     try {
        const video =  await Video.findById(videoId)

        if (!video || (!video.owner.toString() !== req.user?._id && !video.isPublished)) {

         throw  new ApiErrors(404 , "Video Not Found")
        }

        const likedVideo = {video : videoId , likedBY : req.user?._id}
        const alreadyLikedVideo =  await Like.findOne(likedVideo)

        if (!alreadyLikedVideo) {
              const newLikeVideo =  await Like.create(likedVideo)

              if (!newLikeVideo) {
                   throw new ApiErrors(400 , " something went wrong")
              }

              return res
              .status(200)
              .json(
               new ApiResponse(
                  200,
                  newLikeVideo,
                  " like successfully "
               )
              )
        }

        // for alreadyLikedVideo

        const dislikeVideo =  await Like.deleteOne(likedVideo)

        if (!dislikeVideo) {
         throw new ApiErrors(404 , " an Error Occurred ")
        }

        return res 
        .status(200)
        .json(new ApiResponse(
         200 ,
         dislikeVideo,
         " Dislike successful"
        ))

        
     } catch (error) {
        throw new ApiErrors(500 , " Like is facing technical issue ")
     }
})

const toggleCommentLike = asyncHandler(async(req , res)=>{
 const {commentId} = req.params

 if (!commentId) {
    throw new ApiErrors(400 , " commentId is required")
 }

 try {
        const comment = await Comment.findById(commentId)

        if (!comment) {
           throw new ApiErrors(404 , " Comment is not Found")
        }

        const isLikedComment  = {comment : commentId , likedBY : req.user?._id}
        const isAlreadyLiked =   await Like.findOne(isLikedComment)

        if (!isAlreadyLiked) {
               const commnetLiked = await Like.create(isLikedComment)

               if (!commnetLiked) {
                  throw new ApiErrors(404 , " Something Went Wrong")
               }

               return res
               .status(200)
               .json(
                  new ApiResponse(
                     200 ,
                     commnetLiked,
                     " Comment Liked "
                  )
               )
        }

        // alreadyLiked

         const dislikeComment =  await Like.deleteOne(isLikedComment)
         if (!dislikeComment) {
            throw new ApiErrors(400 , " Unable to dislike the comment ")
         }

         return res 
         .status(200)
         .json(new ApiResponse(
            200 ,
            dislikeComment,
            " Disliked Comment "
         ))
 } catch (error) {
   throw new ApiErrors( 500 , error?.message || "unable to toggle the like of comment ")
    
 }
})

const toggleTweetLike = asyncHandler(async(req , res )=>{
 const {tweetId} = req.parans

 if (!tweetId) {
   throw new ApiErrors(400 , " invalid Tweetid")
 }

     const getTweet = await Tweet.findById(tweetId)
      
     if (!getTweet) {
      throw new ApiErrors(404 , " Tweet not Found ")
     }

    const  tweetLikeCriteria = {tweet : tweetId , likedBY : req.user?._id} 
            
        const likedTweet = await Like.findOne(tweetLikeCriteria)

        if (!likedTweet) {
           const  newTweetLike =  await Like.create(tweetLikeCriteria) 

           if (!newTweetLike) {
            throw new ApiErrors(400 , " unable to Like the Tweet")
           }

           return res 
           .status(200)
           .json(
            new ApiResponse(
               200 ,
               likedTweet,
               " Tweet Liked "
            )
           )
        }

        // if already Liked
     
         const dislikeTweet = await Like.deleteOne(tweetLikeCriteria)
         if (!dislikeTweet) {
            throw new ApiErrors(400 , " unable to dislike ")
         }

         return res 
         .status(200)
         .json(
            new ApiResponse(
               200 ,
               dislikeTweet,
               " tweet disLiked"
            )
         )
    
})

const getLikedVideo = asyncHandler(async ( req , res) =>{
         const {userId} = req.user?._id

         if (!isValidObjectId(userId)) {
            throw new ApiErrors(400 , " invalid user id")
         }

        const user =  await User.findById(userId)

        if (!user) {
         throw new ApiErrors(404 , " user is not Found")
        }

        const likedVideos =  await Like.aggregate([
         {
            $lookup :{
               From : " Videos ",
               localField : " video",
               foreignField : " _id",
               as : " likedVideos",
               pipeline :[
                  {
                     $lookup : {
                        From  :  " users",
                        localField : " owner",
                        foreignField : " _id ",
                        as : " videoOwner",
                        pipeline : [
                           {
                              $project :{
                                 fullName : 1,
                                 userName :  1,
                                 avatar : 1
                              }
                           }
                        ]
                     }
                  },
                  {
                     $addFields : {
                        owner :{
                           $arrayElemAt : ["$videoOwner" , 0]
                        }
                     }
                  }
               ]

            }
         },
       
        ])

        return res 
        .status(200)
        .json(
         new ApiResponse(
            200 ,
            likedVideos,
           " Liked Video Fetched "

         )
        )
})



export {toggleVideoLike ,
   toggleCommentLike,
   toggleTweetLike,
   getLikedVideo
}