import express from 'express'
import 'chromedriver'
import { getForexFactoryData } from './handler/get-forex-data.js'
import { handleTelegramLogin, handleSendCode } from './handler/send-tele-msg.js'
import path from 'path'
import { fileURLToPath } from 'url'
import { loadSession } from '../../utils/tele-session.js'
import { console } from 'inspector'

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
    this.router.post('/sendCode', this.sendCode)
    this.router.post('/authTelegram', this.authTelegram)
    this.router.get('/updateForexNews', this.updateForexNews)
  }

  async serveAuthPage(req, res) {
    try {
      const session = loadSession()
      if (session !== '') {
        res.send({
          message: session,
        })
      } else {
        res.sendFile(path.join(__dirname, './UI/auth.html'))
      }
    } catch (error) {
      console.log(error)
      res.status(500).send(error)
    }
  }

  async sendCode(req, res) {
    await handleSendCode(req, res)
  }

  async authTelegram(req, res) {
    await handleTelegramLogin(req, res)
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
