import { Task } from "../models/task.model.js";
import { User } from "../models/user.model.js";
import { ApiError, handleError } from "../utils/ApiError.js";
import { ObjectId } from 'mongodb'

//function: get task of user
// const getTasks = async (userId,filter,value,sort = 1,role,type,limit,page) => {
    const getTasks = async (userId,filter) => {
    try {
        // let skip = limit * page;

        // if(role == 'admin'){ 
        //     if(type == 'tasks') return await Task.find(filterOption).skip(skip).limit(limit)
        //     return await User.find(filterOption).skip(skip).limit(limit)
        // }

        if(Object.keys(filter).length < 2)
        {
            return await Task.find({owner: userId})
        } 
        
        return await Task.find({
                $and: [{owner: userId}, {priority: filter.priority}, {status: filter.status}]
                    //    { $or: [{priority: priority}, {status: status}]}]
                }).sort({dueDate: filter.sort})
        
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
const createTask = async (info, owner, files, originalFiles) => {
    try {
        const task = await Task.create({
            title: info.title, 
            description: info.description, 
            dueDate: info.dueDate, 
            priority: info.priority,  
            status: info.status,
            owner,
            files: files,
            originalFiles: originalFiles
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
const updateTask = async (userId,taskId,info,userRole) => {
    try {
        const previousData = await Task.findOne({_id: taskId})

        async function updatePerform() {
            return await Task.updateOne(
                {
                    _id: taskId
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
        }
        
        if(userId.equals(previousData.owner)){
            return updatePerform() 
        }else if(userRole == "admin"){
            return updatePerform()
        }else {
            let message = {
                message: "you are not allowed to update this task"
            }

            return message
        }
    } catch (error) {
        handleError(error,res)
        
    }
}

//function: get file name for download
const fileName = async(taskId, userFile) => {
    const file = await Task.aggregate([
        {
            $match : {_id: new ObjectId(taskId)}
        },
        {
            $match: {
                files:{
                    $elemMatch: {
                        userFileName : userFile
                    }
                }
            }
        }
    ])

    if(file[0].files){
        let fileListLength = file[0].files.length

        for(let i = 0; i < fileListLength; i++){
            if(file[0].files[i].userFileName == userFile){
                return file[0].files[i]
            }
        }

    }
    // return file.files[originalFileName]
}

//function: update user
const updateUser = async(userId, info) => {
    try {
        const user = await User.findById(userId);

        return await User.updateOne(
            {
                _id: userId
            },
            {
                $set:{
                    username: info.username || user.username,
                    email: info.email || user.email,
                    role: info.role || user.role,
                    password: info.password || user.password

                }
            },
            {
                new: true
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
    fileName,
    updateUser
}

export default mongoService