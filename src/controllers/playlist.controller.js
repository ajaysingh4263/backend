import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { PlayList } from "../models/playlist.modal.js";
import { ApiResponse } from "../utils/ApiRespomse.js"
import { ApiErrors } from "../utils/ApiErrors.js"
import { User } from "../models/user.modal.js";
import { Video } from "../models/video.modal.js"
import { uploadOnCloudinary } from "../utils/cloudnary.js";



const createPlayList = asyncHandler(async (req, res) => {
   const { name, description, } = req.body
   if (!name) {
      throw new ApiErrors(404, "Name is required")
   }

   const playListDiscription = description || ""


   let thumbNailpath = req.files?.thumbNail[0]?.path

   if (!thumbNailpath) {
      throw new ApiErrors(404, " Please upload thumbNail")
   }

   const thumbNailUrl = await uploadOnCloudinary(thumbNailpath)

   const playListCreated = await PlayList.create({
      name,
      description: playListDiscription,
      videos: [],
      owner: req.user?._id,
      thumbNail: {
         _id: thumbNailUrl?.public_id,
         url: thumbNailUrl?.url
      }
   })

   if (!playListCreated) {
      throw new ApiErrors(404, " PlayList not created ")
   }

   return res
      .status(200)
      .json(
         new ApiResponse(
            200,
            playListCreated,
            " PlayList created  Successfully "
         )
      )
})

const getUserPlayLists = asyncHandler(async (req, res) => {
   const { userId } = req.params

   if (!userId) {
      throw new ApiErrors(400, "UserId is invalid")
   }

   const user = await User.findById(userId)

   if (!user) {
      throw new ApiErrors(404, "user is not Found")
   }

   const playList = await PlayList.aggregate([
      {
         $match: {
            owner: new mongoose.Types.ObjectId(req.user?._id)
         }
      },
      {
         $lookup: {
            from: "videos",
            localField: "videos",
            foreignField: "_id",
            as: "PlayListvideos"
         }
      },
      {
         $addFields: {
            playList: {
               $First: "$videos"
            }
         }
      }
   ])

   if (!playList) {
      throw new ApiErrors(404, "Something went  wrong while getting the PlayList")
   }

   return res
      .status(200)
      .json(
         new ApiResponse(
            200,
            playList,
            "PlayList fetched successfully"
         )
      )
})

const getPlayListById = asyncHandler(async (req, res) => {
   const { playListId } = req.params
   if (!playListId) {
      throw new ApiErrors(404, " playListId not valid")
   }

   const gettingPlayList = await PlayList.findById(playListId)

   if (!gettingPlayList) {
      throw new ApiErrors(404, " PlayList not Found")
   }

   return res
      .status(200)
      .json(
         new ApiResponse(
            200,
            gettingPlayList,
            " Play List Found "
         )
      )
})

const addVideoToPlayList = asyncHandler(async (req, res) => {
   const { playlistId, videoId } = req.params
   if (!playlistId) {
      throw new ApiErrors(400, "invalid playlist ")
   }
   if (!videoId) {
      throw new ApiErrors(404, "invalid Video")
   }

   const userPlaylist = await PlayList.findById(playlistId)

   if (!userPlaylist) {
      throw new ApiErrors(400, "playList not Found")
   }

   if (userPlaylist.owner.toString() !== req.user?._id.toString()) {
      throw new ApiErrors(404, " only user can create playlist")
   }

   const getVideo = await Video.findById(videoId)

   if (!getVideo) {
      throw new ApiErrors(400, "video not found")
   }

   if (userPlaylist.videos.includes(videoId)) {
      throw new ApiErrors(404, "video already exist")
   }

   const addedToPlayList = await PlayList.findByIdAndUpdate(
      playlistId,
      {
         $push: {
            videos: videoId
         }
      },
      {
         new: true
      }


   )

   if (!addedToPlayList) {
      throw new ApiErrors(404, " something went wrong ")
   }

   return res
      .status(200)
      .json(
         new ApiResponse(
            200,
            addedToPlayList,
            "video uploaded successfully "
         )
      )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
   const { playlistId, videoId } = req.params
   if (!playlistId) {
      throw new ApiErrors(400, " playListId is not valid ")
   }

   if (!videoId) {
      throw new ApiErrors(404, " video not found ")
   }

   const getPlayList = await PlayList.findById(playlistId)

   if (!getPlayList) {
      throw new ApiErrors(404, " Playlist not found ")
   }

   if (getPlayList.owner.toString() !== req.user?._id.toString()) {
      throw new ApiErrors(404, " Only user can remove this video")
   }

   const getVideo = await Video.findById(videoId)

   if (!getVideo) {
      throw new ApiErrors(404, " video not Found ")
   }

   if (!getPlayList.videos.includes(videoId)) {
      throw new ApiErrors(400, " video not exist in this playList ")
   }

   const removedVideo = await PlayList.findByIdAndUpdate(
      playlistId, {
      $pull: {
         videos: videoId
      }
   },
      {
         new: true
      }
   )

   if (!removedVideo) {
      throw new ApiErrors(400, " Something Went wrong ")
   }

   return res
      .status(200)
      .json(
         new ApiResponse(
            200,
            removedVideo,
            " Video deleted successfully"
         )
      )
})

