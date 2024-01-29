import { ApiError, handleError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"; 
import mongoService from '../services/mongo.service.js';
import fs from 'fs'
// import { User } from "../models/user.model.js";
import { Task } from "../models/task.model.js";
import { User } from "../models/user.model.js";


//get tasks of user
const getTasks = asyncHandler(async (req,res) => {
    try{
        const userId = req.user._id
        
        let filter = {id: userId}

        let requestUrl = String(req.url)
        
        if(requestUrl.includes('?')){
            
            //filter tasks
        
            // // filter by priority
            let priority = req.query.priority;
        
            if(priority == "" || priority == 'undefined'){
                priority = "important"
            }
        
            // filter by status
            let status = req.query.status;
        
            if(status == "" || status == 'undefined'){
                status = "pending"
            }
        
            // sort by due date
            let sort = req.query.sort;
            
            if(sort == "" || priority == 'undefined'){
                sort = 1
            } else {
                sort = -1
            }

            // let filter = {priority,status,sort}
            filter.priority = priority;
            filter.status = status;
            filter.sort = sort;


            const data = await mongoService.getTasks(userId,filter)
            return res.status(200).send(
                new ApiResponse(200,data)
            )

        }

        const data = await mongoService.getTasks(userId,filter)
        return res.status(200).send(
            new ApiResponse(200,data)
        )
    } catch (error) {
        handleError(error,res)
    }
    
})

    //view users or tasks when admin call
    // let role = req.user.role
    // let type = req.query.type;             
    // if(type == "") type = 'users'

    //pagination
    // let limit = req.query.limit
    // if(limit == "") limit = 3
    // limit = parseInt(limit)             
    // let page = req.query.page;
    // if(page == "") page = 0
    // page = parseInt(page)
    // page = page - 1;

    
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
    const info = req.body;
    const owner = req.user._id
    let files = [];

    if(req.files.files){
        const fileList = req.files.files

        for(let i =0; i < fileList.length; i++){
            let file =  fileList[i]
            let userFile = file.originalname
            let originalFile = file.filename
            
            let temp = {
                userFileName: userFile,
                originalFileName: originalFile
            }
            files.push(temp)
            
        }
    }
   
    try {
        const data = await mongoService.createTask(
            info,
            owner,
            files,
            // originalFiles
        );
        
        return res.status(200).send(
            new ApiResponse(200,data)
        )
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
    const userRole = req.user.role

    let files = [];

    const task = await Task.findById(taskId)

    if(!task){
        return res.status(401).send(handleError({
            statusCode: 401,
            message: "Task not found",
            errors:{
                message: "wrong taskID"
            }
        }))
    }

    let previousFiles = task.files
    // console.log(previousFiles);

    if(req.files.files){
        const fileList = req.files.files
        for(let i =0; i < fileList.length; i++){
            let file =  fileList[i]
            let userFile = file.originalname
            let originalFile = file.filename

            let temp = {
                userFileName: userFile,
                originalFileName: originalFile
            }
            files.push(temp)
            
        }
    }

    for(let i = 0; i < files.length; i++){
        previousFiles.push(files[i])
    }

    try {
        const data = await mongoService.updateTask(userId,taskId,info,userRole,previousFiles)
        
        return res.status(200).send(
            new ApiResponse(200,data)
        )

    } catch (error) {
        handleError(error,res)
    }
})

//download file
const downloadFile = asyncHandler( async(req,res) => {

    let rawFilePath = process.env.FILE_PATH + req.user._id + '/' + 'files';
    let userFile = req.params.filename;
    let taskId = req.params.taskId;
    // let userId = req.user._id
    const filename = await mongoService.fileName(taskId, userFile)
    let filePath = rawFilePath + '/' + filename.originalFileName
    
    return res.download(filePath, filename.userFileName)
   
})

//delete file
const deleteFile = asyncHandler( async (req,res) => {
    let userId = req.user._id;
    let taskId = req.params.taskId;
    let userFile = req.params.filename;
    let info = req.body;
    let userRole = req.user.role;

    const task = await Task.findById(taskId)

    //delete file from database(mongoDB)
    if(!task){
        return res.status(401).send(handleError({
            statusCode: 401,
            message: "Task not found",
            errors:{
                message: "wrong taskID"
            }
        }))
    }

    let previousFiles = task.files;
    let updateFiles = []

    for(let i = 0; i < previousFiles.length; i++){
        if(previousFiles[i].userFileName !== userFile){
            updateFiles.push(previousFiles[i])
        }
    }

    //delete file from disk storage
    let rawFilePath = process.env.FILE_PATH + req.user._id + '/' + 'files';
    const filename = await mongoService.fileName(taskId, userFile)
    let filePath = rawFilePath + '/' + filename.originalFileName

    try {

        fs.unlink(filePath,(err) => {
            if(err){
                return res.status(500).send(handleError({
                    statusCode: 500,
                    message: "Something went wrong!",
                    errors: err
                }))
            }
        })

        const data = await mongoService.updateTask(userId,taskId,info,userRole,updateFiles)
        
        return res.status(200).send(
            new ApiResponse(200,data)
        )

    } catch (error) {
        handleError(error,res)
    }
  
})

//function: assign task to other user(s)
const assignTask = asyncHandler( async(req,res) => {
    try {
        let taskId = req.params.taskId;
        let userId = req.user._id;
        let assignToList = req.body.assignTo

        let task = await Task.findById(taskId);

        if(!task){
            return res.status(401).send(handleError({
                statusCode: 401,
                message: "Task not found",
                errors:{
                    message: "wrong taskID"
                }
            }))
        }

        if(String(task.owner) !== String(userId)){
            return res.status(401).send(handleError({
                statusCode: 401,
                message: "You are not allowed",
                errors:{
                    message: "Task owner and userId are different"
                }
            }))
        }

        task.assignTo = assignToList;
        task.save({validateBeforeSave: false})
        // let updatedAssignUserList = assignToList
        // const data = await mongoService.updateTaskAssignTo(updatedAssignUserList, taskId)

        return res.status(200)
                  .json(new ApiResponse(
                    200,
                    "Task assign successfully",
                    task.assignTo
                    // data
                  ))

    } catch (error) {
        handleError(error,res)
    }
})

//function: delete user from assign task
const removeUserFromAssignTask = asyncHandler( async(req,res) => {
    try {
        let taskId = req.params.taskId;
        let userId = req.user._id;
        let removeUserId = req.params.removeUserId;
        let updatedAssignUsersList = []

        let task = await Task.findById(taskId);

        if(!task){
            return res.status(401).send(handleError({
                statusCode: 401,
                message: "Task not found",
                errors:{
                    message: "wrong taskID"
                }
            }))
        }

        if(String(task.owner) !== String(userId)){
            return res.status(401).send(handleError({
                statusCode: 401,
                message: "You are not allowed",
                errors:{
                    message: "Task owner and userId are different"
                }
            }))
        }

        let previousAssignUsersList = task.assignTo;

        updatedAssignUsersList = previousAssignUsersList.filter((user) => user._id !== removeUserId)

        task.assignTo = [...updatedAssignUsersList];
        task.save({validateBeforeSave: false})
        return res.status(200).json(
            new ApiResponse(
                200,
                "User remove from assign list",
                task.assignTo
            )
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
    updateTask,
    downloadFile,
    deleteFile,
    assignTask,
    removeUserFromAssignTask
}

export default taskController