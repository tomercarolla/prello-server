import { authService } from '../auth/auth.service.js'
import { loggerService } from "../../services/logger.service.js"

export async function signup(req, res) {
  try {
    const credentials = req.body

    if (!credentials.username || !credentials.password || !credentials.fullname) {
      return res.status(400).send('All fields are required')
    }

    const account = await authService.signup(credentials)
    loggerService.info('User logged in', account)

    const loginToken = authService.getLoginToken(account)

    res.cookie('loginToken', loginToken, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 1000 * 60 * 60 * 24 * 7 })
    res.json(account)
  } catch (err) {
    loggerService.error('Failed to signup', err)
    res.status(400).send('Failed to signup')
  }
}

export async function login(req, res) {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).send('All fields are required')
    }

    const user = await authService.login(username, password)

    const loginToken = authService.getLoginToken(user)
    res.cookie('loginToken', loginToken, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 1000 * 60 * 60 * 24 * 7 })
    res.json(user)
  } catch (err) {
    loggerService.error('Failed to login', err)
    res.status(400).send('Failed to login')
  }
}

export async function logout(req, res) {
  try {
    res.clearCookie('loginToken')
    res.send('Logged out')
  } catch (err) {
    loggerService.error('Failed to logout', err)
    res.status(400).send('Failed to logout')
  }
}