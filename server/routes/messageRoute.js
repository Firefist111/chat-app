import express from 'express'
import { authRoute } from '../middleware/auth.js'
import { getMessages, getUsersForSidebar, sendMessage, updateToSeen } from '../controller/messageController.js'

const messageRouter = express.Router()

messageRouter.get('/users',authRoute,getUsersForSidebar)

messageRouter.get('/:id',authRoute,getMessages)
messageRouter.put('/mark/:id',authRoute,updateToSeen)
messageRouter.post('/send/:id',authRoute,sendMessage)

export default messageRouter