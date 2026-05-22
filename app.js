import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from 'dotenv'
dotenv.config()
import authRoutes from "./routes/authRoutes.js";

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use(
    cors({
        origin:
        "http://localhost:5173",

        credentials:true
    })
);

app.use(
    "/auth",
    authRoutes
);

app.listen(3000,()=>{
    console.log("Running on port 3000")
})

export default app;