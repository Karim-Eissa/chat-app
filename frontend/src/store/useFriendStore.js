import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useFriendsStore = create((set, get) => ({
    friends: [],
    sentRequests: [],
    recievedRequests: [],
    searchQuery: "",
    searchResults: [],
    isSearchingUsers: false,

    fetchFriends: async () => {
        try {
            const res = await axiosInstance.get("/friends");
            set({ friends: res.data });
        } catch (error) {
            console.log("Error fetching friends", error);
        }
    },

    fetchSentRequests: async () => {
        try {
            const res = await axiosInstance.get("/friends/sent-requests");
            set({ sentRequests: res.data });
        } catch (error) {
            console.log("Error fetching sent requests", error);
        }
    },

    fetchRecievedRequests: async () => {
        try {
            const res = await axiosInstance.get("/friends/received-requests");
            set({ recievedRequests: res.data });
        } catch (error) {
            console.log("Error fetching received requests", error);
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
                friends: [...state.friends, state.recievedRequests.find(req => req._id === friendId)],
                recievedRequests: state.recievedRequests.filter(req => req._id !== friendId),
            }));
        } catch (error) {
            console.error("Error accepting friend request:", error);
        }
    },

    rejectFriendRequest: async (userId) => {
        try {
            await axiosInstance.post(`/friends/reject-request/${userId}`);
            set((state) => ({
                recievedRequests: state.recievedRequests.filter((req) => req._id !== userId),
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
}));
