import User from "../models/user.model.js"
import Message from "../models/message.model.js"
import cloudinary from "../lib/cloudinary.js"
import { getReceiverSocketId,io } from "../lib/socket.js";
export default {
    getUsersForSidebar_get: async(req, res) => {
      try {
        const user = await User.findById(req.user._id).populate("friends", "_id fullName profilePic");
        console.log(user.friends);
        res.status(200).json(user.friends);
      } catch (error) {
        console.error("Error in getUsersForSidebar: ", error.message);
        res.status(500).json({ message: "Internal server error" });
      }
    },
    getMessages_get: async(req, res) => {
        try {
            const { id: userToChatId } = req.params;
            const myId = req.user._id;
        
            const messages = await Message.find({
              $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId },
              ],
            });
            
            res.status(200).json(messages);
          } catch (error) {
            console.log("Error in getMessages controller: ", error.message);
            res.status(500).json({ message: "Internal server error" });
          }
    },
    sendMessage_post: async (req, res) => {
      try {
          const { text, image } = req.body;
          const { id: receiverId } = req.params;
          const senderId = req.user._id;
          const sender = await User.findById(senderId);
          const receiver = await User.findById(receiverId);
          if (!sender || !receiver) {
              return res.status(404).json({ message: "User not found." });
          }
          const areFriends = sender.friends.includes(receiverId) && receiver.friends.includes(senderId);
          if (!areFriends) {
              return res.status(403).json({ message: "You can only message friends." });
          }
          let imageUrl;
          if (image) {
              const uploadResponse = await cloudinary.uploader.upload(image);
              imageUrl = uploadResponse.secure_url;
          }
          const newMessage = new Message({
              senderId,
              receiverId,
              text,
              image: imageUrl,
          });
          await newMessage.save();
          const receiverSocketId = getReceiverSocketId(receiverId);
          if (receiverSocketId) {
              io.to(receiverSocketId).emit("newChatMessage", newMessage);
              io.to(receiverSocketId).emit("newGlobalMessage", newMessage);
          }
          res.status(201).json(newMessage);
      } catch (error) {
          console.log("Error in sendMessage controller: ", error.message);
          res.status(500).json({ message: "Internal server error" });
      }
  }
  
};