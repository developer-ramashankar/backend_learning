import asyncHandler from "../utils/asynchandler.js";
import ApiError from "../utils/apiHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponce } from "../utils/apiResponse.js";

const createAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while creating refresh and access token"
    );
  }
};
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
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalpath = req.files.coverImage[0].path;
    console.log(req.files.coverImage[0].path);
  } else {
    console.log("coverImagei is not 🟢🟢 found");
  }
  console.log("coverImageLocalPath var", coverImageLocalpath);

  if (!avatarLocalpath) {
    throw new ApiError(400, "Avatar is required!!");
  }
  if (!coverImageLocalpath) {
    throw new ApiError(400, "coverImage local path is required!!");
  }
  const avatar = await uploadOnCloudinary(avatarLocalpath);

  const coverImage = await uploadOnCloudinary(coverImageLocalpath);
  console.log("coverImage of cloudinary 👍👍", coverImage);
  console.log("coverImage of cloudinary url 👍👍", coverImage.url);
  if (!avatar) {
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
    coverImage: coverImage?.url || "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(
      500,
      "Something went wrong while registering the User🟠"
    );
  }

  return res
    .status(201)
    .json(new ApiResponce(200, createdUser, "User Registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //  req.body => data
  // login with username or email
  // find the user
  // password checked
  // access and refresh token
  //  send cookies

  const { username, email, password } = req.body;
  if (!username || !email) {
    throw new ApiError(400, "username and Email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new ApiError(404, "User does not exit");
  }
  //check password
  // we use user instead of User because User is instance of mongoose from db it has only have thier own methods .If we use userDefine methods so we use user which is instansce of taken user from db.
  const validPassword = await user.isPasswordCorrect(password);
  if (!validPassword) {
    throw new ApiError(401, "Password is invalid");
  }

  const { accessToken, refreshToken } = await createAccessTokenAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true, //this means we donot change cookies in frontend only it chagne in server
    secure: true, //this means we donot change cookies in frontend only it chagne in server
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponce(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User Logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true, //this means we donot change cookies in frontend only it chagne in server
    secure: true,  
  };

  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponce(200,"User Logout"))
});
export { registerUser, loginUser, logoutUser };
