import express from 'express'
import 'chromedriver'
import { getForexFactoryData } from './handler/get-forex-data.js'
import {
  handleGenerateQRCode,
  handleQRCodeLogin,
} from './handler/send-tele-msg.js'
import path from 'path'
import { fileURLToPath } from 'url'
import { loadSession, sessionFilePath } from '../../utils/tele-session.js'
import { console } from 'inspector'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class NewRoutes {
  constructor() {
    this.router = express.Router()
    this.initializeRoutes()
    // this.scheduleCronJob()
  }

  initializeRoutes() {
    this.router.get('/', this.serveAuthPage)
    this.router.get('/generateQRCode', this.generateQRCode)
    this.router.post('/qrCodeLogin', this.qrCodeLogin)
    this.router.get('/updateForexNews', this.updateForexNews)
  }

  async serveAuthPage(req, res) {
    // Check if session file exists
    if (fs.existsSync(sessionFilePath)) {
      const savedSession = fs.readFileSync(sessionFilePath, 'utf8')
      const stringSession = new StringSession(savedSession)
      const apiId = Number(process.env.TELEGRAM_API_ID) // Ensure apiId is a number
      const apiHash = process.env.TELEGRAM_API_HASH

      const client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
      })

      try {
        await client.connect()
        if (client.isUserAuthorized()) {
          res.send('<h1>You are already logged in</h1>')
          return
        }
      } catch (error) {
        console.error('Error checking Telegram session:', error)
      } finally {
        await client.disconnect()
      }
    }

    // If not logged in, serve the login form
    res.sendFile(path.join(__dirname, 'UI/auth.html'))
  }
  async generateQRCode(req, res) {
    try {
      const qrCodeUrl = await handleGenerateQRCode()

      if (res) {
        res.json({
          success: true,
          QRCodeString: qrCodeUrl,
        })
      }
    } catch (error) {
      res.status(500).send(error)
    }
  }

  async qrCodeLogin(req, res) {
    await handleQRCodeLogin(req, res)
  }

  async updateForexNews(req, res) {
    try {
      const events = await getForexFactoryData()

      if (res) {
        res.send({
          events: events,
        })
      }
    } catch (error) {
      res.status(500).send(error)
    }
  }
}

export default NewRoutes
