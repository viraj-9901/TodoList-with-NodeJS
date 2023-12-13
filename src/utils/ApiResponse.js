class ApiResponse{
    constructor(statusCode,message= "success",token,data){
        this.statusCode = statusCode
        this.token = token
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
}

export {ApiResponse}

/**
 * Apiresponse use while send data to database or user when task complete successfully.
 */