import { useEffect, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

const MessageToast = ({ t, senderName, senderProfilePic, messageText }) => {
  const [textColor, setTextColor] = useState("text-white");

  useEffect(() => {
    const theme = localStorage.getItem("chat-theme");
    if (theme === "pastel" || theme === "cyberpunk") {
      setTextColor("text-black");
    }
  }, []);

  return (
    <div
      className={`${
        t.visible ? "animate-enter" : "animate-leave"
      } max-w-md w-full bg-secondary shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <img
              className="h-10 w-10 rounded-full"
              src={senderProfilePic || "/avatar.png"}
              alt={senderName}
            />
          </div>
          <div className="ml-3 flex-1 overflow-hidden">
            <p className={`text-sm font-medium ${textColor} truncate`}>{senderName}</p>
            <p className={`mt-1 text-sm ${textColor} line-clamp-2`}>
              {messageText || "Sent an attachment"}
            </p>
          </div>
        </div>
      </div>
      <div className="flex">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-white hover:text-gray-200 focus:outline-none"
        >
          <X />
        </button>
      </div>
    </div>
  );
};

export default MessageToast;
