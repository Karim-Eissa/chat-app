import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useChatStore } from "../store/useChatStore";

const RouteChangeListener = () => {
  const location = useLocation();
  const setSelectedUser = useChatStore((state) => state.setSelectedUser);

  useEffect(() => {
    if (location.pathname !== "/") {
      setSelectedUser(null);
    }
  }, [location.pathname]);
  

  return null; 
};

export default RouteChangeListener;
