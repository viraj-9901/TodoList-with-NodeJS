import { ApiError, handleError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"; 
import mongoService from '../services/mongo.service.js';
import fs from 'fs'




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
    console.log(info);
    const owner = req.user._id
    let files = [];
    console.log("input files: ",req.files);
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

    let rawFilePath = process.env.FILE_PATH+req.user._id;
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