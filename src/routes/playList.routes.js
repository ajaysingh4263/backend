import { Router } from "express";
import { createPlayList , addVideoToPlayList, uploadVideoPlaylist} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

 



 const router = Router()
 router.use(verifyJWT)
router.route("/create-playlist").post(
    upload.fields([
        {
            name:"thumbNail",
            maxCount: 1
        }
    ]),
    createPlayList)
router.route("/playList-Video/:playlistId/:videoId").put(addVideoToPlayList);
router.route("/addVideo-playList/:playlistId").post(
     upload.fields([
        {
            name : "video",
            maxCount : 1
        },
        {
            name : "thumbNail",
            maxCount : 1
        }
     ]),
    uploadVideoPlaylist)









export default router