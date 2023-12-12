import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "./models/user.model.js";
import bcrypt from 'bcrypt';

const loginUser = asyncHandler( async (req,res) => {
    const {username, password} = req.body;

    if([username, password].some((field) => field?.trim() === "")){
        throw new ApiError(400,"username and password required!");
    }
 
})