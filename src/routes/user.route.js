import { Router } from "express";
import { registerUser, loginUser, logOutUser, refreshAccessToken, updateUser, changePassword, uploadProfile } from "../controllers/user.controller.js";
import taskController from "../controllers/task.controller.js";
import { validator } from "../middlewares/validator.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router()

//route: register user 
router.route('/register')
      .post([upload.fields([{name: 'profile', maxCount: 1}]),validator.user],registerUser);

//route: login user 
router.route('/login')
      .post([upload.fields([{name: 'profile', maxCount: 1}]),validator.user],loginUser);

//route: logout user
router.route('/logout')
      .post(verifyJWT, logOutUser) 

//route: update user
router.route('/:username')
      .put([verifyJWT, upload.fields([{name:'porfile', maxCount: 1}]), validator.user], updateUser)

//route: change password
router.route('/:username/changePassword')
      .put([validator.token, upload.fields([{name:'profile', maxCount: 1}])], changePassword)

//route: upload profile
router.route('/:username/uploadProfile')
      .post([validator.token, upload.fields([{name:'profile', maxCount: 1}]), validator.user], uploadProfile)

//route: refresh access token
router.route('/refresh-token')
      .get(refreshAccessToken)

//route: get tasks of user
router.route('/:username')
      .get(validator.token, taskController.getTasks)
      // .get(verifyJWT, taskController.getTasks)

//route: get perticular task of user
router.route('/:username/:taskId')
      .get(validator.token,taskController.getOneTask);

//route: (post) add task 
router.route('/:username')
      .post([validator.token, upload.fields([{name:'files', maxCount: 3}]),validator.task], taskController.createTask);

//route: delete task from user
router.route('/:username/:taskId')
      .delete(validator.token,taskController.deleteTask);

//route: update particular task
router.route('/:username/:taskId')
      .put([validator.token, upload.fields([{name:'files', maxCount: 3}]),validator.task],taskController.updateTask);

//route: download file
router.route('/:username/:taskId/:filename')
      .get(validator.token, taskController.downloadFile)

//route: delete file
// router.route('/:username/:taskId/delete/:filename')
//       .get(validator.token, taskController.deleteFile)

export default router

