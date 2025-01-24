import { TelegramClient, Api } from 'telegram'
import { StringSession } from 'telegram/sessions/index.js'
import { saveSession, sessionFilePath } from '../../../utils/tele-session.js'

const apiId = Number(process.env.TELEGRAM_API_ID)
const apiHash = process.env.TELEGRAM_API_HASH
let stringSession = new StringSession('') // Fill this later with the value from session.save()
let phoneCodeHashStorage = ''
let client

async function initializeClient(sessionString = '') {
  client = new TelegramClient(
    new StringSession(sessionString),
    apiId,
    apiHash,
    {
      connectionRetries: 5,
    },
  )

  await client.connect()

  // Verify the session is valid
  if (await client.isUserAuthorized()) {
    const user = await client.getMe()
    console.log('Successfully reconnected as:', user.username)
    return user
  }

  return null
}

const handleSendCode = async (req, res) => {
  const { phoneNumber } = req.body

  try {
    await initializeClient()
    const result = await client.invoke(
      new Api.auth.SendCode({
        phoneNumber: phoneNumber,
        apiId: apiId,
        apiHash: apiHash,
        settings: new Api.CodeSettings({
          allowFlashcall: true,
          currentNumber: true,
          allowAppHash: true,
          allowMissedCall: true,
          logoutTokens: [Buffer.from('arbitrary data here')],
        }),
      }),
    )
    phoneCodeHashStorage = result.phoneCodeHash
    res.json({ success: true, phoneCodeHash: phoneCodeHashStorage })
  } catch (error) {
    console.error('Error sending code:', error)
    res.status(500).json({ success: false, message: 'Error sending code.' })
  }
}

const handleVerifyCode = async (req, res) => {
  const { phoneNumber, phoneCode } = req.body
  try {
    await client.invoke(
      new Api.auth.SignIn({
        phoneNumber: phoneNumber,
        phoneCodeHash: phoneCodeHashStorage,
        phoneCode: phoneCode,
      }),
    )

    const user = await client.getMe()
    stringSession = client.session.save()
    saveSession(stringSession)
    res.json({ success: true, user })
  } catch (error) {
    if (error.message.includes('PASSWORD_REQUIRED')) {
      res.json({ requiresPassword: true })
    } else {
      res.status(400).json({ error: error.message })
    }
  }
}

const handleSubmitPassword = async (req, res) => {
  const { password } = req.body
  try {
    await client.checkPassword(password)
    const user = await client.getMe()
    stringSession = client.session.save()
    saveSession(stringSession)
    res.json({ success: true, user })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export {
  handleSendCode,
  handleVerifyCode,
  handleSubmitPassword,
  initializeClient,
}
