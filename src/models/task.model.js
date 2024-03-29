import {mongoose, Schema} from "mongoose";

// const fileSchema = new Schema({
//     files:{
//         type:String
//     }
// })

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
    dueDate:{
        type: Date,
        required: true
    },
    priority:{
        type: String,
        required: true,
        enum: ['important','normal']
    },
    status:{
        type: String,
        enum: ['pending','hold','completed']
    },
    owner:{
        type: Schema.Types.ObjectId,
        required: true
    },
    assignTo:{
        // type: Schema.Types.ObjectId,
        type: Object,
        ref: 'User'
    },
    files: {
        type: Object
    }
},{ timestamps: true })

taskSchema.pre('save', async function(req,res,next){
    if(this.files && this.isModified('files')){
    }
})

export const Task = mongoose.model("Task", taskSchema)