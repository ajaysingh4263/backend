import { Router } from "express"
import {deleteVideo, getALLVideo ,
    getVideoBYId,
    publishAVideo,
    togglePublishStatus,
    updateVideo
} from "../controllers/video.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"




const router = Router()
router.use(verifyJWT)
router.route("/get-ALL-Videos").get(getALLVideo)
router.route("/upload-video").post( 
    upload.fields([
   {
    name : "videoFile",
    maxCount : 1 
   },
   {
    name: "thumbnail",
    maxCount : 1 
   }

    ]),
    
    publishAVideo)
router.route("/c/:videoId").get(getVideoBYId)
router.route("/update-video").patch(  
    upload.fields(
        [
            {
                name : "videoFile",
                maxCount : 1,
            },
            {
                name : "thumbnail",
                maxCount  :1 
            },
            {
                name : "title"
            },
            {
                name : "description"
            }
        ]
    ),

    updateVideo)
    router.route("/delete-video").delete(deleteVideo)
    router.route("/toggle/publish/:videoId").patch(togglePublishStatus)




export default  router