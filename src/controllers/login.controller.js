import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "./../models/user.model.js";
import passportConfig from "../passport-config.js";

const loginUser = asyncHandler( async (req,res) => {
    const {username, password} = req.body;

    // console.log(req.body);

    //check: empty and undefined username and password 
    if([username, password].some((field) => field?.trim() === "" || field === undefined)){
        throw new ApiError(400,"username and password required!");
    }
  
    //check: user with username available in database or not
    const user = await User.findOne({ username })

    if (!user) {
        return new ApiError(404,'User not found')
    }

    //check: password is correct or not
    const isPasswordMatch = await user.isPasswordCorrect(password);
    
    if (!isPasswordMatch) {
        throw new ApiError(401,'username or password invalid!')  
    } 
    
    //generate jwt token for user
    const token = await user.getAccessToken()

    return res.status(200).send(
        new ApiResponse(201,'Login Successfully',token,user)
    )

    




    // const userValid =  passportConfig.authenticate('jwt',{session: false});
    // if(!userValid) res.status(400).json(new ApiResponse(400,'wrong username or password'));

})

export {loginUser}