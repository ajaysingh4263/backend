import { Assignment } from "../models/assignment.modal.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.modal.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/ApiRespomse.js";


const  createAssignment = asyncHandler(async (req , res) =>{
    const {title} = req.body
    const {videoId} = req.params

    if(!title){
        throw new ApiErrors(401 , "Tittle not Found")
    }

    const fileLocalPath  = req.files?.file[0]?.path 
    console.log(" local file aa gya ", fileLocalPath)

    if(!fileLocalPath){
        throw new ApiErrors(400 , "upload Assignment")
    }

    const fileResponse  = await uploadOnCloudinary(fileLocalPath)
    console.log("fileResponse from cloudinary ", fileResponse)

    if(!videoId){
throw new ApiErrors(400 , "Video Id is not Found")
    }

    const getVideo = await Video.findById(videoId)
    console.log(" video mil gya h ", getVideo)


    const updatedAssignment = await Assignment.create(
        {
            title,
            file : {
                 _id : fileResponse?._id,
                 url : fileResponse?.secure_url
            },
            video  : getVideo._id
        }
    )
console.log(" upddateed Assignmene t aa gya h ", updatedAssignment)

    return res
    .status(200)
    .json(
       new ApiResponse(
         200 ,
        updatedAssignment,
        " Assignment Uploaded succesfully "
       )
    )

}) 





export{
    createAssignment
}