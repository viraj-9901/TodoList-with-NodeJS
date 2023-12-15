import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { loginUser } from "../controllers/login.controller.js";
import taskController from "../controllers/task.controller.js";
import { validator } from "../middlewares/validator.middleware.js";
// import { } from '../passport-config.js';

const router = Router()

//route: register user 
router.route('/register').post(registerUser);

//route: login user 
router.route('/login',validator.token).post(loginUser);

//route: get tasks of user
router.route('/:username',validator.token)
      .get(taskController.getTasks);

//route: get perticular task of user
router.route('/:username/:taskId',validator.token)
      .get(taskController.getOneTask);

//route: (post) add task 
router.route('/:username',[validator.token, validator.task])
      .post(taskController.createTask)

//route: delete task from user
router.route('/:username/:taskId',validator.token)
      .delete(taskController.deleteTask);

//route: update particular task
router.route('/:username/:taskId',[validator.token, validator.task])
      .put(taskController.updateTask);

export default router

