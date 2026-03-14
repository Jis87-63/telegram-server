import express from "express"
import dotenv from "dotenv"

import { createClient } from "./src/telegram/telegramClient.js"
import { saveSession, getSession } from "./src/sessionManager/sessionManager.js"
import { addToQueue } from "./src/queue/messageQueue.js"

dotenv.config()

const app = express()

app.use(express.json())

const API_ID = process.env.API_ID
const API_HASH = process.env.API_HASH

let loginData = {}

app.get("/", (req,res)=>{

  res.json({
    status:"Telegram server running"
  })

})

app.post("/login/start", async (req,res)=>{

  const { phone } = req.body

  try{

    const client = await createClient("", API_ID, API_HASH)

    const result = await client.sendCode({
      apiId:Number(API_ID),
      apiHash:API_HASH
    }, phone)

    loginData[phone] = {
      phoneCodeHash: result.phoneCodeHash
    }

    res.json({
      status:"CODE_SENT",
      phoneCodeHash: result.phoneCodeHash
    })

  }catch(err){

    res.status(500).json({
      error:err.message
    })

  }

})

app.post("/login/verify", async (req,res)=>{

  const { phone, code } = req.body

  try{

    const client = await createClient("", API_ID, API_HASH)

    await client.invoke({
      _: "auth.signIn",
      phone_number: phone,
      phone_code_hash: loginData[phone].phoneCodeHash,
      phone_code: code
    })

    const session = client.session.save()

    saveSession(phone, session)

    res.json({
      status:"CONNECTED"
    })

  }catch(err){

    res.status(500).json({
      error:err.message
    })

  }

})

app.post("/message/send", async (req,res)=>{

  const { phone, username, message } = req.body

  const session = getSession(phone)

  if(!session){

    return res.json({
      error:"Session not found"
    })

  }

  const client = await createClient(session, API_ID, API_HASH)

  addToQueue(async ()=>{

    await client.sendMessage(username,{
      message:message
    })

  })

  res.json({
    status:"MESSAGE_QUEUED"
  })

})

app.get("/session/status",(req,res)=>{

  res.json({
    status:"SERVER_RUNNING"
  })

})

app.listen(process.env.PORT || 3000, ()=>{

  console.log("Server running")

})
