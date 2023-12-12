import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from '../utils/ApiResponse.js';
import {asyncHandler} from '../utils/asyncHandler.js';

const registerUser = asyncHandler(async (req,res) => {
    const {username, email,password} = req.body

    //check any element come empty from user
    if([username, email, password].some((field) => field?.trim() === "")){
        throw new ApiError(400,"all field required!")
    }

    //check for if user already exist or not
    const existUser = await User.findOne({
        $or: [{email},{username}]
    })

    if(existUser){
        throw new ApiError(400, 'user with same username or email already existed')
    }

    const user = await User.create({
        username,
        email,
        password
    })

    const createdUser = await User.findOne(user._id).select(
        "-password"
    )

    if(!createdUser) throw new ApiError(500,'something went wrong while registoring user')

    return res.status(200).json(
        new ApiResponse(201,'user registration completed successfully',createdUser)
    )
})

export {registerUser}