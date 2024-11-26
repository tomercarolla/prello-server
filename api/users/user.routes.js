import express from 'express'
import { requireAuth, requireAdmin } from '../middlewares/requireAuth.middleware.js'
import { requirePermission } from './../middlewares/requirePermission.js';
import { getUsers, getUser, deleteUser, updateUser, getCurrentUser } from './user.controller.js'

const router = express.Router()

router.get('/current', requireAuth, getCurrentUser)


router.get('/:userId', requireAuth, requirePermission, getUser)
router.put('/:userId', requireAuth, requirePermission, updateUser)

// Admin routes
router.get('/', requireAuth, requireAdmin, getUsers)
router.delete('/:userId', requireAuth, requireAdmin, deleteUser)


export const userRoutes = router