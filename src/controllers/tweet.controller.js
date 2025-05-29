
import {asyncHandler} from "../utils/asyncHandler"
import {Tweet} from "../models/tweet.modal"
import {ApiErrors} from "../utils/ApiErrors"
import {ApiResponse} from "../utils/ApiRespomse"
import { User } from "../models/user.modal"




const createTweet = asyncHandler(async(req , res)=>{
      const{content} =  req.body

      if (!content) {
         throw new ApiErrors(400 , " content is not Found")
      }

       const tweetCreated = await Tweet.create({
            content ,
           owner :  req.user?._id
      })

      if (!tweetCreated) {
            throw new ApiErrors(404 , " Tweet is not created ")
      }

      return res
      .status(200)
      .json(
            new ApiRespomse(
                  200 ,
                  tweetCreated,
                  " Tweet Created Successfull "
            )
      )
})

const updateTweet = asyncHandler(async (req , res) =>{
    const {newContent} = req.body
    const {tweetId} = req.params
    

    if (!newContent || newContent?.trim()=== " ") {
      throw new ApiErrors(404 ," content is required ")
    }

    if (!tweetId) {
      throw new ApiErrors(400 , " invalid tweetId")
    }

        const getTweet = await Tweet.findById(tweetId)

        if (!getTweet) {
            throw new ApiErrors(404 , " invalid TweetId ")
        }

          const updatedtweet =  await Tweet.findByIdAndUpdate(
            tweetId,
           {
            $set :{
                  content : newContent
            }
           },
           {
            new : true
           }
        )

         if (!updatedtweet) {
            throw new ApiErrors(400 , " Updation failed")
         }

         return res 
         .status(200 )
         .json(
            new ApiResponse(
                  200 ,
                  updatedtweet,
                  " Tweet Updated"
            )
         )

})

const deleteTweet =asyncHandler(async ( req , res ) =>{
        const {tweetId} = req.params

        if (!tweetId) {
            throw new ApiErrors(400 , " invalid TweetId")
        }

            const gettingTweet = await Tweet.findById(tweetId)

            if (!gettingTweet) {
                  throw new ApiErrors(400 , " Tweet Not Found ")
            }

              const deleteTweet = await Tweet.deleteOne({ _id : tweetId }) 

              if (!deleteTweet) {
                  throw new ApiErrors(400 , " Something went wrong ")
              }

              return res 
              .status(200)
              .json(new ApiResponse(
                  200 ,
                  deleteTweet,
                  " Tweet Deleted  "
              ))
})

const getUserTweets = asyncHandler( async (req , res ) =>{
      const {userId } = req.params

      if (!userId) {
            throw new ApiErrors(400 , " invalid UserId")
      }

        const getUser = await User.findById(userId)

        if (!getUser) {
            throw new ApiErrors(400 , " User Not Found ")
        }

         const userTweets =  await Tweet.aggregate([
            {
                  $match :{
                        owner : req.user?._id
                  }
            }
         ])
       
         if (!userTweets) {
            throw new ApiErrors(400 , " User tweet Not Found")
         }

         return res
         .status(200)
         .json(
            new ApiRespomse(
                  200 ,
                  userTweets,
                  " User Tweet Fetched Successfully "
            )
         )

})




export {createTweet,
      updateTweet,
      deleteTweet,
      getUserTweets

      
}