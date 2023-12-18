import { ApiError, handleError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"; 
import mongoService from '../services/mongo.service.js';

import moment from 'moment';


moment().format();

//get tasks of user
const getTasks = asyncHandler(async (req,res) => {
    const {username} = req.params

    const filter = req.query.filter;
    console.log('filter: ',filter);
    let value = req.query.value;
    console.log('value: ',value);
    if(filter == ""){
        filter = 'priority'
        value = "normal"   
    }

    if(value == ""){
        filter == "priority"? value = 'normal' : value = 'pending'
    }

    const sort = req.query.sort;
    console.log('sort: ',sort);
    let sortOrder = req.query.order;
    console.log('sortOrder: ',sortOrder);
    if(sortOrder == "" || sortOrder == "asc"){
        sortOrder = 1
    } else { sortOrder = -1}

    // const user = req.query.user;
    // console.log('user: ',user);
    // let type = req.query.type;
    // console.log('type: ',type);
    // if(user == "") user = 'user' 
    // if(type == "") type = 'users'

    try {
        const data = await mongoService.getTasks(username,filter,value,sortOrder);
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


//add task to particular user
const createTask = asyncHandler( async(req,res) => {
    
    const {title, description, dueDate, status, priority} = req.body;
    const owner = req.params.username   

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
        return new ApiResponse(200,data)
    } catch (error) {
        return res.json(handleError(error));
    }

})

//delete task
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

//update task
const updateTask = asyncHandler(async (req,res) => {
    const username = req.params.username
    const taskId = req.params.taskId
    const info = req.body
    try {
        const data = await mongoService.updateTask(username,taskId,info)
        
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