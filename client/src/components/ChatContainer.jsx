import React, { useContext, useEffect, useRef, useState } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { ChatContext } from "../../context/chatcontext";
import { AuthContext } from "../../context/Authcontext";
import toast from "react-hot-toast";

const ChatContainer = () => {
  const scrollEnd = useRef();
  const {
    messages,
    selectedUser,
    setSelectedUser,
    sendMessage,
    getMessages,
  } = useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(AuthContext);

  const [input, setInput] = useState("");

  // ✅ Send text message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;
    try {
      await sendMessage({ text: input.trim() });
      setInput("");
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ Send image
  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await sendMessage({ image: reader.result });
        e.target.value = "";
      } catch (error) {
        toast.error(error.message);
      }
    };
    reader.readAsDataURL(file);
  };

  // ✅ Load messages
  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  // ✅ Auto scroll
  useEffect(() => {
    if (scrollEnd.current && messages.length > 0) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // ✅ No user selected
  if (!selectedUser) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 text-gray-300 bg-white/10 max-md:hidden">
        <img src={assets.logo_icon} alt="" className="max-w-16" />
        <p className="text-lg font-medium text-white">
          Chat Anytime, Anywhere
        </p>
      </div>
    );
  }

  // ✅ Render chat
  return (
    <div className="h-full flex flex-col relative bg-gradient-to-br from-[#0d0d1a] to-[#141428] rounded-3xl overflow-hidden shadow-lg border border-gray-800 m-3">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-700 bg-black/30 backdrop-blur-md">
        <img
          src={selectedUser.profilePic || assets.profile_martin}
          alt=""
          className="w-10 h-10 rounded-full object-cover"
        />
        <p className="flex-1 text-lg text-white flex items-center gap-2 font-semibold">
          {selectedUser.fullname}
          {onlineUsers?.includes(selectedUser._id) && (
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
          )}
        </p>
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt=""
          className="md:hidden max-w-7 cursor-pointer"
        />
      </div>

      {/* Chat messages box */}
      <div className="flex flex-col flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-black/20 backdrop-blur-xl">
        {messages
          ?.filter((msg) => msg && (msg.text || msg.image))
          .map((msg, index) => {
            const isMine = msg.senderId === authUser._id;
            return (
              <div
                key={index}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex flex-col max-w-[70%] p-3 rounded-2xl shadow-md ${
                    isMine
                      ? "bg-purple-600/80 text-white rounded-br-none"
                      : "bg-gray-800/70 text-gray-100 rounded-bl-none"
                  }`}
                >
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="attachment"
                      className="rounded-lg mb-2 max-h-56 object-cover border border-gray-700"
                    />
                  )}
                  {msg.text && <p className="break-words">{msg.text}</p>}
                  <p className="text-xs text-gray-300 mt-1 text-right">
                    {msg.createdAt ? formatMessageTime(msg.createdAt) : ""}
                  </p>
                </div>
              </div>
            );
          })}
        <div ref={scrollEnd}></div>
      </div>

      {/* Input area */}
      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-3 p-4 bg-black/40 backdrop-blur-md border-t border-gray-700"
      >
        <div className="flex-1 flex items-center bg-gray-900/60 px-3 py-2 rounded-full">
          <input
            type="text"
            className="flex-1 bg-transparent text-sm p-2 outline-none text-white placeholder-gray-500"
            placeholder="Send message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <input
            onChange={handleSendImage}
            type="file"
            id="image"
            accept="image/png,image/jpg,image/jpeg"
            hidden
          />
          <label htmlFor="image">
            <img
              src={assets.gallery_icon}
              alt=""
              className="w-5 mr-2 cursor-pointer opacity-70 hover:opacity-100"
            />
          </label>
        </div>
        <button type="submit">
          <img
            src={assets.send_button}
            alt=""
            className="w-7 cursor-pointer hover:scale-110 transition-transform"
          />
        </button>
      </form>
    </div>
  );
};

export default ChatContainer;
