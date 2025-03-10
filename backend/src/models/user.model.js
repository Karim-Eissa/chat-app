import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
    {
        email:{
            type: String,
            required: true,
            unique:true
        },
        fullName:{
            type: String,
            required: true,
            unique:true
        },
        password:{
            type: String,
            required: true,
            minlength: 6
        },
        profilePic:{
            type: String,
            default:""
        },
        isVerified: {
            type: Boolean, 
            default: false 
        }, 
        verificationToken: { 
            type: String 
        },
        resetPasswordToken:{
            type: String 
        },
        resetPasswordExpires:{
            type: Date
        },
        friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],  
    },
    {timestamps:true}
);
const User=mongoose.model("User",userSchema);
export default User;