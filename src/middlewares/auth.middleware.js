import { User } from "../models/user.model.js";
import { handleError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Jwt from "jsonwebtoken";

const verifyJWT = asyncHandler(async (req,res,next) => {
    try {
    
        const token = req.cookies?.accessToken || req.headers("Authorization")?.replace("Bearer ","");
        
        if(!token){
            return res.status(401).send(handleError({
                statusCode: 401,
                message: "Unauthorized request",
                errors:{
                    message: "Token not found"
                }
            }))
        }

        const decodedToken = Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
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

        req.user = user;
        next()
    } catch (error) {
        return res.status(401).send(handleError({
            statusCode: 401,
            message: "Invalid access token",
            errors:{
                error,
                message: "Invalid access token"
            }
        }))
    }
})

export {verifyJWT}