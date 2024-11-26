import { authService } from "../auth/auth.service.js"
import { loggerService } from "../../services/logger.service.js"

export function requireAuth(req, res, next) {
  const loginToken = req.cookies.loginToken
  
  if (!loginToken) {
    return res.status(401).send('Unauthorized')
  }

  try {
    const loggedinUser = authService.validateToken(loginToken)
    req.user = loggedinUser
    next()
  } catch (err) {
    loggerService.error('Failed to authenticate', err)
    res.status(401).send('Unauthorized')
  }
}

export function requireAdmin(req, res, next) { 
  const user = req.user

  try {
    if (!user.isAdmin) {
      loggerService.warn(`${user.fullname} tried to access admin route`)
      return res.status(403).send('Not Authorized')
    }
  } catch (err) {
    loggerService.error('Failed to authenticate', err)
    res.status(401).send('Unauthorized')
  }

  next()
}