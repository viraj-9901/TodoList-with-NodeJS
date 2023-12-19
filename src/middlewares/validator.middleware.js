//import moment from 'moment';
//import format from 'format'
import passport from "passport";
import { } from '../passport-config.js';
import { ApiError, handleError } from "../utils/ApiError.js";
// moment().format();

const validator = {
    token : passport.authenticate('jwt', { session: false }), 

    task : async (req,res,next) => {

        try {
             
            if(!req.body) {
                // throw new ApiError(400,'Missing request body')
                return res.status(400).send(handleError(
                    {
                        statusCode: 400, 
                        message: "Missing request body", 
                        errors: "test"
                    }));
            }
            
            let {title, description, dueDate, status, priority} = req.body; 
            
            if([title, description, dueDate, priority, status].some((field) => field === "" || field === undefined))
            {
                return res.status(400).send(handleError(
                    {
                        statusCode: 400, 
                        message: "all field required", 
                        errors: "test"
                    }));

                //return res.status(400).send(new ApiError())
            }
            
            //title validation operation
            if(title) {
                let titleLength = title.length
                if(titleLength > 20 ) {
                    //throw new ApiError(400,'title must be less than 20 letters')
                    return res.status(400).send(handleError(
                        {
                            statusCode: 400, 
                            message: "title must be less than 20 letters", 
                            errors: "test"
                        }));
                }
            }
            
            //description validation operation
            if(description){
                let descriptionLength = description.length
                if(descriptionLength > 500){
                    //throw new ApiError(400, 'description must be less than 500 letters')
                    return res.status(400).send(handleError(
                        {
                            statusCode: 400, 
                            message: "description must be less than 500 letters", 
                            errors: "test"
                        }));
                }
            }
                
            //due date validation operation
            console.log(dueDate);
            
            // let regex =/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/;
            let regex = /(\d{4})-(\d{2})-(\d{2})/
                        
            // let currentDate = new Date().toISOString().slice(0, 10);
            let currentDate = new Date()
            
            let dueDateObject = new Date(dueDate)
            
            //if(! (String(dueDate).match(regex))) throw new ApiError(400,"date formate invalid")
            
            if(!(String(dueDate).match(regex))){
                return res.status(400).send(handleError(
                    {
                        statusCode: 400, 
                        message: "invalid date format", 
                        errors: {
                            validFormat: "YYYY-MM-DD"
                        }
                    }));
            }
                    
            // if(dueDate < currentDate) throw new ApiError(400,'Current date is greater than due_date' )
            if(dueDateObject < currentDate) {
                //res.status(400).send(new ApiError(400,'Current date is greater than due_date'))
                return res.status(400).send(handleError(
                    {
                        statusCode: 400, 
                        message: "Current date is greater than dueDate", 
                        errors: "test"
                    }));
            }

            next()
            
        } catch (error) {
            handleError(error)
        }
    },

    register: async (req,res,next) => {
        const {username, email, password, role} = req.body
        //check any element come empty from user
        if([username, email, password].some((field) => field?.trim() === "" || field === undefined)){
            throw new ApiError(400,"all field required!")
        }

        next()
    },

    login: async (req,res,next) => {
        const {username, password} = req.body

        //check any element come empty from user
        if([username, password].some((field) => field?.trim() === "" || field === undefined)){
            throw new ApiError(400,"username and password required!",['Error details'])
        }

        next()
    },


     

}

export {validator}