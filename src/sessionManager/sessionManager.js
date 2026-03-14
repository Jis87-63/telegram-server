import fs from "fs"

const SESSION_FILE = "./sessions/sessions.json"

if (!fs.existsSync("./sessions")) {
  fs.mkdirSync("./sessions")
}

if (!fs.existsSync(SESSION_FILE)) {
  fs.writeFileSync(SESSION_FILE, JSON.stringify({}))
}

export function saveSession(phone, session) {

  const data = JSON.parse(fs.readFileSync(SESSION_FILE))

  data[phone] = session

  fs.writeFileSync(
    SESSION_FILE,
    JSON.stringify(data, null, 2)
  )

}

export function getSession(phone) {

  const data = JSON.parse(
    fs.readFileSync(SESSION_FILE)
  )

  return data[phone]

}
