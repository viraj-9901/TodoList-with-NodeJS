import express from "express";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from "passport";
import bodyParser from "body-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    // Access-Control-Allow-Credentials: true
}))
app.use(express.urlencoded({extended: true, limit:'16kb'}))
app.use(express.json())
app.use(cookieParser())
app.use(passport.initialize())
app.use(express.static("public")) 


//import routes here
import registerUserRoute from "./routes/user.route.js";

//call api here
app.use('/user',registerUserRoute)
    

export {app}