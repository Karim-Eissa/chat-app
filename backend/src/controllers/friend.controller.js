import User from "../models/user.model.js";
import { getReceiverSocketId,io } from "../lib/socket.js";

export default {
    searchUsers: async (req, res) => {
        try {
            const { query } = req.query;
            if (!query) return res.status(400).json({ message: "Search query is required" });
            const userId = req.user._id;
            const users = await User.find({
                fullName: { $regex: new RegExp(`^${query}`, "i") },
                _id: { $ne: userId },
            })
            .select("fullName profilePic")
            .limit(10); 
            res.status(200).json(users);
        } catch (error) {
            console.error("Error searching users:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    getFriends: async (req, res) => {
        try {
            const user = await User.findById(req.user._id).populate("friends", "_id fullName profilePic");
            res.status(200).json(user.friends);
        } catch (error) {
            console.error("Error fetching friends:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    getSentRequests: async (req, res) => {
        try {
            const user = await User.findById(req.user._id).populate("sentRequests", "fullName profilePic");
            res.status(200).json(user.sentRequests);
        } catch (error) {
            console.error("Error fetching sent requests:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    getReceivedRequests: async (req, res) => {
        try {
            const user = await User.findById(req.user._id).populate("friendRequests", "fullName profilePic");
            res.status(200).json(user.friendRequests);
        } catch (error) {
            console.error("Error fetching sent requests:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    sendRequest: async (req, res) => {
        try {
            const { id } = req.params; 
            const senderId = req.user._id;

            if (id.toString() === senderId.toString()) {
                return res.status(400).json({ message: "You can't send a request to yourself." });
            }

            const recipient = await User.findById(id);
            const sender = await User.findById(senderId);

            if (!recipient || !sender) return res.status(404).json({ message: "User not found" });

            if (recipient.friends.includes(senderId)) {
                return res.status(400).json({ message: "Already friends" });
            }

            if (recipient.friendRequests.includes(senderId) || sender.sentRequests.includes(id)) {
                return res.status(400).json({ message: "Request already sent" });
            }

            recipient.friendRequests.push(senderId);
            sender.sentRequests.push(id); 
            await recipient.save();
            await sender.save();

            // ✅ Emit real-time event to recipient
            const receiverSocketId = getReceiverSocketId(id);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("friend-request-received", { 
                    from: senderId,
                    fullName: sender.fullName,
                    profilePic: sender.profilePic });
            }

            res.status(200).json({ message: "Friend request sent" });
        } catch (error) {
            console.error("Error sending request:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    cancelRequest: async (req, res) => {
        try {
            const { id: userId } = req.params;
            const senderId = req.user._id;
    
            const sender = await User.findById(senderId);
            const recipient = await User.findById(userId);
    
            if (!sender || !recipient) {
                return res.status(404).json({ message: "User not found" });
            }
    
            if (!sender.sentRequests.includes(userId) || !recipient.friendRequests.includes(senderId)) {
                return res.status(400).json({ message: "No pending friend request to cancel" });
            }
    
            sender.sentRequests = sender.sentRequests.filter(reqId => reqId.toString() !== userId.toString());
            recipient.friendRequests = recipient.friendRequests.filter(reqId => reqId.toString() !== senderId.toString());
    
            await sender.save();
            await recipient.save();
    
            // Emit socket event to notify recipient
            const recipientSocketId = getReceiverSocketId(userId);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit("friend-request-canceled", { from: senderId });
            }
    
            return res.status(200).json({ message: "Friend request canceled" });
        } catch (error) {
            return res.status(500).json({ message: "Server error" });
        }
    },
    
    
    
    acceptRequest: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user._id;

            const user = await User.findById(userId);
            const sender = await User.findById(id);

            if (!user || !sender) return res.status(404).json({ message: "User not found" });

            if (!user.friendRequests.includes(id)) {
                return res.status(400).json({ message: "No friend request from this user" });
            }

            user.friendRequests = user.friendRequests.filter(reqId => reqId.toString() !== id);
            sender.sentRequests = sender.sentRequests.filter(reqId => reqId.toString() !== userId.toString());
            user.friends.push(id);
            sender.friends.push(userId);

            await user.save();
            await sender.save();

            // ✅ Emit real-time event
            const senderSocketId = getReceiverSocketId(id);
            if (senderSocketId) {
                io.to(senderSocketId).emit("friend-request-accepted", { 
                    from: userId,
                    fullName: user.fullName,
                    profilePic: user.profilePic  });
            }

            res.status(200).json({ message: "Friend request accepted" });
        } catch (error) {
            console.error("Error accepting request:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    rejectRequest: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user._id;

            const user = await User.findById(userId);
            const sender = await User.findById(id);

            if (!user || !sender) return res.status(404).json({ message: "User not found" });

            user.friendRequests = user.friendRequests.filter(reqId => reqId.toString() !== id);
            sender.sentRequests = sender.sentRequests.filter(reqId => reqId.toString() !== userId.toString());

            await user.save();
            await sender.save();

            // ✅ Notify sender about rejection
            const senderSocketId = getReceiverSocketId(id);
            if (senderSocketId) {
                io.to(senderSocketId).emit("friend-request-rejected", { from: userId });
            }

            res.status(200).json({ message: "Friend request rejected" });
        } catch (error) {
            console.error("Error rejecting request:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    removeFriend: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user._id;

            const user = await User.findById(userId);
            const friend = await User.findById(id);

            if (!user || !friend) return res.status(404).json({ message: "User not found" });

            user.friends = user.friends.filter(friendId => friendId.toString() !== id.toString());
            friend.friends = friend.friends.filter(friendId => friendId.toString() !== userId.toString());

            await user.save();
            await friend.save();

            // ✅ Notify friend about removal
            const friendSocketId = getReceiverSocketId(id);
            if (friendSocketId) {
                io.to(friendSocketId).emit("friend-removed", { from: userId });
            }

            res.status(200).json({ message: "Friend removed" });
        } catch (error) {
            console.error("Error removing friend:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
};
