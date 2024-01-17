import passport from "passport";
import { } from '../passport-config.js';
import { ApiError, handleError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
// import Jwt from "jsonwebtoken";
import { upload } from "../middlewares/multer.middleware.js";

//date formater 
Date.prototype.dateFormat = function(todayDate){
    let month = todayDate.getMonth();
    let date = todayDate.getDate()
    if(todayDate.getMonth() + 1 < 10){
        month = '0'+ (todayDate.getMonth() + 1)
    }
    if(todayDate.getDate() < 10){
        date = '0'+ todayDate.getDate() 
    }
    return (todayDate.getFullYear() + '-' + month + '-' + date)
}

const validator = {
    token : async(req,res,next) => {
        try 
        {   
            // console.log(req);
            const routeUsername = req.params.username;
           
            
            let token = req.cookies.accessToken
            // console.log('1', req.headers.authorization);

            if(token){
                req.headers.authorization = 'Bearer ' + token
                // console.log('2', req.headers.authorization);
            }
            
            
            let authenticateReturnFun = passport.authenticate('jwt', { session: false }, async (error, token) => {
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
                    
                    const user = await User.findOne(
                        {_id: token._id}
                    );
                    req.user = user;
                    // console.log(req.user);
                    // console.log(token);
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
                    next()
                } catch (error) {
                    next(error);
                }
                
            });
            authenticateReturnFun(req,res,next);

        } catch (error)
        {
            console.log('test');
            // next()
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
        } else if(req.url === '/login'){
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
        if(req.files.profile){
            let profileExtension = req.files?.profile[0]?.mimetype;
            // console.log(validExtension.includes(profileExtension));
            if(! validExtension.includes(profileExtension)){
                return res.status(400).send(handleError({
                    statusCode: 400, 
                    message: "Profile image must be from .jpg, .jpeg, .png or .jpe", 
                    errors: {
                        error: "Extension of profile image is wrong"
                    }
                }))
            }
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
            // console.log(req.body);
            let {title, description, dueDate, status, priority} = req.body;
           
            if(req.method === 'POST'){
                
                if([title, description, dueDate, priority, status].some((field) => field === "" || field === undefined))  
                {
                 
                    return res.status(400).send(handleError(
                        {
                            statusCode: 400, 
                            message: "All fields are required to add task", 
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
                        
                let currentDate = new Date().dateFormat(new Date())
                // let currentDate = Date.dateFormat(new Date())
            
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
            // upload(req, res, function (err) {
            //     if (err instanceof multer.MulterError) {
            //     // A Multer error occurred when uploading.
            //     return res.status(400).send(handleError({
            //             statusCode: 400, 
            //             message: "You only upload 3 or less files", 
            //             errors: {
            //                 message: "More than 3 files uploaded"
            //             }
            //         }
            //     ))
            //     } else if (err) {
            //     // An unknown error occurred when uploading.
            //     return res.status(400).send(handleError({
            //         statusCode: 400, 
            //         message: "something went wrong while uploading file", 
            //         errors: {
            //             message: "error from nowhere"
            //         }
            //     }
            //     ))
            //     }
            // })
            if(req.files.files) {
                let filesLength = req.files.files.length

                if(filesLength > 3){
                    return res.status(400).send(handleError(
                        {
                            statusCode: 400, 
                            message: "You only upload 3 or less files", 
                            errors: {
                                message: "More than 3 files uploaded"
                            }
                        }));
                }
          
                let validExtension = ['file/pdf','file/mpp','file/mpt','file/doc','file/docm','file/docx','file/ppt','file/pptm','file/pptx','text/plain'];
                for(let i = 0; i < filesLength; i++){
                    let fileExtension = req.files?.files[i]?.mimetype;

                    if(! validExtension.includes(fileExtension)){
                            return res.status(400).send(handleError({
                                statusCode: 400, 
                                message: "file must be from .pdf, .doc, .txt, .docx, .ppt, .pptm, .pptx, .mpp, .mpt", 
                                errors: {
                                    error: "Extension of file is wrong"
                                }
                            }))
                        }
                }
            }


            next()
            
        } catch (error) {
            handleError(error)
        }
    }
 
}

export {validator}