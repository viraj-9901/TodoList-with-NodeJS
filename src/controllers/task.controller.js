import { ApiError, handleError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"; 
import mongoService from '../services/mongo.service.js';
import moment from 'moment';


moment().format();

//get all tasks of user
const getAllTasks = asyncHandler(async (req,res) => {
    const {username} = req.params
    try {
        const data = await mongoService.getAllTasks(username);
        return res.status(200).send(
            new ApiResponse(200,data)
        )
    } catch (error) {
        handleError(error,res)
    }
})

//get one particular task of user
const getOneTask = asyncHandler( async (req,res) => {
    const username = req.params.username
    const taskId = req.params.taskId

    try {
        const data = await mongoService.getOneTask(username,taskId);

        return res.status(200).send(
            new ApiResponse(200,data)
        )
    } catch (error) {
        handleError(error,res)
    }
})

//get task(s) by priority
const getTaskByPriority = asyncHandler(async (req,res) => {
    const {username} = req.params;
    const {priority} = req.query;

    try {
        const data = await mongoService.getTaskByPriority(username,priority);

        return res.status(200).send(
            new ApiResponse(200,data)
        )
    } catch (error) {
        handleError(error,res)
    }
})

//get task(s) by status
const getTaskBystatus = asyncHandler( async (req,res) => {
    const {username} = req.params;
    const {status} = req.query;

    try {
        const data = await mongoService.getTaskBystatus(username,status)

        return res.status(200).send(
            new ApiResponse(200,data)
        )
    } catch (error) {
        handleError(error,res)
    }
})

//add task to particular user
const createTask = asyncHandler( async(req,res) => {
    
    const {title, description, due_date, status, priority} = req.body;
    const owner = req.params.username   
    let regex =/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/;
    
    let currentDate = Date.now()

    if(!String(due_date).match(regex)) throw new ApiError(400,"date formate invalid")
    const dueDateObj = moment(due_date, 'YYYY-MM-DD').toDate();

    if(dueDateObj < currentDate) throw new ApiError(400,'Current date is greater than due_date' )

    if([title, description, dueDateObj, priority, status, owner].some((field) => field === "" || field === undefined)){
        throw new ApiError(400,"all field required!")
    }


    try {
        const data = await mongoService.createTask(
            title, 
            description, 
            dueDateObj, 
            priority,  
            status,
            owner
        );
        
        return res.status(200).send(
            new ApiResponse(200,data)
        )
        return new ApiResponse(200,data)
    } catch (error) {
        return res.json(handleError(error));
    }

})

const deleteTask = asyncHandler(async (req,res) => {
    const username = req.params.username
    const taskId = req.params.taskId

    try {
        const data = await mongoService.deleteTask(username,taskId);

        return res.status(200).send(
            new ApiResponse(200,data)
        )
    } catch (error) {
        handleError(error,res)
    }
})

const taskController = {
    getAllTasks,
    getOneTask,
    getTaskByPriority,
    getTaskBystatus,
    createTask,
    deleteTask
}

export default taskController