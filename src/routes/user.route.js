import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { loginUser } from "../controllers/login.controller.js";
import passport from "passport";
import { } from '../passport-config.js';
import taskController from "../controllers/task.controller.js";

const router = Router()

//route: register user 
router.route('/register').post(registerUser);

//route: login user 
router.route('/login').post(loginUser);

//route: get all tasks of user
router.route('/:username',passport.authenticate('jwt', { session: false }))
      .get(taskController.getTasks);

//route: get perticular task of user
router.route('/:username/:taskId',passport.authenticate('jwt', { session: false }))
      .get(taskController.getOneTask);

//route: (post) add task 
router.route('/:username',passport.authenticate('jwt', { session: false }))
      .post(taskController.createTask)

//route: delete task from user
router.route('/:username/:taskId',passport.authenticate('jwt', { session: false }))
      .delete(taskController.deleteTask);

//route: update particular task
router.route('/:username/:taskId',passport.authenticate('jwt', { session: false }))
      .put(taskController.updateTask);

export default router

