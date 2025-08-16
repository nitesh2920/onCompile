import express from "express"
import type { Application } from "express";
import { clerkMiddleware } from "@clerk/express";
import dotenv from "dotenv"
import cors from "cors"
import codeRoutes from "./routes/codeRoutes.js"
import AuthCodeRoutes from "./routes/authCodeRoutes.js"
import axios from "axios";
import { clerkClient } from '@clerk/express';




dotenv.config()


const app:Application=express()
const port=process.env.PORT || 5000;

app.use(cors())
app.use(express.json());
app.use(clerkMiddleware());


app.use("/api",codeRoutes);
app.use("/api/codes",AuthCodeRoutes);



app.listen(port,()=>{
    console.log(`server is running on port ${port}`)
})






    // "dev": "ts-node-dev --respawn --transpile-only src/index.ts ",
