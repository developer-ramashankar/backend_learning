import asyncHandler from "../utils/asynchandler.js";
import ApiError from "../utils/apiHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiResponce} from "../utils/apiResponse.js"
const registerUser = asyncHandler(async (req, res) => {
  // get user data from frontend
  //validation - not empty
  // already exits accoute :username ,email
  //   check img upload and check for avatar
  // upload in cloudniary,  avater check again
  // create user object --create  entry  in db
  // remove  password and refresh token field from response
  // check user creation
  // return  response

  const { username, fullname, password, email } = req.body;
  console.log(email);

  //  if(fullname == ""){
  //     throw new ApiError(400,"Fullname is Empty")
  //  }
  //  else if(username == ""){
  //     throw new ApiError(400,"Username is Invalid");
  //  }
  //  else if(password == ""){
  //     throw new ApiError(400 , "Password is Invalid")
  //  }
  //  else if(email == ""){
  //     throw new ApiError(400,"Email is Invalid")
  //  }

  if (
    [fullname, username, password, email].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All field is required");
  }
  const exitedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (exitedUser) {
    throw new ApiError(409, "User with Username Already exits ");
  }
  // console.log(req.files)
  const avatarLocalpath = req.files?.avatar[0]?.path;
  // const coverImageLocalpath = req.files?.coverImage[0]?.path;

  let coverImageLocalpath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
    coverImageLocalpath = req.files.coverImage[0].path;
    console.log(req.files.coverImage[0].path)
  }
  else{
    console.log("coverImagei is not 🟢🟢 found")
  }
  console.log("coverImageLocalPath var",coverImageLocalpath)

  if (!avatarLocalpath) {
    throw new ApiError(400, "Avatar is required!!");
  }
  if (!coverImageLocalpath) {
    throw new ApiError(400, "coverImage local path is required!!");
  }
  const avatar = await uploadOnCloudinary(avatarLocalpath);

  const coverImage = await uploadOnCloudinary(coverImageLocalpath);
console.log("coverImage of cloudinary 👍👍",coverImage)
console.log("coverImage of cloudinary url 👍👍",coverImage.url)
  if(!avatar){
    throw new ApiError(400, "Avatar is required!!");
  }
  // if(!coverImage){
  //   throw new ApiError(400, "CoverImage is required!!");
  // }

   const user = await User.create({
    fullname,
    username: username.toLowerCase(),
    password,
    email,
    avatar: avatar.url,
    coverImage : coverImage?.url || "" ,
  })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser) {
        throw new ApiError(500,"Something went wrong while registering the User🟠")
    }
    
    return res.status(201).json(
        new ApiResponce(200,createdUser,"User Registered Successfully")
    )
});
export { registerUser };
