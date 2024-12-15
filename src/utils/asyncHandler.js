
// by using .then 

// const asyncHandler = (fn) =>{
//     (req, res, next)=>{
//         Promise.resolve(fn(req,res,next)).catch((err) => next(err))
//     }
// }

// export {asyncHandler}





// BY using try catch 

const asyncHandler = (fn) => async () =>{
    try {
        await fn(req ,res ,next)
    } catch (error) {
        res.status(err.code || 500).jason({
            success : false,
            message : err.message
        })
    }
}

 
 

export {asyncHandler}