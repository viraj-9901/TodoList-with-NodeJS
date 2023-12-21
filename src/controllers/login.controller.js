import { ApiError, handleError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "./../models/user.model.js";

const loginUser = asyncHandler( async (req,res) => {

    try {
        
        const {username, password, role} = req.body;
  
        //checreqk: user with username available in database or not
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
        // console.log(isPasswordMatch);
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
        const token = await user.getAccessToken()
        const refreshToken = await user.getRefreshToken()

        
        return res.status(200).send(
            new ApiResponse(201,'Login Successfully',token,user)
        ).json({
            cookie: refreshToken
        })
    } catch (error) {
        handleError(error,res)
    }

    




    // const userValid =  passportConfig.authenticate('jwt',{session: false});
    // if(!userValid) res.status(400).json(new ApiResponse(400,'wrong username or password'));

})

export {loginUser}