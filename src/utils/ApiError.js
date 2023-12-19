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

const handleError = (err) => {
  try {
    const { statusCode, message, errors } = err;
    return {
      statusCode:statusCode,
      success: false,
      error: {
        statusCode,
        message,
        errors,
      },
      data: null,
    }
  } 
  catch (error) {
    console.log(error);
    const { statusCode, message, errors } = error;

    return {
      statusCode:statusCode,
      success: false,
      error: {
        statusCode,
        message,
        errors,
      },
      data: null,
    }
  }
};

export {ApiError, handleError}

/**
 * this ApiError function call when any error accour while running a controller file
 * (if we call this file)
 */