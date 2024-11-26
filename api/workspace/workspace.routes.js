import express from 'express'
import { getWorkspaces, getWorkspace, addWorkspace, updateWorkspace, removeWorkspace } from './workspace.controller.js'

const router = express.Router()

router.get('/', getWorkspaces)
router.get('/:wsid', getWorkspace)
router.post('/', addWorkspace)
router.put('/:wsId', updateWorkspace)
router.delete('/:wsId', removeWorkspace)

export const workspaceRoute = router
