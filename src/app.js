import express from "express";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from "passport";
import bodyParser from "body-parser";
// import { fileURLToPath } from 'url';
// import path, { dirname, join } from 'path';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename.split('/TodoList-with-NodeJS')[0]);


const app = express();

app.use(cors({
    origin: ["http://localhost:3000","http://localhost","127.0.0.1:3000"],
    credentials: true,
    // Access-Control-Allow-Credentials: true
}))
app.use(express.urlencoded({extended: true, limit:'16kb'}))
app.use(express.json())
app.use(cookieParser())
app.use(passport.initialize())
app.use(express.static("public")) 
// app.use(express.static(path.join(__dirname,'Frontend','todolist-with-react','build','index.html')));

//import routes here
import userRoute from "./routes/user.route.js";

//call api here
app.use('/user',userRoute)
    

export {app}