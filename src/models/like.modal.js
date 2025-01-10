import { timeStamp } from "console"
import mongoose ,{Schema} from "mongoose "
import { type } from "os"


const likeSchema =  new  Schema(
     {
          video :{
            type : Schema.Types.ObjectId,
            ref : "Video"
          },

          Comment :{
            type : Schema.Types.ObjectId,
            ref : "Comment"
          },
          tweet :{
            type : Schema.Types.ObjectId,
            ref  : "Tweet"
          },
          likedBy :{
            type : Schema.Types.ObjectId,
            ref: "User"
          }
     } ,
     
    )



    export  const  Like = mongoose.modal("Like" , likeSchema)