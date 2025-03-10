import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";
import { showMessageToast } from "../utils/showMessageToast.jsx";
import { useChatStore } from "./useChatStore";
export const useFriendsStore = create((set, get) => ({
    friends: [],
    sentRequests: [],
    receivedRequests: [],
    searchQuery: "",
    searchResults: [],
    isSearchingUsers: false,

    fetchFriends: async () => {
        try {
            const res = await axiosInstance.get("/friends");
            set({ friends: res.data });
        } catch (error) {
            
        }
    },

    fetchSentRequests: async () => {
        try {
            const res = await axiosInstance.get("/friends/sent-requests");
            set({ sentRequests: res.data });
        } catch (error) {
            
        }
    },

    fetchReceivedRequests: async () => {
        try {
            const res = await axiosInstance.get("/friends/received-requests");
            set({ receivedRequests: res.data });
        } catch (error) {
            
        }
    },

    sendFriendRequest: async (userId) => {
        try {
            await axiosInstance.post(`/friends/send-request/${userId}`);
            set((state) => ({ sentRequests: [...state.sentRequests, { _id: userId }] }));
            toast.success("Friend request sent");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send request");
        }
    },

    cancelFriendRequest: async (userId) => {
        try {
            await axiosInstance.post(`/friends/cancel-request/${userId}`);
            set((state) => ({ sentRequests: state.sentRequests.filter((req) => req._id !== userId) }));
            toast.success("Friend request canceled");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to cancel request");
        }
    },

    acceptFriendRequest: async (friendId) => {
        try {
            await axiosInstance.post(`/friends/accept-request/${friendId}`);
            set((state) => ({
                friends: [...state.friends, state.receivedRequests.find(req => req._id === friendId)],
                receivedRequests: state.receivedRequests.filter(req => req._id !== friendId),
            }));
            toast.success("Friend request accepted");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to accept request");
        }
    },

    rejectFriendRequest: async (userId) => {
        try {
            await axiosInstance.post(`/friends/reject-request/${userId}`);
            set((state) => ({
                receivedRequests: state.receivedRequests.filter((req) => req._id !== userId),
            }));
            toast.success("Friend request rejected");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to reject request");
        }
    },

    removeFriend: async (userId) => {
        try {
            await axiosInstance.post(`/friends/remove-friend/${userId}`);
            set((state) => ({ friends: state.friends.filter((friend) => friend._id !== userId) }));
            toast.success("Friend removed");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to remove friend");
        }
    },

    setSearchQuery: (query) => set({ searchQuery: query }),

    searchUsers: async (query) => {
        if (!query.trim()) {
            set({ searchResults: [] });
            return;
        }
        set({ isSearchingUsers: true });
        try {
            const res = await axiosInstance.get(`/friends/search?query=${query}`);
            set({ searchResults: res.data });
        } catch (error) {
            console.error("Error searching users:", error);
            set({ searchResults: [] });
        } finally {
            set({ isSearchingUsers: false });
        }
    },

    // ✅ Handle Socket Events
    initializeSocketListeners: () => {
        const { socket } = useAuthStore.getState();
        if (!socket) return;
        socket.on("friend-request-received", ({ from,fullName, profilePic }) => {
            set((state) => ({ receivedRequests: [...state.receivedRequests, { _id: from,fullName, profilePic }] }));
            console.log("request recieved")
            showMessageToast({text:"Sent you a friend request!"},{fullName,profilePic});
        });

        socket.on("friend-request-accepted", ({ from,fullName, profilePic }) => {
            set((state) => ({
                friends: [...state.friends, { _id: from,fullName, profilePic }],
                sentRequests: state.sentRequests.filter(req => req._id !== from),
            }));
            console.log("request accepted")
            showMessageToast({text:"Accepted your friend request!"},{fullName,profilePic});
        });

        socket.on("friend-request-rejected", ({ from }) => {
            set((state) => ({
                sentRequests: state.sentRequests.filter(req => req._id !== from),
            }));
            console.log("request rejected")
        });

        socket.on("friend-request-canceled", ({ from }) => {
            set((state) => ({
                receivedRequests: state.receivedRequests.filter(req => req._id !== from),
            }));
            console.log("request cancelled")
        });

        socket.on("friend-removed", ({ from }) => {
            set((state) => ({
                friends: state.friends.filter(friend => friend._id !== from),
            }));
            const { selectedUser, setSelectedUser } = useChatStore.getState();
            console.log(selectedUser,from)
            if (selectedUser?._id === from) {
                setSelectedUser(null);
            }
            console.log("friend removed")
        });
    },
}));
