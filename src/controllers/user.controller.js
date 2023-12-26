import { User } from "../models/user.model.js";
import { ApiError, handleError } from "../utils/ApiError.js";
import {ApiResponse} from '../utils/ApiResponse.js';
import {asyncHandler} from '../utils/asyncHandler.js';
import Jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.getAccessToken();
        const refreshToken = user.getRefreshToken();

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
        return {accessToken,refreshToken}
        
    } catch (error) {
        return res.status(500).send(handleError({
            statusCode: 500,
            message: 'Something went wrong while generating access and refresh token',
            errors:{
                error,
                message: 'Error while generating access and refresh token'
            }
        }))
    }
}

const registerUser = asyncHandler(async (req,res) => {

    try {
        const {username, email, password, role} = req.body

        //check: if user already exist or not
        const existUser = await User.findOne({
            $or: [{email},{username}]
        })

        if(existUser){
            return res.status(400).send(handleError(
                {
                    statusCode: 400, 
                    message: "user with same username or email already existed", 
                    errors: {
                        error: "user with same username already name alreay exist in database"
                    }
                }));
        }

        //create new user in database
        const user = await User.create({
            username,
            email,
            password,
            role
        })

        const createdUser = await User.findOne(user._id).select(
            "-password"
        )

        if(!createdUser) {
            return res.status(500).send(handleError(
                {
                    statusCode: 500, 
                    message: "something went wrong while registoring user", 
                    errors: {
                        error: "error occuring while creating new user in controller"
                    }
                }));
        }

        //generate jwt token for user
        // const token = await user.getAccessToken()

        return res.status(200).send(
            new ApiResponse(201,'user registration completed successfully',createdUser)
        )

    } catch (error) {
        handleError(error,res)
    }

})


const loginUser = asyncHandler( async (req,res) => {

    try {
        
        const {username, password, role} = req.body;
  
        //check: user with username available in database or not
        const user = await User.findOne({ username })

        if (user == null) {
            return res.status(400).send(handleError(
                {
                    statusCode: 400, 
                    message: "user not found", 
                    errors: {
                        error: "error occuring while find user with username and password"
                    }
                }));
        }

        //check: password is correct or not
        const isPasswordMatch = await user.isPasswordCorrect(password);
        
        if (!isPasswordMatch) {
            return res.status(400).send(handleError(
                {
                    statusCode: 400, 
                    message: "username or password incorrect", 
                    errors: {
                        error: "error occuring while find user with username and password in mongoService"
                    }
                })); 
        }
        
        //generate jwt token for user
        const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

        
        const loggedInUser = await User.findById(user._id).select('-password');

        const option = {
            httpOnly: false,
            secure: false,
            // Expires: new Date() 
        }

        return res
        .status(200)
        .cookie("accessToken",accessToken,option)
        .cookie("refreshToken",refreshToken,option)
        .json(
            new ApiResponse(
                200,
                "User logged In Successfully",
                {
                    user: loggedInUser, accessToken, refreshToken
                }
            )
        )
        
        // return res.status(200).send(
        //     new ApiResponse(201,'Login Successfully',token,user)
        // ).json({
        //     cookie: refreshToken
        // })
    } catch (error) {
        handleError(error,res)
    }

})

const logOutUser = asyncHandler(async (req,res) => {
   await User.findByIdAndUpdate(
    req.user._id,
    {
        $set:{
            refreshToken: undefined
        }
    },
    {
        new: true
    }

   )
    const option = {
        httpOnly: false,
        secure: false
    }

    return res
        .status(200)
        .clearCookie("accessToken",option)
        .clearCookie("refreshToken",option)
        .json(
            new ApiResponse(
                200,
                "User logged out Successfully",
                {}
            )
        )
})

const refreshAccessToken = asyncHandler(async (req,res) => {
    const incomingToken = req.cookies.refreshToken;

    if(!incomingToken){
        return res.status(401).send(handleError({
            statusCode: 401,
            message: "Unauthorized request",
            errors:{
                message: "Token not found"
            }
        }))
    }

    const decodedToken = Jwt.verify(
        incomingToken,
        process.env.REFRESH_TOKEN_SECRET
    )

    const user = await User.findById(decodedToken._id).select('-password');

    if(!user){
        return res.status(401).send(handleError({
            statusCode: 401,
            message: "Invalid access token",
            errors:{
                message: "Invalid access token"
            }
        }))
    }

    if(incomingToken !== user.refreshToken){
        return res.status(401).send(handleError({
            statusCode: 401,
            message: "Invalid refresh token",
            errors:{
                message: "Invalid refresh token"
            }
        }))
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

    const option = {
        httpOnly: false,
        secure: false,
        // Expires: new Date() 
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,option)
    .cookie("refreshToken",refreshToken,option)
    .json(
        new ApiResponse(
            200,
            "access token refrshed",
            {
                user: accessToken, refreshToken
            }
        )
    )


})
export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken
}