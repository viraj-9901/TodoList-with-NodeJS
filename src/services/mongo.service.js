import { Task } from "../models/task.model.js";
import { ApiError, handleError } from "../utils/ApiError.js";

//function: get all task of user
const getAllTasks = async (username) => {
    try {
        return await Task.find({"owner": username})
    } catch (error) {
        handleError(error,res)
    }
}

//function: get particular task of user
const getOneTask = async (username,taskId) => {
    try {
        return await Task.findOne({
            $and: [{"owner": username}, {"_id": taskId}]
        }) 
    } catch (error) {
        handleError(error,res)
    }
}

//function: get task by priority
const getTaskByPriority = async (username,priority) => {
    try {
       return await Task.find({
            $and: [{"owner": username}, {"priority": priority}]
        })
    } catch (error) {
        handleError(error,res)
    }
}

//function: get task by status
const getTaskBystatus = async (username,status) => {
    try {
        return await Task.find({
            $and: [{"owner": username}, {"status": status}]
        })
    } catch (error) {
        handleError(error,res)
    }
}

//function: create task for user
const createTask = async (title, description, dueDateObj, priority, status, owner) => {
    try {
        const task = await Task.create({
            title, 
            description, 
            due_date: dueDateObj, 
            priority,  
            status,
            owner
        }) 
        return task
    } catch (error) {
        // handleError(error)
        throw new ApiError(400,error)
    }
}

//function: delete task
const deleteTask = async (username,taskId) => {
    try {
        return await Task.deleteOne({
            $and: [{"owner": username}, {"_id": taskId}]
        }) 
    } catch (error) {
        handleError(error,res)
    }
}

const mongoService = {
    getAllTasks,
    getOneTask,
    getTaskByPriority,
    getTaskBystatus,
    createTask,
    deleteTask
}

export default mongoService