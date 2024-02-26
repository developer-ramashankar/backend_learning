import connectDB from "./db/index.js";
// require('dotenv').config()
import dotenv from "dotenv"
import app from './app.js'
 
dotenv.config({
    path:"./.env"
})

connectDB()
.then(
    ()=>{
     app.listen(process.env.PORT ||3000,()=>{
        console.log(`Sever is online on port ${process.env.PORT} `)
     })   
    }
)
.catch((error)=>
(
    console.log(`Mongodb is connection failed🟠 ${error}`)
))