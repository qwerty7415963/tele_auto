import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { loadRoutes } from './utils/load-routes.js'
import bodyParser from 'body-parser'

class App {
  constructor() {
    dotenv.config()
    this.app = express()
    this.setupMiddleware()
    this.initializeRoutes()
    this.setupErrorHandling()
    this.initializeRoutes()
    this.app.use(bodyParser.json())
  }

  setupMiddleware() {
    this.app.use(express.static('public'))
    this.app.use(cors())
    this.app.use(morgan('dev'))
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))
  }

  async initializeRoutes() {
    const routes = await loadRoutes()

    routes.forEach(({ path, router }) => {
      this.app.use(path, router.router)
    })
  }

  setupErrorHandling() {
    this.app.use((err, req, res, next) => {
      console.error(err.stack)
      res.status(500).json({ message: 'Something went wrong!' })
    })
  }

  listen() {
    const PORT = process.env.PORT || 3000
    this.app.listen(PORT, () => {
      console.log(`Server is running on ${PORT}`)
    })
  }
}

export default App
