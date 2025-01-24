import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const sessionFilePath = path.join(__dirname, '../config/session.txt')

// Save session
function saveSession(sessionString) {
  fs.writeFileSync(sessionFilePath, sessionString)
}

// Load session
function loadSession() {
  try {
    return fs.readFileSync(sessionFilePath, 'utf8')
  } catch {
    return ''
  }
}

export { saveSession, loadSession, sessionFilePath }
