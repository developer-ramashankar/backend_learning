import ApiHandler from "../utils/apiHandler";
import asyncHandler from "../utils/asynchandler";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model";

export const verifyJWT = asyncHandler(async (req, res, next) => {
 try {
    const token =  req.cookies?.accessToken ||
       req.header("Authorization")?.replace("Bearer ", "");
       
       if(!token){
           throw new ApiHandler(401,"Unauthorized request")
       }
       const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
   
       const user = await User.findById(decodedToken._id).select(
           "-password -refreshToken"
       )
       if(!user){
           throw new ApiHandler(401,"Invalid Access Token")
       }
       req.user = user
       next()
 } catch (error) {
    throw new ApiHandler(400,error?.message || "Invalid Access Token")
 }
});