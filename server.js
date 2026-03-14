import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { TelegramClient } from "telegram"
import { StringSession } from "telegram/sessions/index.js"

dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())

const apiId = Number(process.env.API_ID)
const apiHash = process.env.API_HASH
const port = process.env.PORT || 3000

let client = null
let stringSession = new StringSession("")

app.get("/", (req, res) => {
  res.json({
    status: "Telegram server running"
  })
})

app.post("/login/start", async (req, res) => {

  const { phone } = req.body

  try {

    client = new TelegramClient(stringSession, apiId, apiHash, {
      connectionRetries: 5
    })

    await client.connect()

    const result = await client.sendCode({
      apiId,
      apiHash
    }, phone)

    res.json({
      status: "CODE_SENT",
      phoneCodeHash: result.phoneCodeHash
    })

  } catch (error) {

    res.status(500).json({
      error: error.message
    })

  }

})

app.post("/login/verify", async (req, res) => {

  const { phone, code, phoneCodeHash } = req.body

  try {

    await client.signIn({
      phoneNumber: phone,
      phoneCodeHash,
      phoneCode: code
    })

    const session = client.session.save()

    res.json({
      status: "CONNECTED",
      session
    })

  } catch (error) {

    res.status(500).json({
      error: error.message
    })

  }

})

app.post("/message/send", async (req, res) => {

  const { username, message } = req.body

  try {

    await client.sendMessage(username, {
      message
    })

    res.json({
      status: "MESSAGE_SENT"
    })

  } catch (error) {

    res.status(500).json({
      error: error.message
    })

  }

})

app.get("/session/status", async (req, res) => {

  if (!client) {

    return res.json({
      status: "DISCONNECTED"
    })

  }

  const connected = await client.isConnected()

  res.json({
    status: connected ? "CONNECTED" : "DISCONNECTED"
  })

})

app.listen(port, () => {

  console.log("Server running on port " + port)

})
