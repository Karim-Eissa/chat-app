import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js"
import friendRoutes from "./routes/friend.route.js";
import {connectDB} from "./lib/db.js"
import cookieParser from "cookie-parser"
import morgan from "morgan";
import cors from "cors";
import {app,server} from "./lib/socket.js"
import path from "path";
dotenv.config();
const port = process.env.PORT || 3001;
const __dirname = path.resolve();
app.use(morgan('dev'));
app.use(express.json({ limit: "10mb" }));  
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"]
}));



app.use("/api/auth",authRoutes);
app.use("/api/messages",messageRoutes);
app.use("/api/friends", friendRoutes);

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));
  
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    });
  }

server.listen(port,()=>{
    console.log("Server is running on port",port)
    connectDB();
});