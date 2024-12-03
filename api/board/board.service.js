import { loggerService } from '../../services/logger.service.js'
import { dbService } from '../../services/db.service.js'
import { ObjectId } from 'mongodb'
import { utilService } from '../../services/util.service.js'

export const boardService = {
  createBoard,
  query,
  getById,
  remove,
  save,
  addTask,
  updateTask,
  removeTask,
  addGroup,
  updateGroup,
  removeGroup,
}


function createBoard(board) {
  return {
    title: board.title || '',
    isStarred: board.isStarred || false,
    archivedAt: board.archivedAt || null,
    createdBy: board.createdBy || null,
    style: {
      backgroundImage: board.style.backgroundImage || '',
    },
    // visibility: board.visibility || 'private',
    labels: board.labels || [
      {
        id: utilService.generateId('l'),
        title: "Done",
        color: "#61bd4f"
      },
      {
        id: utilService.generateId('l'),
        title: "in progress",
        color: "#f2d600"
      },
      {
        id: utilService.generateId('l'),
        title: "Waiting",
        color: "#ff9f1a"
      }
    ],
    members: board.members || [],
    groups: board.groups || [],
    activities: board.activities || [],
  }
}

async function query(filterBy = {}) {
  try {
    const collection = await dbService.getCollection('boards');

    const pipeline = [
      {
        $match: {
          ...(filterBy.userId && { 'members._id': filterBy.userId }),
          ...(filterBy.isStarred && { isStarred: true }),
          ...(filterBy.searchText && { title: { $regex: filterBy.searchText, $options: 'i' }}),
          archivedAt: null,
        }
      },
      {
        $lookup: {
          from: 'users',
          let: { memberIds: '$members._id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$_id', '$$memberIds']
                }
              }
            }
          ],
          as: 'members'
        }
      },
      {
        $project: {
          title: 1,
          isStarred: 1,
          style: 1,
          members: 1,
          groupCount: {
            $size: { $ifNull: ['$groups', []] }
          },
          taskCount: {
            $reduce: {
              input: { $ifNull: ['$groups', []] },
              initialValue: 0,
              in: {
                $add: [
                  '$$value',
                  {
                    $size: { 
                      $ifNull: ['$$this.tasks', []]
                   } }
                ]
              }
            }
          }
        }
      }
    ];

    const boards = await collection.aggregate(pipeline).toArray();

    return boards;
  } catch (err) {
    loggerService.error('Cannot get boards', err)
    throw new Error('Cannot get boards')
  }
}

async function getById(boardId) {
  try {
    const collection = await dbService.getCollection('boards')
    const objId = ObjectId.createFromHexString(boardId)
    const board = await collection.findOne({ _id: objId })
    return board
  } catch (err) {
    loggerService.error(`Cannot get board ${boardId}`, err)
    throw new Error('Cannot get board')
  }
}

async function remove(boardId) {
  try {
    const collection = await dbService.getCollection('boards')
    await collection.deleteOne({ _id: ObjectId.createFromHexString(boardId) })
  } catch (err) {
    loggerService.error(`Cannot remove board ${boardId}`, err)
    throw new Error('Cannot remove board')
  }
}

async function save(boardToSave) {
  try {
    const collection = await dbService.getCollection('boards')

    if (boardToSave._id) {
      const { _id, ...boardData } = boardToSave
      const objId = ObjectId.createFromHexString(boardToSave._id)

      await collection.updateOne(
        { _id: objId },
        { $set: boardData }
      )
      return boardToSave
    } else {
      boardToSave.createdAt = Date.now()
      const result = await collection.insertOne(boardToSave)
      return { ...boardToSave, _id: result.insertedId }
    }
  } catch (err) {
    loggerService.error('Cannot save board', err)
    throw new Error('Cannot save board')
  }
}

// TASKS

async function addTask(boardId, groupId, task) {
  try {
    const collection = await dbService.getCollection('boards')
    task.id = utilService.makeId()

    const activity = {
      id: utilService.makeId(),
      txt: `Added task "${task.title}"`,
      createdAt: Date.now(),
      byMember: task.byMember,
      task: { id: task.id, title: task.title }
    }

    await collection.updateOne(
      {
        _id: ObjectId.createFromHexString(boardId),
        'groups.id': groupId
      },
      {
        $push: {
          'groups.$.tasks': task,
          activities: { $each: [activity], $position: 0 }
        }
      }
    )

    return task
  } catch (err) {
    loggerService.error('Cannot add task', err)
    throw new Error('Cannot add task')
  }
}

async function updateTask(boardId, groupId, taskToUpdate) {
  try {
    const collection = await dbService.getCollection('boards')  
    await collection.updateOne(
      {
        _id: ObjectId.createFromHexString(boardId),
        'groups.id': groupId,
        'groups.tasks.id': taskToUpdate.id
      },
      {
        $set: { 'groups.$[group].tasks.$[task]' : taskToUpdate },
      },
      {
        arrayFilters: [
          { 'group.id': groupId },
          { 'task.id': taskToUpdate.id }
        ]
      }
    )
    return taskToUpdate
  } catch (err) {
    loggerService.error('Cannot update task', err)
    throw new Error('Cannot update task')
  }
}

async function removeTask(boardId, groupId, taskId) {
  try {
    const collection = await dbService.getCollection('boards')
    await collection.updateOne(
      { _id: ObjectId.createFromHexString(boardId), 'groups.id': groupId },
      {
        $pull: { 'groups.$.tasks': { id: taskId } }
      }
    )
  } catch (err) {
    loggerService.error('Cannot remove task', err)
    throw new Error('Cannot remove task')
  }
}

// GROUPS

async function addGroup(boardId, group) {
  try {
    const collection = await dbService.getCollection('boards')
    
    const newGroup = {
      id: utilService.makeId(),
      title: group.title,
      style: group.style || {},
      tasks: [],
      archivedAt: null,
    }

    await collection.updateOne(
      { _id: ObjectId.createFromHexString(boardId) },
      { $push: { groups: newGroup } }
    )
    return newGroup
  } catch (err) {
    loggerService.error('Cannot add group', err)
    throw new Error('Cannot add group')
  }
}

async function updateGroup(boardId, groupToUpdate) {
  try {
    const collection = await dbService.getCollection('boards')  
    
    const result = await collection.updateOne(
        {
          _id: ObjectId.createFromHexString(boardId),
          'groups.id': groupToUpdate.id
        },
        {
          $set: {
            'groups.$.title': groupToUpdate.title,
            'groups.$.style': groupToUpdate.style,
            'groups.$.archivedAt': groupToUpdate.archivedAt
          }
        }
    )

    if (result.matchedCount === 0) {
      throw new Error('Group not found')
    }
    if (result.modifiedCount === 0) {
      throw new Error('Group not updated')
    }

    return groupToUpdate
  } catch (err) {
    loggerService.error('Cannot update group', err)
    throw new Error('Cannot update group')
  }
}

async function removeGroup(boardId, groupId) {
  try {
    const collection = await dbService.getCollection('boards')
    await collection.updateOne(
      { _id: ObjectId.createFromHexString(boardId) },
      { $pull: { groups: { id: groupId } } }
    )
  } catch (err) { 
    loggerService.error('Cannot remove group', err)
    throw new Error('Cannot remove group')
  }
}