import cloudinary from "../lib/cloudinary.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { io, userSocketMap } from "../server.js";

// ✅ Get all users except logged-in user
export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;

    const allUsers = await User.find({ _id: { $ne: userId } }).select("-password");

    // Count unseen messages for each user
    const unseenMessages = {};

    const promises = allUsers.map(async (user) => {
      const unseen = await Message.find({
        senderId: user._id,
        receiverId: userId,
        seen: false,
      });

      if (unseen.length > 0) {
        unseenMessages[user._id] = unseen.length; // ✅ Corrected key name
      }
    });

    await Promise.all(promises);

    res.status(200).json({
      success: true,
      users: allUsers,
      unseenMessages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Get all messages for selected user
export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: selectedUserId, receiverId: myId },
        { senderId: myId, receiverId: selectedUserId },
      ],
    }).sort({ createdAt: 1 }); // ✅ Keep order chronological

    // Mark unseen messages as seen
    await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId, seen: false },
      { $set: { seen: true } }
    );

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Mark message as seen by ID
export const updateToSeen = async (req, res) => {
  try {
    const { id } = req.params;

    await Message.findByIdAndUpdate(id, { seen: true });

    res.status(200).json({
      success: true,
      message: "Message marked as seen",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Send message to selected user
export const sendMessage = async (req, res) => {
  try {
    let { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    if (image) {
      const uploadRes = await cloudinary.uploader.upload(image);
      image = uploadRes.secure_url;
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image,
    });

    // Emit message to receiver in real time
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
      newMessage, // ✅ return the message to frontend
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
