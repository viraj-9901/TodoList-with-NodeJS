import mongoose,{ Schema } from "mongoose";
import bcrypt from 'bcrypt';
import Jwt from "jsonwebtoken";
import { handleError } from "../utils/ApiError.js"; 

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
    profile:{
        type: Object
    },
    role:{
        type:String,
        default: 'user'
    },
    password:{
        type: String,
        required: true,
    },
    refreshToken:{
        type: String
    },
    isVerified:{
        type: Boolean,
        default: false
    },
    verificationToken:{
        type: String
    }
}, { timestamps: true }) 

//hash password before user create in database
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

//compare user password with stored hashPassword in database while login 
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
} 

//generate jwt token 
userSchema.methods.getAccessToken = function(){
    return Jwt.sign(
        {
            _id: this._id,
            // username: this.username,
            // email: this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

//generate Refresh token
userSchema.methods.getRefreshToken = function(){
    return Jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model('User',userSchema)