const deletePlaylist = asyncHandler(async (req, res) => {
   const { playListId } = req.params

   if (!isValidObjectId(playListId)) {
      throw new ApiErrors(400, " invalid PlayListId ")
   }

   const getPlayList = await PlayList.findById(playListId)

   if (!getPlayList) {
      throw new ApiErrors(404, " playList not Found")
   }

   if (getPlayList.owner.toString() !== req.user?._id.toString()) {
      throw new ApiErrors(400, " Not authorized  to delete PlayList")
   }

   const deletePlayList = await PlayList.deleteOne({
      _id: playListId
   })


   if (!deletePlayList) {
      throw new ApiErrors(400, " sometHING WENT WRONG ")
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

const updatePlayList = asyncHandler(async () => {
   const { playlistId } = req.params
   const { name, description } = req.body

   if (!playlistId) {
      throw new ApiErrors(400, " playlist is required")
   }

   const userOwner = await isUserOwnerofPlaylist(playlistId, req.user?._id)

   if (!userOwner) {
      throw new ApiErrors(400, " Only user can update playlist ")
   }

   if (!name) {
      throw new ApiErrors(404, " name is required")
   }

   const updatedPlaylist = await PlayList.findByIdAndUpdate(playlistId,
      {
         $set: {
            name: name,
            description: description || " "
         }
      },
      {
         new: true
      }
   )

   if (!updatedPlaylist) {
      throw new ApiErrors(400, " updation Failed")
   }

   return res
      .status(200)
      .json(
         new ApiResponse(
            200,

            updatedPlaylist,

            " Playlist updated successfull"
         )
      )
})

const uploadVideoPlaylist = asyncHandler(async (req , res) => {
   const { playlistId } = req.params
   console.log("playList id yha h  ", playlistId)
   const { title, description } = req.body
console.log("title ", title , description)
   if (!title) {
      throw new ApiErrors(400, " Title not Found")
   }

   if (!description) {
      throw new ApiErrors(400, " description is not Found ")
   }

   if (!playlistId) {
      throw new ApiErrors(400, " playList Id is not found ")
   }

   const getPlayListById = await PlayList.findById(playlistId)


   if (!getPlayListById) {
      throw new ApiErrors(400, "PlayList id not found ")
   }

   const videoLocalPath = req.files?.video[0]?.path

   if (!videoLocalPath) {
      throw new ApiErrors(401, " video Not Found")
   }

   const thumbNailLocalPath = req.files?.thumbNail[0]?.path

   if (!thumbNailLocalPath) {
      throw new ApiErrors(401, " thumnbNail not Found ")
   }

   const videoUrl = await uploadOnCloudinary(videoLocalPath)
   console.log(" video from cloudinary", videoUrl)
   const thumbNailUrl = await uploadOnCloudinary(thumbNailLocalPath)
   console.log(" thumbNail uploaded ", thumbNailUrl)

   const savedVideo = await Video.create({
      videoFile: {
         _id: videoUrl?.public_id,
         url: videoUrl?.url
      },
      thumbnail: {
         _id: videoUrl?.public_id,
         url: thumbNailUrl?.url
      },
      title,
      description: description || "",
      duration: videoUrl?.duration,
      views: 0,
      isPublished: true,
      owner: req.user._id

   })


   const updatedVideoPlaylist = await PlayList.findByIdAndUpdate(
      playlistId ,
      {
         $push :{
            videos : savedVideo._id
         }
      },
      {
         new : true
      }
   )

 
   return res
   .status(200)
   .json(
      new ApiResponse(
         200,
         updatedVideoPlaylist,
         " video uploaded in playList successfull"
      )
   )



})




export {
   createPlayList,
   getUserPlayLists,
   addVideoToPlayList,
   removeVideoFromPlaylist,
   deletePlaylist,
   getPlayListById,
   updatePlayList,
   uploadVideoPlaylist
}



