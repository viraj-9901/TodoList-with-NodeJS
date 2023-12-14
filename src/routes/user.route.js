import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { loginUser } from "../controllers/login.controller.js";
import passport from "passport";
// import {  } from './passport-config.js':
import { } from '../passport-config.js'

const router = Router()

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/profile',passport.authenticate('jwt', { session: false }))
      .get((req, res) => {
            res.send('You have accessed a protected route!')
            }
        );

export default router

