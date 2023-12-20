import { ApiError, handleError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "./../models/user.model.js";

const loginUser = asyncHandler( async (req,res) => {

    try {
        
        const {username, password, role} = req.body;

        // console.log(req.body);

        //check: empty and undefined username and password 
        // if([username, password].some((field) => field?.trim() === "" || field === undefined)){
        //     throw new ApiError(400,"username and password required!",['Error details']);
        // }
  
        //checreqk: user with username available in database or not
        const user = await User.findOne({ username })

        if (user == null) {
            return res.status(400).send(handleError(
                {
                    statusCode: 400, 
                    message: "user not found", 
                    errors: {
                        error: "error occuring while find user with username and password in mongoService"
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
        
        //check for admin
        // if(user.role == "admin") {
        //     return res.status(200)
        //     .send({
        //         // new ApiResponse(201,'Login Successfully as Admin',token,user),
        //         redirect: "/user/admin"
        // })
            
        // }

        return res.status(200).send(
            new ApiResponse(201,'Login Successfully',token,user)
        )

    } catch (error) {
        handleError(error,res)
    }

    




    // const userValid =  passportConfig.authenticate('jwt',{session: false});
    // if(!userValid) res.status(400).json(new ApiResponse(400,'wrong username or password'));

})

export {loginUser}