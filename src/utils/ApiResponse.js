class ApiResponse{
    constructor(statusCode,message= "success",data){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
}

export {ApiResponse}

/**
 * Apiresponse use while send data to database or user when task complete successfully.
 */