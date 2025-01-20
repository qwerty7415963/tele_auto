import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const sessionFilePath = path.join(__dirname, '../config/session.txt')

// Save session
function saveSession(session) {
  fs.writeFileSync(sessionFilePath, session.save())
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
