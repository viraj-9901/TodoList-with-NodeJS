import { Task } from "../models/task.model.js";
import { User } from "../models/user.model.js";
import { ApiError, handleError } from "../utils/ApiError.js";

//function: get task of user
const getTasks = async (username,filter,value,sortOrder = 1,role,type) => {
    try {
        let filterOption = {}
        filterOption[filter] = value

        if(role == 'admin'){ 
            if(type == 'tasks') return await Task.find()
            return await User.find()
        }
        if(Object.keys(filter).length == 0){
            return await Task.find({"owner": username})
        } else {
            return await Task.find({
                $and: [{"owner": username}, filterOption]
            }).sort({dueDate: sortOrder})
        }
    } catch (error) {
        handleError(error,res)
    }
}

//function: get particular task of user
const getOneTask = async (userId,taskId) => {
    try {
        return await Task.findOne({
            $and: [{"owner": userId}, {"_id": taskId}]
        }) 
    } catch (error) {
        handleError(error,res)
    }
}

//function: create task for user
const createTask = async (title, description, dueDate, priority, status, owner) => {
    try {
        const task = await Task.create({
            title, 
            description, 
            dueDate, 
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
const deleteTask = async (userId,taskId,role) => {
    try {

        if(role == "admin"){
            return await Task.deleteOne({
                "_id": taskId
            }) 
        }
        return await Task.deleteOne({
            $and: [{"owner": userId}, {"_id": taskId}]
        }) 
    } catch (error) {
        handleError(error,res)
    }
}

//function: update task
const updateTask = async (userId,taskId,info) => {
    try {

        const previousData = await Task.findOne({
            $and: [{"owner": userId}, {"_id": taskId}]
        })
        
        return await Task.updateOne(
            {
                $and: [{"owner": username}, {"_id": taskId}]
            },
            {
                $set : {
                    title: info.title || previousData.title,
                    description: info.description || previousData.description,
                    dueDate: info.dueDate || previousData.duDate,
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
    updateTask,
}

export default mongoService