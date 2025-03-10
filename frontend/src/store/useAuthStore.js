import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useFriendsStore } from "./useFriendStore";
import { useChatStore } from "./useChatStore";
const BASE_URL = "http://localhost:3000/api";

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isCheckingAuth: true,
    isSendingRecovery: false,
    isChangingPass: false,
    isUpdatingProfile: false,
    socket: null,
    onlineUsers: [],

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({ authUser: res.data.data });
            get().connectSocket();
            useFriendsStore.getState().initializeSocketListeners();
            useChatStore.getState().listenToAllMessages();
        } catch (error) {
            
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
            set({ authUser: res.data.data });
            toast.success("Logged in successfully");
            await get().checkAuth();
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
            useChatStore.getState().setSelectedUser(null);
            toast.success("Logged out successfully");
            get().disconnectSocket();
        } catch (error) {
            toast.error(error.response?.data?.message || "Logout failed");
        }
    },
    forgotPassword: async (email) => {
        set({ isSendingRecovery: true });
        try {
            await axiosInstance.post("/auth/forgot-password", { email });
            toast.success("Password recovery email sent! Check your inbox.");
        } catch (error) {
            
            toast.error(error.response?.data?.message || "Failed to send recovery email");
        } finally {
            set({ isSendingRecovery: false });
        }
    },

    // ✅ Reset Password
    resetPassword: async ({ token, password, confirmPassword }) => {
        set({ isChangingPass: true });
        try {
            if (password !== confirmPassword) {
                toast.error("Passwords do not match");
                return;
            }

            const res=await axiosInstance.post(`/auth/reset-password/${token}`, { password,confirmPassword });
            if (res.data.success) {
                toast.success("Password changed successfully! You can now log in.");
                return true; // Explicitly return true!
              } else {
                toast.error(res.data.message || "Something went wrong");
                return false;
              }
        } catch (error) {
            
            toast.error(error.response?.data?.message || "Password reset failed");
            return false;
        } finally {
            set({ isChangingPass: false });
        }
    },
    connectSocket: () => {
        const { authUser, socket } = get();
        if (!authUser) return;

        // ✅ Close any existing socket connection before reconnecting
        if (socket) {
            socket.disconnect();
        }
        const newSocket = io(BASE_URL, { query: { userId: authUser._id } });
        newSocket.connect();
        set({ socket:newSocket });

        newSocket.on("getOnlineUsers", (usersIds) => {
            set({ onlineUsers: usersIds });
        });
    },
    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put('/auth/update-profile', data);
            set((state) => ({ authUser: { ...state.authUser, ...res.data } }));
            toast.success("Profile updated successfully");
        } catch (error) {
            
            toast.error(error.response?.data?.message || "Profile update failed");
        } finally {
            set({ isUpdatingProfile: false });
        }
    },
    
    disconnectSocket: () => {
        if (get().socket?.connected) get().socket.disconnect();
    },
}));
