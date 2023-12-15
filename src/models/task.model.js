import {mongoose, Schema} from "mongoose";

const taskSchema = new Schema({
    title:{
        type:String,
        required: true,
        lowerCase: true,
        index: true
    },
    description:{
        type:String,
        required: true
    },
    due_date:{
        type: Date,
        required: true
    },
    priority:{
        type: String,
        required: true
    },
    status:{
        type: String,
        default: null
    },
    owner:{
        type: String,
        required: true
    }
},{ timestamps: true })

export const Task = mongoose.model("Task", taskSchema)