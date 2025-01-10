import { Video } from "../models/video.modal.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiErrors } from "../utils/ApiErrors.js"
import { ApiResponse } from "../utils/ApiRespomse.js"
import { uploadOnCloudinary , deleteImageFromCloudinary } from "../utils/cloudnary.js"



const getALLVideo = asyncHandler(async(req , res) =>{ 
     
    const {page = 1 ,
         limit = 10 ,
          query , 
          sortBy , 
          sortType , 
          userId}  =  req.query

          const pageNumber =  parseInt(page)
          const pageSize = parseInt(limit)
          const  skip = (pageNumber - 1)* pageSize
          const searhQuery = {
            ...(query && {
                $or : [
                    {title : {$regex : query ,Option : "i"}},
                    {description : {$regex : query , Option : "i"}}
                ]
            }),
            ...(userId && {userId})
          }

          const sortOrder = {[sortBy] : sortType === "ascending" ? 1 : -1}

           const video =  await Video.find()
           .sort(sortOrder)
           .skip(skip)
           .limit(pageSize)

           if (!video) {
             throw new ApiErrors(400 , "No videos Found ")
           }


           const totalVideo =  await Video.countDocuments(searhQuery)

         return res
         .status(200)
         .json(
            new ApiResponse(
                200 ,
                {
                   videoData : video,
                   totalVideo ,
                   limit : pageSize,
                   pageNumber : pageNumber
                },

                "videos fetched successfully "

            )
         )
                 
           

})

const publishAVideo = asyncHandler(async(req ,res)=>{
     const {title , discription} = req.body
     
     if (!title) {
         throw new ApiErrors(200 , "Title is Required")
     }
     
     //access files from multer
      let thumbNailPath
     if (req.files && Array.isArray(req.files.thumbNail)&& req.files.thumbNail.length > 0) {
                   thumbNailPath = req.files?.thumbNail[0].path
     }

     
     let videoPath;
     if (req.files && Array.isArray(req.files.video) && req.files.video.length > 0) {
          videoPath = req.files?.video[0].path
     }


     if (!thumbNailPath) {
      throw new ApiErrors(401 , "Thumbnail is not found")
     }


     if (!videoPath) {
      throw new ApiErrors(401 , "Video is not found")
     }
         
       const thumbNail = await uploadOnCloudinary(thumbNailPath)
       const video =  await uploadOnCloudinary(videoPath)

       if (!thumbNail) {
         throw new ApiErrors(400 , "Thumbnail not Found")
       }

       if(!videoPath){
        throw new ApiErrors(400 , "Video not Found")
       }

       const videoUpload  =  await Video.create({
              videoFile : {
                _id  : video?._id,
                url : video?.url

               },
         thumbnail : {
          _id : video?._id,
          url : thumbNail?.url
         },
         title,
         description : discription||"",
         duration :video?.duration,
         views :  0 ,
         isPublished : true,
         owner : req.user._id
       })
       
       return res
       .status(200)
       .json(
        new ApiResponse(
          200,
          videoUpload,
          " video Uploaded Successfully "
        )
       )
})

const getVideoBYId = asyncHandler(async(req , res)=>{
         const {videoId} = req.params
         if (!videoId) {
            throw new ApiErrors(400 , " Video Not found ")
         }

         const video =  await Video.findById({_id : videoId})

         if (!video) {
           throw new ApiErrors(401 , "Video Not Available")
         }

         return res 
         .status(200)
         .json(
          new ApiResponse(
            200 , 
            video , 
            " Video Fetched Successfully "
          )
         )
})

const updateVideo = asyncHandler(async(req , res)=>{
        const {videoId} =  req.params
        const {title , description} = req.params

        if (!videoId) {
          throw new ApiErrors(400 , " Video is not Found ")
        }

        if (!title && !description) {
          throw new ApiErrors(400 , " Title and description is required")
        }

           const thumbNailPath = req.file?.path
           if (!thumbNailPath) {
            throw new ApiErrors(401 , "thumbnail is required ")
           }

          const thumbNail =   await uploadOnCloudinary(thumbNailPath)

          if (!thumbNail?.url) {
            throw new ApiErrors(400 , "thumbnail uploading failed")
          }       
   
          const videoLocalPath =  req.file?.path
          if (!videoLocalPath) {
            throw new ApiErrors(400 , " Video not Found")
          }

           const newVideo = await uploadOnCloudinary(videoLocalPath)

           if (!newVideo?.url) {
            throw new ApiErrors(401 , " Video Uploaded Failed ")
           }
    
           const updatedVideo = await Video.findByIdAndUpdate(videoId ,
            {
              $set :{
                videoFile : newVideo?.url,
                thumbnail : thumbNail?.url,
                title : title,
                description : description,
                  
              }
            },
            {
              new :  true
            }
           )

           if (!updatedVideo) {
            throw new ApiErrors(400 , " Something went wrong while updating the video file ")
           }

           return res 
           .status(200)
           .json(
            new ApiResponse(
              200 ,
              updatedVideo,

              "Video Updated Successful"
            )
           )
})

const deleteVideo = asyncHandler(async(req , res)=>{
      const {videoId} =   req.params
          const video = await Video.findById({_id:videoId})

          if (!video) {
            throw new ApiErrors(400 , " Video is not found")
          }
           if(!(video?.owner?.equals(req.user?._id))){
            throw new ApiErrors(401 , "Only user can Delete this video ")
           }

          const videoById = video.videoFile?._id
          const thumbNailById = video.thumbnail?._id

          const deletedVideo =  await Video.findByIdAndDelete(videoId)
          
          if (!deletedVideo) {
            throw new ApiErrors(401 , " Something went Wrong while deleting the Video ")
          }

          await deleteImageFromCloudinary(videoById)
        await  deleteImageFromCloudinary(thumbNailById)


        return res
        .status(200)
        .json(
          new ApiResponse(
            200 , 
            {},
            " Video Delete Successfully "
          )
        )

})

const togglePublishStatus =  asyncHandler(async ( req , res) =>{
  const {videoId} = req.params

  if (!videoId) {
    throw new ApiErrors(404 , "VideoId is requirerd ")
  }
      const video =  await Video.findById(videoId)

      if (!video) {
        throw new ApiErrors(401 , " Video not Found ")
      }

       const updatedVideo = await Video.findByIdAndUpdate(videoId ,
        {
          $set : {
            isPublished : false
          }
        },
        {
          new : true
        }
      )

      if (!updatedVideo) {
        throw new ApiErrors(401 , "Something Went Wrong while toggelling the status")
      }

      return res
      .status(200)
      .json(
        new ApiResponse(
          200 ,
          updatedVideo,

        )
      )
})


export{getALLVideo,
  publishAVideo,
  getVideoBYId,
  updateVideo,
  deleteVideo,
  togglePublishStatus
}



