import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { loginUser } from "../controllers/login.controller.js";
import taskController from "../controllers/task.controller.js";
import { validator } from "../middlewares/validator.middleware.js";
// import { } from '../passport-config.js';

const router = Router()

//route: register user 
router.route('/register')
      .post(validator.register,registerUser);

//route: login user 
router.route('/login')
      .post(validator.login,loginUser);

//route: get tasks of user
router.route('/:username').get(validator.token, taskController.getTasks)

//route: get perticular task of user
router.route('/:username/:taskId')
      .get(validator.token,taskController.getOneTask);

//route: (post) add task 
router.route('/:username')
      .post([validator.token,validator.task], taskController.createTask)

//route: delete task from user
router.route('/:username/:taskId')
      .delete(validator.token,taskController.deleteTask);

//route: update particular task
router.route('/:username/:taskId')
      .put([validator.token,validator.task],taskController.updateTask);

//route: Admin 
//router.route('/admin/:username',validator.token).get(taskController.getAllData)

export default router

