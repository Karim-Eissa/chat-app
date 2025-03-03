import User from "../models/user.model.js";
import { io } from "../lib/socket.js";

export default {
    // ✅ Send Friend Request
    sendRequest: async (req, res) => {
        try {
            const { id } = req.params; // Recipient ID
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
            sender.sentRequests.push(id); // Store outgoing request

            await recipient.save();
            await sender.save();

            res.status(200).json({ message: "Friend request sent" });
        } catch (error) {
            console.error("Error sending request:", error);
            res.status(500).json({ message: "Internal server error" });
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

            user.friends = user.friends.filter(friendId => friendId.toString() !== id);
            friend.friends = friend.friends.filter(friendId => friendId.toString() !== userId);

            await user.save();
            await friend.save();

            res.status(200).json({ message: "Friend removed" });
        } catch (error) {
            console.error("Error removing friend:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    // ✅ Get Friends List
    getFriends: async (req, res) => {
        try {
            const user = await User.findById(req.user._id).populate("friends", "fullName email profilePic");
            res.status(200).json(user.friends);
        } catch (error) {
            console.error("Error fetching friends:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    // ✅ Get Sent Friend Requests
    getSentRequests: async (req, res) => {
        try {
            const user = await User.findById(req.user._id).populate("sentRequests", "fullName email profilePic");
            res.status(200).json(user.sentRequests);
        } catch (error) {
            console.error("Error fetching sent requests:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
};
