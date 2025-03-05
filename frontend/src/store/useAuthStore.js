import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = "http://localhost:3000";

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isCheckingAuth: true,
    socket: null,
    onlineUsers: [],

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({ authUser: res.data.data });
            get().connectSocket();
        } catch (error) {
            console.log("Error in checkAuth", error);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            await axiosInstance.post("/auth/signup", data);
            toast.success("Account created! Check your email for verification.");
        } catch (error) {
            toast.error(error.response?.data?.message || "Signup failed");
        } finally {
            set({ isSigningUp: false });
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/login", data);
            set({ authUser: res.data });
            toast.success("Logged in successfully");
            get().connectSocket();
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed");
        } finally {
            set({ isLoggingIn: false });
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            toast.success("Logged out successfully");
            get().disconnectSocket();
        } catch (error) {
            toast.error(error.response?.data?.message || "Logout failed");
        }
    },

    connectSocket: () => {
        const { authUser } = get();
        if (!authUser || get().socket) return;

        const socket = io(BASE_URL, { query: { userId: authUser._id } });
        socket.connect();
        set({ socket });

        socket.on("getOnlineUsers", (usersIds) => {
            set({ onlineUsers: usersIds });
        });
    },
    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put('/auth/update-profile', data);
            set((state) => ({ authUser: { ...state.authUser, ...res.data } })); // Merge old and new data
            toast.success("Profile updated successfully");
        } catch (error) {
            console.log("Error in updating profile", error);
            toast.error(error.response?.data?.message || "Profile update failed");
        } finally {
            set({ isUpdatingProfile: false });
        }
    },
    
    disconnectSocket: () => {
        if (get().socket?.connected) get().socket.disconnect();
    },
}));
