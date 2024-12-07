import {loggerService} from '../../services/logger.service.js'
import {boardService} from '../board/board.service.js'

export async function requirePermission(req, res, next) {
    try {
        if (!req.user) {
            loggerService.warn('requirePermission: Unauthorized')
            return res.status(401).send({error: 'Unauthorized'})
        }

        const {boardId} = req.params
        if (!boardId) {
            loggerService.warn('requirePermission: boardId parameter is missing')
            return res.status(400).send('Bad request - missing boardId')
        }

        const board = await boardService.getById(boardId);

        if (!board) {
            return res.status(404).send('Board not found')
        }

        if (req.user.isAdmin === true) {
            loggerService.info('Admin has full permissions')
            req.board = board
            return next()
        }

        const isCreator = board.createdBy?._id?.toString() === req.user._id?.toString();

        if (isCreator) {
            loggerService.info('User is the creator of the board')
            req.board = board
            return next()
        }

        // if (board.visibility === 'public') {
        //   loggerService.info('Board is public')
        //   req.board = board
        //   return next()
        // }

        // const isMember = board.members.some(member => {
        //     console.log('member._id ', member._id)
        //     console.log('req.user._id ', req.user._id.toString())
        //
        //     return member._id.toString() === req.user._id.toString()
        // });
        //
        // if (!isMember) {
        //     loggerService.warn(`User ${req.user._id} is not a member of board ${boardId}`);
        //
        //     return res.status(403).send('Not Authorized')
        // }

        req.board = board;

        next();
    } catch (err) {
        loggerService.error('requirePermission failed', err)
        res.status(500).send({error: 'Failed to check permissions'})
    }
}