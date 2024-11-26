import { loggerService } from '../../services/logger.service.js'
import { boardService } from './board.service.js'


export async function getBoards(req, res) {
  try {
    const filterBy = {
      userId: req.query.userId,
      isStarred: req.query.isStarred === 'true',
      searchText: req.query.txt
    }

    const boards = await boardService.query(filterBy)
    res.json(boards)
  } catch (err) {
    loggerService.error(`Cannot get boards`, err)
    res.status(404).send(`Cannot get boards`)
  }
} 

export async function getBoard(req, res) {
  const { boardId } = req.params

  try {
    const board = await boardService.getById(boardId)
    if (!board) {
      loggerService.warn(`Cannot get board ${boardId}`)
      res.status(404).send(`Cannot get board ${boardId}`)
    }
    res.json(board)
  } catch (err) {
    loggerService.error(`Cannot get board ${boardId}`, err)  
    res.status(404).send(`Cannot get board`)
  }
}

export async function addBoard(req, res) {
  try {
    if (!req.user) {
      return res.status(401).send('User is not logged in')
    }
    const { style, title, visibility } = req.body

    const boardToSave = {
      title,
      style: {
        backgroundImg: style?.backgroundImg || ''
      },
      visibility,
      createdBy: {
        _id: req.user._id,
        fullname: req.user.fullname,
        imgUrl: req.user.imgUrl
      },
      members: [req.user]
    }

    const saveboard = await boardService.save(boardToSave)
    res.json(saveboard)
  } catch (err) {
    loggerService.error(`Cannot add board`, err)
    res.status(400).send(`Cannot add board`)
  }
}

export async function updateBoard(req, res) {
  try {
    const { boardId } = req.params
    const boardToInsert = req.body

    if (!boardId) {
      return res.status(400).send('Bad request')
    }

    const boardToUpdate = {
      ...req.board,
      ...boardToInsert,
      _id: boardId
    }

    const updatedBoard = await boardService.save(boardToUpdate)
    res.json(updatedBoard)
  } catch (err) {
    loggerService.error(`Cannot update board`, err)
    res.status(400).send(`Cannot update board`)
  }
}

export async function removeBoard(req, res) {
  try {
    const { boardId } = req.params
    await boardService.remove(boardId)
    res.send('Board has been removed successfully')
  } catch (err) {
    loggerService.error(`Cannot remove board ${boardId}`, err)
    res.status(400).send(`Cannot remove board`)
  }
}

// TASKS

export async function addTask(req, res) {
  try {
    const { boardId, groupId } = req.params
    const task = req.body

    task.byMember = req.user

    const savedTask = await boardService.addTask(boardId, groupId, task)
    res.json(savedTask)
  } catch (err) {
    loggerService.error(`Cannot add task`, err)
    res.status(400).send(`Cannot add task`)
  }
}

export async function updateTask(req, res) {
  try {
    const { boardId, groupId } = req.params
    const savedTask = await boardService.updateTask(boardId, groupId, req.body)
    res.json(savedTask)
  } catch (err) {
    loggerService.error(`Cannot update task`, err)
    res.status(400).send(`Cannot update task`)
  }
}

export async function removeTask(req, res) {
  try {
    const { boardId, groupId, taskId } = req.params
    await boardService.removeTask(boardId, groupId, taskId)
    res.send('Task has been removed successfully')
  } catch (err) {
    loggerService.error(`Cannot remove task`, err)
    res.status(400).send(`Cannot remove task`)
  }
}

// GROUPS

export async function addGroup(req, res) {
  try {
    const { boardId } = req.params
    const group = req.body
    const savedGroup = await boardService.addGroup(boardId, group)
    res.json(savedGroup)
  } catch (err) {
    loggerService.error(`Cannot add group`, err)
    res.status(400).send(`Cannot add group`)
  }
}

export async function updateGroup(req, res) {
  try {
    const { boardId, groupId } = req.params
    const groupToUpdate = req.body

    if (groupId !== groupToUpdate.id) {
       console.log('ID mismatch:', { urlId: groupId, bodyId: groupToUpdate.id });
      return res.status(400).send('Group ID mismatch')
    }

    const updatedGroup = await boardService.updateGroup(boardId, groupToUpdate)
    res.json(updatedGroup)  
  } catch (err) {
    console.error('Error details:', err);
    loggerService.error(`Cannot update group`, err)
    res.status(400).send(`Cannot update group`)
  }
}

export async function removeGroup(req, res) {
  try {
    const { boardId, groupId } = req.params
    await boardService.removeGroup(boardId, groupId)
    res.send('Group has been removed successfully')
  } catch (err) {
    loggerService.error(`Cannot remove group`, err)
    res.status(400).send(`Cannot remove group`)
  }
}