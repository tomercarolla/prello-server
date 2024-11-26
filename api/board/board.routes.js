import express from 'express'
import { getBoards, getBoard, addBoard, updateBoard, removeBoard, addTask, updateTask, removeTask, addGroup, updateGroup, removeGroup } from './board.controller.js'
import { requirePermission } from '../middlewares/requirePermission.js' 
import { requireAuth } from './../middlewares/requireAuth.middleware.js'

const router = express.Router()

// BOARD ROUTES
router.get('/', requireAuth, getBoards)
router.get('/:boardId', requireAuth, requirePermission, getBoard)
router.post('/', requireAuth, addBoard)
router.put('/:boardId', requireAuth, requirePermission, updateBoard)
router.delete('/:boardId', requireAuth, requirePermission, removeBoard)

// TASK ROUTES
router.post('/:boardId/group/:groupId/task', requireAuth, requirePermission, addTask)
router.put('/:boardId/group/:groupId/task/:taskId', requireAuth, requirePermission, updateTask)
router.delete('/:boardId/group/:groupId/task/:taskId', requireAuth, requirePermission, removeTask)

// GROUP ROUTES
router.post('/:boardId/group', requireAuth, requirePermission, addGroup)
router.put('/:boardId/group/:groupId', requireAuth, requirePermission, updateGroup)
router.delete('/:boardId/group/:groupId', requireAuth, requirePermission, removeGroup)

export const boardRouter = router
