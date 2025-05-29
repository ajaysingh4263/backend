import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createAssignment } from "../controllers/assignment.controller.js";
import { upload } from "../middlewares/multer.middleware.js";





const router = Router()
 router.use(verifyJWT)

 router.route("/uploadAssignment/:videoId").post(
     upload.fields(
        [
            {
                name : "file",
                maxCount : 1
            }
        ]
     ),
    createAssignment
)






export default router
