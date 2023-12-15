import moment from 'moment';
import passport from "passport";
import { } from '../passport-config.js';
import { ApiError } from "../utils/ApiError.js";

const validator = {
    token : passport.authenticate('jwt', { session: false }), 

    task : async (req,res,next) => {

        if(! req.body) throw new ApiError(400,'Missing request body')

        const {title, description, dueDate, status, priority} = req.body;
        const owner = req.params.username  

        if([title, description, dueDate, priority, status, owner].some((field) => field === "" || field === undefined)){
            throw new ApiError(400,"all field required!")
        }

        //title validation operation
        if(title) {
            let titleLength = length(title)
            if(! 5 < titleLength < 20 ) throw new ApiError(400,'title must be greater than 5 letters and less than 20 letters')
        }

        //description validation operation
        if(description){
            let descriptionLength = length(description) 
            if(! 100 < descriptionLength < 500) throw new ApiError(400, 'description must be greater than 100 letters and less than 500 letters')
        }

        //due date validation operation
        if(dueDate){
            let regex =/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/;
            
            let currentDate = Date.now()

            if(!String(dueDate).match(regex)) throw new ApiError(400,"date formate invalid")
            dueDate = moment(dueDate, 'YYYY-MM-DD').toDate();

            if(dueDate < currentDate) throw new ApiError(400,'Current date is greater than due_date' )
        }

    }

}

export {validator}