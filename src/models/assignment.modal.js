import mongoose, { Schema } from "mongoose";




const assignmentSchema = new Schema(
    {
        title :{
            type : String,
            required : true,
        },
        
        file :{
            _id : {type : String},
            url : { type : String},
            
        },

        video : {
            type : Schema.Types.ObjectId,
            ref : "Video"
        },
        dueDate : {
            type : Date
        },
        owner :{
            type  : Schema.Types.ObjectId,
            ref : "User"
        }

    },
    {timestamps : true}
)


export const Assignment =  mongoose.model("Assignment" ,assignmentSchema)