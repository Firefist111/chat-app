
import cloudinary from "../lib/cloudinary.js"
import Message from "../models/Message.js"
import User from "../models/User.js"
import { io, userSocketMap } from "../server.js"

//Get all users except loggedin user

export const getUsersForSidebar = async(req,res)=>{
  try {
    const userId = req.user._id

    const allUsers = await User.find({_id : {$ne: userId}}).select("-password")

    //count no of message unseen 

    const unseenMessages = {}
     //async func returns a array of promises
    const promises = allUsers.map(async(user)=>{
      const message = await Message.find({senderId:user._id,receiverId : userId,seen:false})

      if(message.length >0){
        unseenMessages.user_id = message.length
      }
    })

    await Promise.all(promises)
   
    res.status(200).json({
      success : true,
      users : allUsers,
      unseenMessages
    })

  } catch (error) {
    res.status(500).json({
      success : false,
      message : error.message
    })
  }             
}


//get all messages for selected user

export const getMessages = async(req,res)=>{
try {

  const { id : selectedUserId} = req.params;

  const myId = req.user._id

  const messages = await Message.find({
    $or :[
     { senderId : selectedUserId,receiverId:myId},
     { senderId :myId ,receiverId:selectedUserId},
    ]
  })

  //update the unseen message to seen

  await Message.updateMany(
    { senderId : selectedUserId,receiverId:myId ,seen:false},
    {$set:{seen:true}}
)

 res.status(200).json({
      success : true,
      messages
    })




} catch (error) {
   res.status(500).json({
      success : false,
      message : error.message
    })
}
}

//api to mark unseen messages as seen using message id

export const updateToSeen=async()=>{
  try {
    const {id} = req.params

    await Message.findByIdAndUpdate(id,{
      seen : true
    })
    res.status(200).json({
      success :true
    })
  } catch (error) {
     res.status(500).json({
      success : false,
      message : error.message
    })
  }
}


//send message to selected user

export const sendMessage =async(req,res)=>{
  try {
    const {text,image} = req.body

    const receiverId = req.params.id
    const senderId = req.user._id
    
    if(image){
      const uploadRes = await cloudinary.uploader.upload(image);
      image = uploadRes.secure_url
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image
    })
    
    //sendind message to a receiver Socket
    const receiverSocketId = userSocketMap[receiverId]
    if(receiverSocketId){
      io.to(receiverSocketId).emit('newMessage',newMessage)
    }

   res.status(200).json({
    success:true,
    message : "message sent",
   })
    
  } catch (error) {
     res.status(500).json({
      success : false,
      message : error.message
    })
  }
}