import express from 'express'
import 'chromedriver'
import { getForexFactoryData } from './handler/get-forex-data.js'
import {
  handleVerifyCode,
  handleSendCode,
  initializeClient,
} from './handler/auth-tele.js'
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
    this.router.post('/send-code', this.sendCode)
    this.router.post('/verify-code', this.verifyCode)
    this.router.post('/submit-password', this.submitPassword)
    this.router.get('/updateForexNews', this.updateForexNews)
  }

  async serveAuthPage(req, res) {
    try {
      const session = loadSession()
      if (session !== '') {
        const user = await initializeClient(session)
        res.send({
          user: user.username,
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

  async verifyCode(req, res) {
    console.log('verifyCode')
    await handleVerifyCode(req, res)
  }

  async submitPassword(req, res) {
    console.log('verifyCode')
    await handleSubmitPassword(req, res)
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
