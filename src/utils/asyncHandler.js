const asyncHandler = (requestHandler)=>{
    return (req,res,next)=>{
        Promise.resolve(
            requestHandler(req,res,next)
        ).catch((err)=> next(err))
    }
}

export default asyncHandler

// const asynchandler = (fn)=> async(req,res,next)=>{
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(err.code || 404).json({
//             success: false,
//             message: error.message
//         })
//     }
// }