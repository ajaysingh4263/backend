import mongoose, { Schema } from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const videoSchema = new Schema({
    //  videoFile  : {
    //      type : String,
    //      required : true
    //  },
    //  thumbnail  : {
    //     type : String,
    //     required : true
    // },
    videoFile: {
        public_id: { type: String },
        url: { type: String, required: true }
    },
    thumbnail: {
        public_id: { type: String },
        url: { type: String, required: true }
    },

    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: " User"
    },
    playList :{
        type : Schema.Types.ObjectId,
        ref : "PlayList"
    }

},
    {
        timestamps: true
    }
)

videoSchema.plugin(mongooseAggregatePaginate)
export const Video = mongoose.model("Video", videoSchema)