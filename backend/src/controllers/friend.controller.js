import User from "../models/user.model.js";
import { io } from "../lib/socket.js";

export default {
    searchUsers: async (req, res) => {
        try {
            const { query } = req.query;
            if (!query) return res.status(400).json({ message: "Search query is required" });
            const userId = req.user._id;
            // Optimize by limiting results and indexing fullName
            const users = await User.find({
                fullName: { $regex: new RegExp(`^${query}`, "i") }, // Search names starting with query
                _id: { $ne: userId },
            })
            .select("fullName profilePic")
            .limit(10); // Limit results to avoid performance issues
            res.status(200).json(users);
        } catch (error) {
            console.error("Error searching users:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    // ✅ Get Friends List
    getFriends: async (req, res) => {
        try {
            const user = await User.findById(req.user._id).populate("friends", "fullName profilePic");
            console.log(user.friends)
            res.status(200).json(user.friends);
        } catch (error) {
            console.error("Error fetching friends:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    // ✅ Get Sent Friend Requests
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
    // ✅ Send Friend Request
    sendRequest: async (req, res) => {
        try {
            const { id } = req.params; 
            const senderId = req.user._id;
            if (id === senderId.toString()) {
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
            return res.status(200).json({ message: "Friend request canceled" });
        } catch (error) {
            return res.status(500).json({ message: "Server error" });
        }
    },
    
    
    // ✅ Accept Friend Request
    acceptRequest: async (req, res) => {
        try {
            const { id } = req.params; // Sender ID (who sent the request)
            const userId = req.user._id;

            const user = await User.findById(userId);
            const sender = await User.findById(id);

            if (!user || !sender) return res.status(404).json({ message: "User not found" });

            if (!user.friendRequests.includes(id)) {
                return res.status(400).json({ message: "No friend request from this user" });
            }

            // Remove from friend requests and add to friends list
            user.friendRequests = user.friendRequests.filter(reqId => reqId.toString() !== id);
            sender.sentRequests = sender.sentRequests.filter(reqId => reqId.toString() !== userId.toString());
            user.friends.push(id);
            sender.friends.push(userId);

            await user.save();
            await sender.save();

            io.to(sender._id.toString()).emit("friend-request-accepted", { from: userId });

            res.status(200).json({ message: "Friend request accepted" });
        } catch (error) {
            console.error("Error accepting request:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    // ✅ Reject Friend Request
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

            res.status(200).json({ message: "Friend request rejected" });
        } catch (error) {
            console.error("Error rejecting request:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    // ✅ Remove Friend
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

            res.status(200).json({ message: "Friend removed" });
        } catch (error) {
            console.error("Error removing friend:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    

    
    
};
