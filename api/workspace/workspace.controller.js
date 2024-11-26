import { loggerService } from '../../services/logger.service.js'
import { workspaceService } from './workspace.service.js';

export async function getWorkspaces(req, res) {
  try {

  } catch (err) {
    
  }
} 

export async function getWorkspace(req, res) {
  const { workspaceId } = req.params

  try {
    const workspace = await workspaceService.getById(workspaceId)
    if (!workspace) {
      loggerService.warn(`Cannot get workspace ${workspaceId}`)
      res.status(404).send(`Cannot get workspace ${workspaceId}`)
    }
    res.json(workspace)
  } catch (err) {
    loggerService.error(`Cannot get workspace ${workspaceId}`, err)
    res.status(404).send('Cannot get workspace')
  }
}

export async function addWorkspace(req, res) {
  try {
    // need to pull from req.body the properties of the workspace
    // const workspaceToSave = req.body

    const saveWorkspace = await workspaceService.save(workspaceToSave)
    res.json(saveWorkspace)
  } catch (err) {
    loggerService.error('Failed to add workspace', err)
    res.status(400).send('Failed to add workspace')
  }
}

export async function updateWorkspace(req, res) {
  try {
    const saveWorkspace = await workspaceService.save(req.body)
    res.json(saveWorkspace)
  } catch (err) {
    loggerService.error('Failed to update workspace', err)
    res.status(400).send('Failed to update workspace')
  }
}

export async function removeWorkspace(req, res) {
  try {
    const { workspaceId } = req.params
    await workspaceService.remove(workspaceId)
    res.send('Workspace has been removed successfully')
  } catch (err) {
    loggerService.error(`Failed to remove workspace: ${workspaceId}`, err)
    res.status(400).send('Failed to remove workspace')
  }
}