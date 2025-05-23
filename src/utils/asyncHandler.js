
// by using .then 

// const asyncHandler = (fn) =>{

//     return  (req, res, next)=>{
//         Promise.resolve(fn(req,res,next)).catch((err) => next(err))
//     }
// }

// export {asyncHandler}





// BY using try catch 

// const asyncHandler = (fn) => async (req,res,next) =>{ 
//     try {
//          return await fn(req ,res ,next)
//     } catch (error) {
//          res.status(error.code || 500).json({
//             success : false,
//             message : error.message
//         })
//     }
// }

const asyncHandler = (fn) => async (req, res, next) => { 
    try {
        return await fn(req, res, next);
    } catch (error) {
        const statusCode = typeof error.statusCode === 'number' ? error.statusCode : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || 'Internal Server Error',
        });
    }
};

 
 

export {asyncHandler}