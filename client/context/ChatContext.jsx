import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./Authcontext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(
    JSON.parse(localStorage.getItem("selectedUser")) || null
  );
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket, axios } = useContext(AuthContext);

  // ✅ Get all users
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages || {});
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ Get messages for selected user
  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages);
        localStorage.setItem(`messages_${userId}`, JSON.stringify(data.messages));
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ Send message
const sendMessage = async (messageData) => {
  if (!selectedUser) return toast.error("Select a user first!");

  try {
    const { data } = await axios.post(
      `/api/messages/send/${selectedUser._id}`,
      messageData
    );

    if (data.success) {
      setMessages((prev) => {
        const updatedMessages = [...prev, data.newMessage];

        // ✅ Save to localStorage after new state is ready
        localStorage.setItem(
          `messages_${selectedUser._id}`,
          JSON.stringify(updatedMessages)
        );

        return updatedMessages;
      });
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error(error.message);
  }
};


  // ✅ Subscribe to incoming socket messages
  const subscribeToMessages = () => {
    if (!socket) return;

    socket.off("newMessage"); // clear old listeners to prevent duplicates

    socket.on("newMessage", async (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        // If message is from the currently selected user
        newMessage.seen = true;
        setMessages((prev) => [...prev, newMessage]);
        await axios.put(`/api/messages/mark/${newMessage._id}`);

        // Update persistence
        localStorage.setItem(
          `messages_${selectedUser._id}`,
          JSON.stringify([...messages, newMessage])
        );
      } else {
        // Otherwise increase unseen count
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1,
        }));
      }
    });
  };

  // ✅ Cleanup listener
  const unsubscribeFromMessages = () => {
    if (socket) socket.off("newMessage");
  };

  // ✅ Re-subscribe on socket/selectedUser change
  useEffect(() => {
    if (socket) subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [socket, selectedUser]);

  // ✅ Load messages and selected user from localStorage on mount
  useEffect(() => {
    if (selectedUser) {
      const storedMessages = localStorage.getItem(`messages_${selectedUser._id}`);
      if (storedMessages) setMessages(JSON.parse(storedMessages));
      localStorage.setItem("selectedUser", JSON.stringify(selectedUser));
    }
  }, [selectedUser]);

  const value = {
    messages,
    users,
    getUsers,
    getMessages,
    sendMessage,
    unseenMessages,
    selectedUser,
    setSelectedUser,
    setUnseenMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
