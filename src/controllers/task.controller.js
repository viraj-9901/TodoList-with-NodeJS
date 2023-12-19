import { ApiError, handleError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"; 
import mongoService from '../services/mongo.service.js';





//get tasks of user
const getTasks = asyncHandler(async (req,res) => {
    console.log(req.user._id);
    const userId = req.user._id

    const filter = req.query.filter;
    let value = req.query.value;

    if(filter == ""){
        filter = 'priority'
        value = "normal"   
    }

    if(value == ""){
        filter == "priority"? value = 'normal' : value = 'pending'
    }

    const sort = req.query.sort;
    let sortOrder = req.query.order;
    if(sortOrder == "" || sortOrder == "asc"){
        sortOrder = 1
    } else { sortOrder = -1}

    let role = req.user.role
    let type = req.query.type;
    if(type == "") type = 'users'

    try {
        const data = await mongoService.getTasks(userId,filter,value,sortOrder,role,type);
        return res.status(200).send(
            new ApiResponse(200,data)
        )
    } catch (error) {
        handleError(error,res)
    }
})

//get one particular task of user
const getOneTask = asyncHandler( async (req,res) => {
    const userId = req.user._id
    const taskId = req.params.taskId

    try {
        const data = await mongoService.getOneTask(userId,taskId);

        return res.status(200).send(
            new ApiResponse(200,data)
        )
    } catch (error) {
        handleError(error,res)
    }
})


//add task to particular user
const createTask = asyncHandler( async(req,res) => {
    console.log(req.user);
    const {title, description, dueDate, status, priority} = req.body;
    const owner = req.user._id

    try {
        const data = await mongoService.createTask(
            title, 
            description, 
            dueDate, 
            priority,  
            status,
            owner
        );
        
        return res.status(200).send(
            new ApiResponse(200,data)
        )
        //return new ApiResponse(200,data)
    } catch (error) {
        return res.json(handleError(error));
    }

})

//delete task
const deleteTask = asyncHandler(async (req,res) => {
    const userId = req.user._id
    const taskId = req.params.taskId
    const role = req.user.role

    try {
        const data = await mongoService.deleteTask(userId,taskId,role);

        return res.status(200).send(
            new ApiResponse(200,data)
        )
    } catch (error) {
        handleError(error,res)
    }
})

//update task
const updateTask = asyncHandler(async (req,res) => {
    const userId = req.user._id
    const taskId = req.params.taskId
    const info = req.body
    try {
        const data = await mongoService.updateTask(userId,taskId,info)
        
        return res.status(200).send(
            new ApiResponse(200,data)
        )

    } catch (error) {
        handleError(error,res)
    }
})


const taskController = {
    getTasks,
    getOneTask,
    createTask,
    deleteTask,
    updateTask
    
}

export default taskController