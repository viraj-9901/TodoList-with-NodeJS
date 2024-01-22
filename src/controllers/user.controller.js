import { User } from "../models/user.model.js";
import mongoService from "../services/mongo.service.js";
import { ApiError, handleError } from "../utils/ApiError.js";
import {ApiResponse} from '../utils/ApiResponse.js';
import {asyncHandler} from '../utils/asyncHandler.js';
import Jwt from "jsonwebtoken";
import fs from 'fs';
import nodemailer from 'nodemailer';

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

const transporter = nodemailer.createTransport({
    service: process.env.SENDER_EMAIL_SERVICE,
    auth:{
        user: process.env.SENDER_EMAIL_ID,
        pass: process.env.SENDER_EMAIL_PASS
    }
})

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
            
           
        let token = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$^&*';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < 15) {
            token += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }

        createdUser.verificationToken = token;
        createdUser.save({validateBeforeSave: false})

        const mailOptions = {
            from: process.env.SENDER_EMAIL_ID,
            to: createdUser.email,
            subject: "Account verification",
            text: "please click on below link to verify your account",
            html: `<a>${process.env.BASE_URI}/${createdUser.username}/verify/${token}</a>`   
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("error: ", error);
            } else {
                console.log('Email sent: ' + info.response);
                console.log("Message sent: %s", info.messageId);
            }
        })
       
        
        return res.status(200).send(
            new ApiResponse(201,'user registration completed successfully',createdUser)
        )

    } catch (error) {
        handleError(error,res)
    }

})

const verifyUser = asyncHandler( async (req,res) => {
    try {
        const username = req.params.username;
        const token = req.params.token;

        const user = await User.findOne({username: username});
        
        if(!user){
            return res.status(500).send(handleError(
                {
                    statusCode: 500, 
                    message: "User Not Found", 
                    errors: {
                        error: "error occuring while creating new user"
                    }
                }
            ));   
        }

        if(user.verificationToken !== String(token)){
            return res.status(400).send(handleError(
                {
                    statusCode: 400, 
                    message: "Wrong Token", 
                    errors: {
                        error: "Wrong Token pass in URL"
                    }
                }
            )); 
        }

        user.isVerified = true;
        user.save({validateBeforeSave: false})
       
        const mailOptions = {
            from: process.env.SENDER_EMAIL_ID,
            to: user.email,
            subject: "Account verification complete",
            text: "Your account verification complete, click on below link to continue... ",
            html: `<a>${process.env.BASE_URI}/login</a>`   
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("error: ", error);
            } else {
                console.log('Email sent: ' + info.response);
                console.log("Message sent: %s", info.messageId);
            }
        })
        
        return res.status(200).send(
            new ApiResponse(201, "Account verification done", {})
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

        if(user.isVerified == false){
            return res.status(400).send(handleError(
                {
                    statusCode: 400, 
                    message: "Account verification pending", 
                    errors: {
                        error: "Account verification pending"
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
            secure: false
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

const updateUser = asyncHandler(async (req,res) => {
    const info = req.body;
    const userId = req.user._id

    const user = await mongoService.updateUser(userId, info);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "User update Successfully",
                {
                    user: user
                }
            )
        )
})

const changePassword = asyncHandler(async(req,res) => {
    try {
        const {oldPassword, newPassword} = req.body;
        const userId = req.user._id;
        
        const user = await User.findById(userId);
  
        if(!user){
            return res.status(401).send(handleError({
                statusCode: 401,
                message: "Invalid access token",
                errors:{
                    message: "Invalid access token"
                }
            }))
        }
    
        const isOldPasswordCorrect = await user.isPasswordCorrect(oldPassword)

        if(!isOldPasswordCorrect){
            return res.status(401).send(handleError({
                statusCode: 401,
                message: "Wrong Old Password",
                errors:{
                    message: "Wrong Old Password"
                }
            }))
        }
       
        user.password = newPassword
    
        await user.save({validateBeforeSave: false})

        return res.status(200)
                  .json(
                    new ApiResponse(
                        200,
                        "Password Update Successfully",
                        {}
                    )
                  )

    } catch (error) {
        return res.status(500).send(handleError({
            statusCode: 500,
            message: "Something went wrong",
            errors:{
                message: "Wrong Old Password",
                error
            }
        }))
    }

})

const uploadProfile = asyncHandler(async(req,res) => {
    const file = req.files
    const userId = req.user._id;
    let files = [];
    let rawFilePath = process.env.FILE_PATH+userId;
    console.log(req.files);


    const user = await User.findById(userId)
    console.log(user);

    //delete profile image from disk storage
    if(user.profile){
    let profileFile = user.profile[0].originalFileName;
    if(profileFile){
        let profileFilePath = rawFilePath + '/' + profileFile;

        fs.unlinkSync(profileFilePath,(err) => {
            if(err){
                return res.status(500).send(handleError({
                    statusCode: 500,
                    message: "Something went wrong!",
                    errors: err
                }))
            }})
    }
    }

    let userFile = file.profile[0].originalname
    let originalFile = file.profile[0].filename

    let temp = {
        userFileName: userFile,
        originalFileName: originalFile
    }
    files.push(temp)
    user.profile = files

    user.save({validateBeforeSave: false})

    return res.status(200)
              .json(new ApiResponse(
                200,
                "Profile uploaded successfully",
                {}
              ))
})

const getAllUsers = asyncHandler(async (req,res) => {
    let users = await User.find({})

    return res.status(200).send(
        new ApiResponse(
            200,
            "All Users from Database",
            users
        )
    )
})

const serveProfile = asyncHandler(async (req,res) => {
    let userId = req.user._id;
    let rawFilePath = process.env.FILE_PATH+req.user._id+'/'+'profile';

    let user = await User.findById(userId);

    if(!user){
        return res.status(401).send(handleError({
            statusCode: 401,
            message: "Invalid access token",
            errors:{
                message: "Invalid access token"
            }
        }))
    }

    if(user.profile){
        let filename = user.profile[0].originalFileName; 
        let filePath = rawFilePath + '/' + filename;
    
        return res
                  .status(200)
                  .sendFile(filePath)
    }

    // return res.status(200).json({
    //     message: "User doesn't have profile image"
    // })
})

export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    updateUser,
    changePassword,
    uploadProfile,
    verifyUser,
    getAllUsers,
    serveProfile
}