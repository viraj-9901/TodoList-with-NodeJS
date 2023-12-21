import passport from "passport";
import { } from '../passport-config.js';
import { ApiError, handleError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

const validator = {
    token : async(req,res,next) => {

        try 
        {   
            const routeUsername = req.params.username;
            
            let authenticateReturnFun = passport.authenticate('jwt', { session: false },async (error, token) => {
                if (error || !token) {
                    return res.status(401).send(handleError({
                        statusCode: 401,
                        message: "You are not authenticate",
                        errors:{
                            message: "Invalid or wrong token pass in header"
                        }
                    }))
                } 
                try {
                    // console.log('token:',token)
                    const user = await User.findOne(
                        {_id: token._id}
                    );
                    req.user = user;
                    
                    const tokenUsername = req.user.username;

                    if(! (routeUsername === tokenUsername)){
                        return res.status(400).send(
                            handleError({
                                statusCode: 400,
                                message: "Invalid request",
                                errors:{
                                    message: "username from route and token doesn't match"
                                }
                            })
                        )
                    }
                } catch (error) {
                    next(error);
                }
                
                next();
                
            });

            authenticateReturnFun(req,res,next);

        } catch (error)
        {
            console.log('test');
        }
        
}, 

    user: async (req,res,next) => {

        let {username, email, password, role} = req.body;

        if(req.url === '/register'){
            if([username, email, password].some(field => field === "" || field === undefined )){
                return res.status(400).send(handleError(
                    {
                        statusCode: 400, 
                        message: "all fields are required!", 
                        errors: {
                            RequiredField: "username, email, password"
                        }
                    }));
            }
        } else {
            if([username, password].some((field) => field?.trim() === "" || field === undefined)){
                return res.status(400).send(handleError(
                    {
                        statusCode: 400, 
                        message: "username and password are required!", 
                        errors: {
                            RequiredField: "username, password"
                        }
                    }));
            }
        }

        //username validation
        if(/\s/.test(username)){
            return res.status(400).send(handleError(
                {
                    statusCode: 400, 
                    message: "username has white-space", 
                    errors: {
                        usernameFormat: "test1 or test@34"
                    }
                }));
        }

        //password validation
        if(/\s/.test(password)){
            return res.status(400).send(handleError(
                {
                    statusCode: 400, 
                    message: "password has white-space", 
                    errors: {
                        passwordFormat: "test1@1234-56"
                    }
                }));
        }

        //email validation
        if(email){
            if(/\s/.test(email)){
                return res.status(400).send(handleError(
                    {
                        statusCode: 400, 
                        message: "email has white-space", 
                        errors: {
                            emailFormat: "test111@test34.com"
                        }
                    }));
            }
    
            let emailRegex = /^[a-zA-Z0-9. _+-]+@[a-zA-Z0-9. -]+\.[a-zA-Z]{2,4}$/ 
    
            if(! emailRegex.test(email)){
                return res.status(400).send(handleError(
                    {
                        statusCode: 400, 
                        message: "email is invalid", 
                        errors: {
                            validEmailFormat: "xyz@abc.com"
                        }
                    }));
            }
        }

        let validExtension = ['image/png','image/jpg','image/jpe','image/jpeg'];
        let profileExtension = req.files?.profile[0]?.mimetype;
        console.log(validExtension.includes(profileExtension));
        if(! validExtension.includes(profileExtension)){
            return res.status(400).send(handleError({
                statusCode: 400, 
                message: "Profile image must be from .jpg, .jpeg, .png or .jpe", 
                errors: {
                    error: "Extension of profile image is wrong"
                }
            }))
        }
        next()
    },

    // login: async (req,res,next) => {
    //     console.log(req.method, req.url);

    //     let {username, password} = req.body

    //     if([username, password].some((field) => field?.trim() === "" || field === undefined)){
    //         return res.status(400).send(handleError(
    //             {
    //                 statusCode: 400, 
    //                 message: "username and password are required!", 
    //                 errors: this.field
    //             }));
    //     }

    //     //username validation
    //     username = username.trim()

    //     //password validation
    //     password = password.trim()

    //     next()
    // }, 

    task : async (req,res,next) => {
        try {

            if(!req.body) {
                // throw new ApiError(400,'Missing request body')
                return res.status(400).send(handleError(
                    {
                        statusCode: 400, 
                        message: "Missing request body", 
                        errors: {
                            message: "Doesn't get request body"
                        }
                    }));
            }
            
            let {title, description, dueDate, status, priority} = req.body;
            
            if(req.method === 'POST'){
                if([title, description, dueDate, priority, status].some((field) => field === "" || field === undefined))
                {
                    return res.status(400).send(handleError(
                        {
                            statusCode: 400, 
                            message: "all field required", 
                            errors: {
                                RequiredField: "title, description, dueDate, priority, status"
                            }
                        }));
    
                }
            }
            
            //title validation operation
            if(title) {
                let titleLength = title.length
                if(titleLength < 5 || titleLength > 20 ) {
                    //throw new ApiError(400,'title must be less than 20 letters')
                    return res.status(400).send(handleError(
                        {
                            statusCode: 400, 
                            message: "title must be less than 20 letters and greater than 5 letters", 
                            errors: {
                                message: "Length of title is must be in between the limit, limit is 5 to 20 letters"
                            }
                        }));
                }
            }
            
            //description validation operation
            if(description){
                let descriptionLength = description.length
                if(descriptionLength < 5 || descriptionLength > 500){
                    return res.status(400).send(handleError(
                        {
                            statusCode: 400, 
                            message: "description must be less than 500 letters and greater than 5 letters", 
                            errors: {
                                message: "Length of description is must be in between the limit, limit is 5 to 500 letters"
                            }
                        }));
                }
            }
                
            //due date validation operation
            if(dueDate){
                // console.log(dueDate);
            
                let dateRegex =/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/;
                        
                let currentDate = new Date()
            
                if(!(String(dueDate).match(dateRegex))){
                    return res.status(400).send(handleError(
                        {
                            statusCode: 400, 
                            message: "invalid date format", 
                            errors: {
                                validFormat: "YYYY-MM-DD"
                            }
                        }));
                    }
            
                //dueDateObject is date object of dueDate 
                let dueDateObject = new Date(dueDate)

                if(dueDateObject < currentDate) {
                    //res.status(400).send(new ApiError(400,'Current date is greater than due_date'))
                    return res.status(400).send(handleError(
                        {
                            statusCode: 400, 
                            message: "today's date is greater than dueDate", 
                            errors: {
                                message: "due date must be greater than today's date"
                            }
                        }));
                }
            }

            //priority validation
            if(priority){
                let priorityOptions = ['important','normal']
                if(!(priorityOptions.includes(priority))){
                    return res.status(400).send(handleError(
                        {
                            statusCode: 400, 
                            message: "Priority must be important or normal", 
                            errors: {
                                message: "Priority must be select from ['important','normal']"
                            }
                        }));
                }
            }

            //status validation
            if(status){
                let statusOptions = ['pending','hold','completed']
                if(!(statusOptions.includes(status))){
                    return res.status(400).send(handleError(
                        {
                            statusCode: 400, 
                            message: "status must be pending or hold or completed", 
                            errors: {
                                message: "status must be select from ['pending','hold','completed']"
                            }
                        }));
                }
            }

            //files validation 
            if(req.files.length > 3){
                return res.status(400).send(handleError(
                    {
                        statusCode: 400, 
                        message: "You only upload 3 or less files", 
                        errors: {
                            message: "More than 3 files uploaded"
                        }
                    }));
            }

            next()
            
        } catch (error) {
            handleError(error)
        }
    }
 
}

export {validator}