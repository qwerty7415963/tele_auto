import { TelegramClient, Api } from 'telegram'
import { StringSession } from 'telegram/sessions/index.js'
import { sessionFilePath } from '../../../utils/tele-session.js'

let phoneCodeHashStorage = ''

const handleSendCode = async (req, res) => {
  const apiId = Number(process.env.TELEGRAM_API_ID)
  const apiHash = process.env.TELEGRAM_API_HASH
  const stringSession = new StringSession('') // Fill this later with the value from session.save()
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 1,
  })

  try {
    const { phoneNumber } = req.body
    console.log('Received phoneNumber:', phoneNumber, typeof phoneNumber)
    if (!phoneNumber) {
      return res
        .status(400)
        .json({ success: false, message: 'Phone number is required' })
    }

    await client.connect()
    const { phoneCodeHash } = await client.invoke(
      new Api.auth.SendCode({
        phoneNumber: '+84342943153',
        apiId,
        apiHash,
        settings: new Api.CodeSettings({
          allowFlashcall: true,
          currentNumber: true,
          allowAppHash: true,
          allowMissedCall: true,
          logoutTokens: [Buffer.from('arbitrary data here')],
        }),
      }),
    )
    phoneCodeHashStorage = phoneCodeHash
    console.log('phoneCodeHash:', phoneCodeHash)
    res.json({ success: true, message: 'Code sent to phone number.' })
  } catch (error) {
    console.error('Error sending code:', error)
    res.status(500).json({ success: false, message: 'Error sending code.' })
  } finally {
    await client.disconnect()
  }
}

const handleTelegramLogin = async (req, res) => {
  const { phoneNumber, password, phoneCode } = req.body
  console.log('Received phoneNumber:', phoneNumber) // Log the phoneNumber to debug
  console.log('Received phoneCodeHash:', phoneCodeHashStorage) // Log the phoneCode to debug
  console.log('Received phoneCode:', phoneCode) // Log the phoneCode to debug
  if (!phoneNumber || !phoneCode) {
    return res.status(400).json({
      success: false,
      message: 'Phone number and phone code is required',
    })
  }
  const apiId = Number(process.env.TELEGRAM_API_ID)
  const apiHash = process.env.TELEGRAM_API_HASH
  const stringSession = new StringSession('') // Fill this later with the value from session.save()

  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 1,
  })

  try {
    await client.connect()
    const result = await client.invoke(
      new Api.auth.SignIn({
        phoneNumber,
        phoneCodeHash: phoneCodeHashStorage,
        phoneCode,
      }),
    )

    console.log(result) // prints the result

    const sessionString = client.session.save()
    console.log(sessionString) // Save this string to avoid logging in again

    // Save session to file
    fs.writeFileSync(sessionFilePath, sessionString)

    res.json({ message: 'Login successful' })
  } catch (error) {
    res.status(500).json({ message: 'Login failed' })
  } finally {
    await client.disconnect()
  }
}

const sendToTelegram = async events => {
  const message = events
    .map(
      event =>
        `Event: ${event.event}\nActual: ${event.actual}\nForecast: ${event.forecast}`,
    )
    .join('\n\n')

  await client.sendMessage('me', { message })

  await client.disconnect()
}

export { handleSendCode, handleTelegramLogin, sendToTelegram }
