import mongoose from "mongoose";
import {dataBase_name} from '../constants.js'

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${dataBase_name}`)
        console.log('database connected!');
    } catch (error) {
        console.log('error occur while connecting database: ',error);
    }
}

export {connectDB}