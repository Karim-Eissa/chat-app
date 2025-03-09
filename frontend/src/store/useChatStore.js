import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { showMessageToast } from "../utils/showMessageToast.jsx";
import { useFriendsStore } from "./useFriendStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },
  subscribeToMessages:()=>{
    const {selectedUser}=get();
    if(!selectedUser) return;
    const socket=useAuthStore.getState().socket;
    socket.off("newChatMessage");
    socket.on("newChatMessage",(newMessage)=>{
        if(newMessage.senderId !== selectedUser._id) return;
        set({messages:[...get().messages,newMessage]})
    })
  },
  listenToAllMessages: () => {
    const socket = useAuthStore.getState().socket;
    const { authUser } = useAuthStore.getState();
    if (!authUser) return;
    socket.off("newGlobalMessage");
    socket.on("newGlobalMessage", (newMessage) => {
      const { selectedUser } = get();
      if (newMessage.receiverId !== authUser._id) return;
      if (selectedUser?._id === newMessage.senderId) return;
      console.log(selectedUser,newMessage.senderId)
      console.log("📩 Incoming global message:", newMessage);
  
      const sender = useFriendsStore.getState().friends.find(
        (friend) => friend._id === newMessage.senderId
      );
      console.log("sender:",sender)
      showMessageToast(newMessage, sender);
    });
  },
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newChatMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
