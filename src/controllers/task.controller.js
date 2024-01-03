import { ApiError, handleError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"; 
import mongoService from '../services/mongo.service.js';
import fs from 'fs'




//get tasks of user
const getTasks = asyncHandler(async (req,res) => {
    const userId = req.user._id
    
    //filter tasks
    // const filter = req.query.filter;
    // let value = req.query.value;

    // if(filter == ""){
    //     filter = 'priority'
    //     value = "normal"   
    // }

    // if(value == ""){
    //     filter == "priority"? value = 'normal' : value = 'pending'
    // }

    //sort tasks in order
    // let sort = req.query.sort;
    // if(sort == "" || sort == "asc"){
    //     sort = 1
    // } else { sort = -1}

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

    try {
        // const data = await mongoService.getTasks(userId,filter,value,sort,role,type,limit,page);
        const data = await mongoService.getTasks(userId)
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
    const info = req.body;
    console.log(info);
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
    const userRole = req.user.role

    try {
        const data = await mongoService.updateTask(userId,taskId,info,userRole)
        
        return res.status(200).send(
            new ApiResponse(200,data)
        )

    } catch (error) {
        handleError(error,res)
    }
})

//download file
const downloadFile = asyncHandler( async(req,res) => {

    let rawFilePath = '/home/comp-167/Desktop/Viraj/TodoList-with-NodeJS/Public/files/'+req.user._id;
    let userFile = req.params.filename;
    let taskId = req.params.taskId;
    // let userId = req.user._id
    const filename = await mongoService.fileName(taskId, userFile)
    let filePath = rawFilePath + '/' + filename.originalFileName
    return res.download(filePath, filename.userFileName)
   
})

const taskController = {
    getTasks,
    getOneTask,
    createTask,
    deleteTask,
    updateTask,
    downloadFile
    
}

export default taskController