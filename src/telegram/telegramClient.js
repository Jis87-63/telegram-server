import { TelegramClient } from "telegram"
import { StringSession } from "telegram/sessions/index.js"

export async function createClient(session, apiId, apiHash) {

  const stringSession = new StringSession(session || "")

  const client = new TelegramClient(
    stringSession,
    Number(apiId),
    apiHash,
    {
      connectionRetries: 5
    }
  )

  await client.connect()

  return client

}
