import { Task } from "../models/task.model.js";
import { ApiError, handleError } from "../utils/ApiError.js";

//function: get task of user
const getTasks = async (username,key,value) => {
    try {
        let filter = {}
        filter[key] = value

        if(Object.keys(filter).length == 0){
            return await Task.find({"owner": username})
        } else {
            return await Task.find({
                $and: [{"owner": username}, filter]
            })
        }
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

//function: update task
const updateTask = async (username,taskId,info) => {
    try {

        const previousData = await Task.findOne({
            $and: [{"owner": username}, {"_id": taskId}]
        })
        
        return await Task.updateOne(
            {
                $and: [{"owner": username}, {"_id": taskId}]
            },
            {
                $set : {
                    title: info.title || previousData.title,
                    description: info.description || previousData.description,
                    due_date: info.due_date || previousData.due_date,
                    priority: info.priority || previousData.priority,
                    status: info.status || previousData.status
                }
            }            
        )
    } catch (error) {
        handleError(error,res)
        
    }
}

const mongoService = {
    getTasks,
    getOneTask,
    createTask,
    deleteTask,
    updateTask
}

export default mongoService