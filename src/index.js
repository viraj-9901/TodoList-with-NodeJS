import {connectDB} from './db/index.js'
import dotenv from 'dotenv'
import {app} from './app.js';
import { Server } from 'socket.io';
let io = null;

dotenv.config({
    path: './.env'
})


 

connectDB()
.then(() => {
   let http = app.listen(process.env.PORT || 3000, () =>{
        console.log(`server started at port ${process.env.PORT}`);
    });

     io = new Server(http, {
        cors: {
          origin: ["http://localhost:3000","http://localhost","127.0.0.1:3000"],
          methods: ["GET", "POST"]
        }
      }); 
})                                     
.then(() => {
    io.on('connection', (socket) => {
        console.log('user connected');
        socket.send(`user connected ${socket.id}`);
    
        
        io.emit("message", "hello from servers")

        io.emit("greetings", "Jay Shree Ram")

        socket.on("message", (data) => {
            console.log(data);
        });
    })

})
.catch((error) => {
    console.log('connection fail: ',error);
})


  


