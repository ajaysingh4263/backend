import mongoose ,{Schema}  from " mongoose"

const playlistSchema = new Schema(
    {
        name :{
            type : String ,
            required : true
        },
        description:{
            type : String,
            required : true
        },

        videos :[
            {
            type : Schema.Types.ObjectId,
            ref : "video"
        }
    ],
    owner :{
        tupe : Schema.Types.ObjectId,
        ref: "User"
    }

    } , 
    {timestamps : true}
)

export const PlayList = mongoose.modal("PlayList" , playlistSchema)