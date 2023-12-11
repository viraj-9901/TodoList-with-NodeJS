import express from "express";
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.urlencoded({extended: true, limit:'16kb'}))
app.use(express.json())
app.use(cookieParser())


//import routes here
import registerUserRoute from "./routes/user.route.js";


app.use('/user',registerUserRoute)

// app.post('/user', (req,res) => {
//     // res.send(req.body)
//     console.log(req.body);
// })

export {app}