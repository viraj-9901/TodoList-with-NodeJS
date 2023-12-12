import mongoose,{ Schema } from "mongoose";
import bcrypt from 'bcrypt';
import Jwt from "jsonwebtoken";

const userSchema = new Schema({
    username:{
        type: String,
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
 })

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
} 

userSchema.methods.getAccessToken = function(){
    return Jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
            password: this.password
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}



export const User = mongoose.model('User',userSchema)