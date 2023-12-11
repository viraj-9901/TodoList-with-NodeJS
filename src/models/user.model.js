import mongoose,{ Schema } from "mongoose";
import bcrypt from 'bcrypt'

const userSchema = new Schema({
    username:{
        type: String,
        //case: only for registration use
        required: true,
        lowerCase: true,
        trim: true,
        unique: true,
        index: true
    },
    email:{
        type: String,
        required: true,
        lowerCase: true,
        unique: true,
    },
    password:{
        type: String,
        required: true,
    }
}, { timestamps: true }) 

userSchema.pre('save', async function(next){
    try {
        if(this.password && this.isModified('password')){
            this.password = await bcrypt.hash(this.password,2)
        }
        next()
    } catch (error) {
        next(error)
    }
//    if(!this.isModified(this.password)) return next();

    // this.password = await bcrypt.hash(this.password,2)
    // next();
    // hash = await bcrypt.hash(this.password, 2)
    // .then((hash) => this.password = hash )
    // .catch((error) => next(error))
    
 })

export const User = mongoose.model('User',userSchema)