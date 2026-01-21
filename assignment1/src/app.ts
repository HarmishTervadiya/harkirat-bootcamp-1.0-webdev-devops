import express from 'express'
import sql from './db'


const app=express()

app.get("/",async (_, res)=> {
    const data= await sql`Select * from users`
    console.log(data)
    res.send("Hi, Harmis")
})


export default app