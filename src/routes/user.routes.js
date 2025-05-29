import { Router } from "express";
import {
    loginUser, 
    userRegister, 
    logoutUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser,
     updateUserDetails,
      updateUserAvatar,
       updateCoverImage,
        getUserChannelProfile,
         getWatchHistory
        } from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js";
import {verifyJWT}from "../middlewares/auth.middleware.js";



const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount : 1
        },
        {
            name : "coverImage",
            maxCount : 1
        }
    ]),
    
    userRegister)

    router.route("/login").post(loginUser)

    // secured login

    router.route("/logout").post( verifyJWT, logoutUser)
    router.route("/refresh-token").post(refreshAccessToken)
   router.route("/change-password").post(verifyJWT , changeCurrentPassword)
router.route("/current-user").get(verifyJWT , getCurrentUser)
router.route("/update-user").patch(verifyJWT , updateUserDetails)
router.route("/avatar").patch(verifyJWT , upload.single("avatar") , updateUserAvatar)
router.route("cover-image").patch(verifyJWT ,  upload.single("cover-Image") ,updateCoverImage)
router.route("/c/:userName").get(verifyJWT , getUserChannelProfile) // this route is used for getting the params data 
router.route("/watch-history").get(verifyJWT , getWatchHistory)


export default router