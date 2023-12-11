class ApiError extends Error{
    constructor(
        statusCode,
        message = "something went wrong",
        errors = [],
    ){
        super(message)
        this.statusCode = statusCode
        this.message = message
        this.success = false
        this.errors = errors
        this.data = null

    }
}

export {ApiError}

/**
 * this ApiError function call when any error accour while running a controller file
 * (if we call this file)
 */