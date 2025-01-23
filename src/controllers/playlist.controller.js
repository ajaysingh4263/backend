import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler";
import { PlayList } from "../models/playlist.modal";
import { ApiResponse } from "../utils/ApiRespomse.js"
import {ApiErrors} from "../utils/ApiErrors.js"
import { User } from "../models/user.modal.js";
import {Video}from "../models/video.modal.js"



const createPlayList = asyncHandler(async(req , res )=> {
      const { name , description}  = req.body
         if (!name) {
            throw new ApiErrors(404 , "Name is required")
         }

        const playListDiscription  =  description || ""

         const playListCreated =  await PlayList.create({
           name ,
           description : playListDiscription,
           videos : [],
           owner : req.user?._id
        })

        if (!playListCreated) {
         throw new ApiErrors(404 , " PlayList not created ")
        }

       return res 
       .status(200)
      .json(
          new ApiResponse(
            200 ,
            playListCreated,
             " PlayList created  Successfully "
          )
      )
})

const getUserPlayLists = asyncHandler(async(req , res)=>{
       const {userId} = req.params

       if (!userId) {
         throw new ApiErrors(400 , "UserId is invalid")
       }

         const user = await User.findById(userId)

         if (!user) {
            throw new ApiErrors(404 , "user is not Found")
         }

        const playList =  await PlayList.aggregate([
            {
               $match : {
                  owner : new mongoose.Types.ObjectId(req.user?._id)
               }
            },
            {
               $lookup : {
                  from : "videos",
                  localField : "videos",
                  foreignField :  "_id",
                  as : "PlayListvideos"
               }
            },
            {
               $addFields :{
                  playList : {
                     $First : "$videos"
                  }
               }
            }
         ])

         if (!playList) {
            throw new ApiErrors(404 , "Something went  wrong while getting the PlayList")
         }

         return res
         .status(200)
         .json(
            new ApiResponse(
               200 ,
               playList,
               "PlayList fetched successfully"
            )
         )
})

const getPlayListById = asyncHandler(async(req , res)=>{
       const {playListId} = req.params
       if (!playListId) {
         throw new ApiErrors(404 , " playListId not valid")
       }

      const gettingPlayList =  await PlayList.findById(playListId)

      if (!gettingPlayList) {
         throw new ApiErrors(404, " PlayList not Found")
      }

      return res 
      .status(200)
      .json(
         new ApiResponse(
            200 ,
            gettingPlayList,
            " Play List Found "
         )
      )
})

const addVideoToPlayList = asyncHandler(async(req , res )=>{
   const {playlistId , videoId} = req.params

   if (!playlistId) {
      throw new ApiErrors(400 , "invalid playlist ")
   }
   if (!videoId) {
      throw new ApiErrors(404 , "invalid Video")
   }

    const userPlaylist =  await PlayList.findById(playlistId)

    if (!userPlaylist) {
      throw new ApiErrors(400 , "playList not Found")
    }
   
    if (userPlaylist.owner.toString() !== req.user?._id .toString()) {
      throw new ApiErrors(404 , " only user can create playlist")
    }

      const getVideo =  await Video.findById(videoId)

      if (!getVideo) {
         throw new ApiErrors(400 , "video not found")
      }

      if (userPlaylist.videos.includes(videoId)) {
         throw new ApiErrors(404 , "video already exist")
      }

    const addedToPlayList  =  await PlayList.findByIdAndUpdate(
         playlistId ,
         {
            $push :{
               videos : videoId
            }
         },
         {
            new : true
         }


      )
       
      if (!addedToPlayList) {
         throw new ApiErrors(404 , " something went wrong ")
      }

      return res 
      .status(200)
      .json(
         new ApiResponse(
            200 ,
            addedToPlayList,
            "video uploaded successfully "
         )
      )
})

const removeVideoFromPlaylist = asyncHandler(async(req , res)=>{
 const {playlistId , videoId}  = req.params
 if (!playlistId) {
   throw new ApiErrors(400 , " playListId is not valid ")
 }

 if (!videoId) {
   throw new ApiErrors(404 , " video not found ")
 }

   const getPlayList = await PlayList.findById(playlistId)

   if (!getPlayList) {
      throw new ApiErrors(404 , " Playlist not found ")
   }
     
   if (getPlayList.owner.toString() !== req.user?._id.toString()) {
      throw new ApiErrors(404, " Only user can remove this video")
   }
  
      const getVideo =   await Video.findById(videoId)

      if (!getVideo) {
         throw new ApiErrors(404 , " video not Found ")
      }

      if (!getPlayList.videos.includes(videoId)) {
         throw new ApiErrors(400 , " video not exist in this playList ")
      }
 
      const removedVideo =  await PlayList.findByIdAndUpdate(
         playlistId , {
            $pull : {
               videos : videoId
            }
         },
         {
            new : true
         }
      )
      
      if (!removedVideo) {
         throw new ApiErrors(400 , " Something Went wrong ")
      }

      return res
      .status(200 )
      .json(
         new ApiResponse(
            200 ,
            removedVideo,
            " Video deleted successfully"
         )
      )
})

const deletePlaylist = asyncHandler(async(req , res )=>{
const {playListId} = req.params  
    
if (!isValidObjectId(playListId)) {
   throw new ApiErrors(400 , " invalid PlayListId ")
}

    const getPlayList =  await PlayList.findById(playListId)
   
    if (!getPlayList) {
      throw new ApiErrors(404 , " playList not Found")
    }

    if (getPlayList.owner.toString() !== req.user?._id.toString()) {
      throw new ApiErrors(400 , " Not authorized  to delete PlayList")
    }

        const deletePlayList = await PlayList.deleteOne({
         _id : playListId
        })


        if (!deletePlayList) {
          throw new ApiErrors(400 , " sometHING WENT WRONG ")
        }
          
        return res
        .status(200)
        .json(
         new ApiResponse(
            200 <
            deletePlayList,
            " PlayList deleted Successfull"
         )
        )
})

const  updatePlayList = asyncHandler(async()=>{
   const {playlistId} = req.params
   const {name , description}  = req.body

   if (!playlistId) {
      throw new ApiErrors(400 , " playlist is required")
   }
     
       const userOwner = await isUserOwnerofPlaylist(playlistId , req.user?._id)

       if (!userOwner) {
         throw new ApiErrors(400 , " Only user can update playlist ")
       }

       if (!name) {
         throw new ApiErrors(404 , " name is required")
       }

        const updatedPlaylist = await PlayList.findByIdAndUpdate(playlistId ,
         {
            $set :{
               name : name,
               description : description || " "
            }
         },
         {
            new :  true
         }
       )

       if (!updatedPlaylist) {
         throw new ApiErrors(400 , " updation Failed")
       }

       return res 
       .status(200)
       .json(
         new ApiResponse(
            200 ,

            updatedPlaylist,

            " Playlist updated successfull"
         )
       )
})




export {createPlayList,
   getUserPlayLists,
   addVideoToPlayList,
   removeVideoFromPlaylist,
   deletePlaylist,
   getPlayListById,
   updatePlayList
}



