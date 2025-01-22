import { TelegramClient, Api } from 'telegram'
import { StringSession } from 'telegram/sessions/index.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  saveSession,
  loadSession,
  sessionFilePath,
} from '../../../utils/tele-session.js'
import QRCode from 'qrcode'

// Get the directory name
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const apiId = Number(process.env.TELEGRAM_API_ID) // Ensure apiId is a number
const apiHash = process.env.TELEGRAM_API_HASH
const stringSession = new StringSession('') // Fill this later with the value from session.save()

let currentQRToken = null

const client = new TelegramClient(new StringSession(''), apiId, apiHash, {
  connectionRetries: 5,
})
await client.connect()

const handleGenerateQRCode = async (req, res) => {
  const result = await client.invoke(
    new Api.auth.ExportLoginToken({
      apiId: apiId,
      apiHash: apiHash,
      exceptIds: [],
    }),
  )
  const url = `tg://login?token=${result.token.toString('base64')}`
  const qrCodeUrl = await QRCode.toDataURL(url)

  return qrCodeUrl
}

const handleQRCodeLogin = async (req, res) => {
  const { token } = req.body
  const apiId = Number(process.env.TELEGRAM_API_ID) // Ensure apiId is a number
  const apiHash = process.env.TELEGRAM_API_HASH
  let stringSession = new StringSession('') // Fill this later with the value from session.save()

  // Load session from file if it exists
  if (fs.existsSync(sessionFilePath)) {
    const savedSession = fs.readFileSync(sessionFilePath, 'utf8')
    stringSession = new StringSession(savedSession)
  }

  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  })

  try {
    await client.connect()
    const result = await client.invoke(
      new Api.auth.ImportLoginToken({
        token: Buffer.from(token, 'base64'),
      }),
    )

    console.log('Login result:', result)
    const sessionString = client.session.save()
    console.log(sessionString) // Save this string to avoid logging in again

    // Save session to file
    saveSession(client.session)

    res.json({ message: 'Login successful' })
  } catch (error) {
    console.error('Error during QR code login:', error)
    res.status(500).json({ message: 'Login failed' })
  } finally {
    await client.disconnect()
  }
}

// Handle login token updates
client.addEventHandler(async update => {
  console.log(update)
  if (update?.className === 'UpdateLoginToken') {
    try {
      const result = await client.invoke(
        new Api.auth.ExportLoginToken({
          apiId: apiId,
          apiHash: apiHash,
          exceptIds: [],
        }),
      )

      if (result.className === 'auth.LoginTokenSuccess') {
        const user = await client.getMe()
        console.log('Login successful:', user)
      } else if (result.className === 'auth.LoginTokenMigrateTo') {
        const importResult = await client.invoke({
          _: 'auth.importLoginToken',
          token: result.token,
        })

        if (importResult.className === 'auth.LoginTokenSuccess') {
          const user = await client.getMe()
          console.log('Login successful after migration:', user)
        }
      }
    } catch (error) {
      console.error('Login token update error:', error)
    }
  }
})

export { handleGenerateQRCode, handleQRCodeLogin }
