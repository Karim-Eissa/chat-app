import toast from "react-hot-toast";
import MessageToast from "../components/MessageToast";

export const showMessageToast = (newMessage, selectedUser = {}) => {
  

  let messageText = "Sent a message"; 

  if (newMessage?.image && newMessage.text.trim()) {
    messageText = `Sent a photo: ${newMessage.text}`;
  } else if (newMessage?.image) {
    messageText = "Sent a photo";
  } else if (newMessage?.text) {
    messageText = newMessage.text;
  }

  toast.custom((t) => (
    <MessageToast
      t={t}
      senderName={selectedUser?.fullName || "Unknown User"}
      senderProfilePic={selectedUser?.profilePic || "/avatar.png"}
      messageText={messageText} 
    />
  ), { position: "bottom-left" });
};
