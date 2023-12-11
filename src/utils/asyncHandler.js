const asyncHandler = (requestHandler) => {
    return (req,res,next) => {
    Promise .resolve(requestHandler(req,res,next))
            .catch((err) => next(err))
}
}

export {asyncHandler}

//this asyncHandler function take a function as a argument and do async task
/**
    syntax reference of this asyncHandler function
    const function_name = () => {() => {}}
*/