import mongoose from "mongoose";
export const connectDB = async () =>{
    try{
        const db= process.env.DATABASE_URL;
        const connection=await mongoose.connect(db);
        console.log(`MongoDB connected ${connection.connection.host}`)
    }catch(error){
        console.log(error)
    }
}