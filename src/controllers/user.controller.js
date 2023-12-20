import { User } from "../models/user.model.js";
import { ApiError, handleError } from "../utils/ApiError.js";
import {ApiResponse} from '../utils/ApiResponse.js';
import {asyncHandler} from '../utils/asyncHandler.js';

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
        const token = await user.getAccessToken()

        return res.status(200).send(
            new ApiResponse(201,'user registration completed successfully',token,createdUser)
        )

    } catch (error) {
        handleError(error,res)
    }

})

export {registerUser}