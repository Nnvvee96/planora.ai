// src/pages/PlanTripPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PLAN_TRIP_PAGE_CLASSES } from "../utils/constants";
import { formatTimeDifference, groupChatsByDate, getInitials, getBackgroundColor } from "../utils/chatUtils";
import { handleSendMessage } from "../utils/chatLogic";

function PlanTripPage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [chatHistory, setChatHistory] = useState(user?.chatHistory || []);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [chatName, setChatName] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [step, setStep] = useState("initial");
  const [tripDetails, setTripDetails] = useState({
    budget: "",
    travelMonth: "",
    duration: "",
    destination: "",
    travelStyle: user?.travelPreferences?.travelStyle || "",
    accommodationType: "",
    requiresPrivateBathroom: null,
  });

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (currentChatId === null) {
      setMessages([]);
      setStep("initial");
      setTripDetails({
        budget: "",
        travelMonth: "",
        duration: "",
        destination: "",
        travelStyle: user?.travelPreferences?.travelStyle || "",
        accommodationType: "",
        requiresPrivateBathroom: null,
      });
      setChatName("");
    } else {
      const selectedChat = chatHistory.find((chat) => chat.id === currentChatId);
      if (selectedChat) {
        setMessages(selectedChat.messages);
        setStep(selectedChat.step);
        setTripDetails(selectedChat.tripDetails);
        setChatName(selectedChat.name);
      }
    }
  }, [currentChatId, user?.travelPreferences?.travelStyle]);

  useEffect(() => {
    if (messages.length > 0) {
      const updatedChat = {
        id: currentChatId || Date.now().toString(),
        name: chatName || "New Chat",
        messages,
        step,
        tripDetails,
        timestamp: new Date().toISOString(),
      };
      let updatedHistory;
      if (currentChatId) {
        updatedHistory = chatHistory.map((chat) =>
          chat.id === currentChatId ? updatedChat : chat
        );
      } else {
        updatedHistory = [...chatHistory, updatedChat];
        setCurrentChatId(updatedChat.id);
      }
      setChatHistory(updatedHistory);
      updateUser({ chatHistory: updatedHistory });
    }
  }, [messages, step, tripDetails, chatName]);

  const handleNewChat = () => {
    setCurrentChatId(null);
    setIsHistoryOpen(false);
  };

  const handleSelectChat = (chatId) => {
    setCurrentChatId(chatId);
    setIsHistoryOpen(false);
  };

  const handleSearchQuery = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleProfileClick = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handleCloseProfile = () => {
    setIsProfileOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleUserInput = (e) => {
    setUserInput(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage(
        userInput,
        messages,
        setMessages,
        chatName,
        setChatName,
        tripDetails,
        setTripDetails,
        step,
        setStep,
        user
      );
      setUserInput("");
    }
  };

  const groupedChats = groupChatsByDate(chatHistory, searchQuery);

  return (
    <div className={PLAN_TRIP_PAGE_CLASSES.container}>
      <div className={PLAN_TRIP_PAGE_CLASSES.header}>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className={PLAN_TRIP_PAGE_CLASSES.headerButton}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          <h1 className={PLAN_TRIP_PAGE_CLASSES.headerTitle}>Planora Chat</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className={PLAN_TRIP_PAGE_CLASSES.backButton}
          >
            <svg className={PLAN_TRIP_PAGE_CLASSES.backIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            <span className={PLAN_TRIP_PAGE_CLASSES.backText}>Back to Dashboard</span>
          </button>
        </div>
        <div className={PLAN_TRIP_PAGE_CLASSES.profileContainer}>
          <button onClick={handleProfileClick} className="focus:outline-none relative">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Profile"
                className={PLAN_TRIP_PAGE_CLASSES.profileImage}
              />
            ) : (
              <div
                className={`${PLAN_TRIP_PAGE_CLASSES.profileInitials} ${getBackgroundColor(user)}`}
              >
                {getInitials(user)}
              </div>
            )}
          </button>
          {isProfileOpen && (
            <div className={PLAN_TRIP_PAGE_CLASSES.profileDropdown}>
              <div className={PLAN_TRIP_PAGE_CLASSES.profileDropdownHeader}>
                <span className={PLAN_TRIP_PAGE_CLASSES.profileDropdownTitle}>Account</span>
                <button
                  onClick={handleCloseProfile}
                  className={PLAN_TRIP_PAGE_CLASSES.profileDropdownClose}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              <button
                onClick={() => navigate("/profile")}
                className={PLAN_TRIP_PAGE_CLASSES.profileDropdownItem}
              >
                Profile
              </button>
              <button
                onClick={() => navigate("/settings")}
                className={PLAN_TRIP_PAGE_CLASSES.profileDropdownItem}
              >
                Settings
              </button>
              <button
                onClick={() => navigate("/help-feedback")}
                className={PLAN_TRIP_PAGE_CLASSES.profileDropdownItem}
              >
                Help & Feedback
              </button>
              <button
                onClick={() => navigate("/upgrade-plan")}
                className={PLAN_TRIP_PAGE_CLASSES.profileDropdownItem}
              >
                Upgrade Plan
              </button>
              <button
                onClick={handleLogout}
                className={PLAN_TRIP_PAGE_CLASSES.profileDropdownItem}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {isHistoryOpen && (
        <div className={PLAN_TRIP_PAGE_CLASSES.historyContainer}>
          <div className={PLAN_TRIP_PAGE_CLASSES.historyHeader}>
            <h3 className={PLAN_TRIP_PAGE_CLASSES.historyTitle}>History</h3>
            <button
              onClick={() => setIsHistoryOpen(false)}
              className={PLAN_TRIP_PAGE_CLASSES.historyCloseButton}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchQuery}
            className={PLAN_TRIP_PAGE_CLASSES.historySearchInput}
            placeholder="Search chats..."
          />
          <button
            onClick={handleNewChat}
            className={PLAN_TRIP_PAGE_CLASSES.historyNewChatButton}
          >
            New Chat
          </button>
          <div className={PLAN_TRIP_PAGE_CLASSES.historyChatsContainer}>
            {Object.entries(groupedChats).map(([group, chats]) =>
              chats.length > 0 && (
                <div key={group} className="mb-4">
                  <h4 className={PLAN_TRIP_PAGE_CLASSES.historyGroupTitle}>{group}</h4>
                  {chats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => handleSelectChat(chat.id)}
                      className={`${PLAN_TRIP_PAGE_CLASSES.historyChatItem} ${
                        currentChatId === chat.id
                          ? PLAN_TRIP_PAGE_CLASSES.historyChatActive
                          : PLAN_TRIP_PAGE_CLASSES.historyChatInactive
                      }`}
                    >
                      <span>{chat.name}</span>
                      <div className="flex items-center space-x-2">
                        {currentChatId === chat.id && (
                          <span className={PLAN_TRIP_PAGE_CLASSES.historyChatCurrentTag}>
                            Current
                          </span>
                        )}
                        <span className={PLAN_TRIP_PAGE_CLASSES.historyChatTimestamp}>
                          {formatTimeDifference(chat.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
            {chatHistory.length === 0 && (
              <p className={PLAN_TRIP_PAGE_CLASSES.historyEmptyText}>
                No chats yet. Start a new one!
              </p>
            )}
          </div>
        </div>
      )}

      <div className={PLAN_TRIP_PAGE_CLASSES.chatContainer}>
        <div className={PLAN_TRIP_PAGE_CLASSES.chatCard}>
          <h2 className={PLAN_TRIP_PAGE_CLASSES.chatTitle}>{chatName || "New Chat"}</h2>
          <div className={PLAN_TRIP_PAGE_CLASSES.chatMessagesContainer}>
            {messages.length === 0 && (
              <div className={PLAN_TRIP_PAGE_CLASSES.chatEmptyMessage}>
                Start the conversation by typing your travel preferences below!
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`${PLAN_TRIP_PAGE_CLASSES.chatMessage} ${
                  message.sender === "user"
                    ? PLAN_TRIP_PAGE_CLASSES.chatMessageUser
                    : PLAN_TRIP_PAGE_CLASSES.chatMessageBot
                }`}
              >
                <div
                  className={`${PLAN_TRIP_PAGE_CLASSES.chatMessageBubble} ${
                    message.sender === "user"
                      ? PLAN_TRIP_PAGE_CLASSES.chatMessageUserBubble
                      : PLAN_TRIP_PAGE_CLASSES.chatMessageBotBubble
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className={PLAN_TRIP_PAGE_CLASSES.chatInputContainer}>
            <input
              type="text"
              value={userInput}
              onChange={handleUserInput}
              onKeyPress={handleKeyPress}
              className={PLAN_TRIP_PAGE_CLASSES.chatInput}
              placeholder="Type your travel preferences..."
            />
            <button
              onClick={() =>
                handleSendMessage(
                  userInput,
                  messages,
                  setMessages,
                  chatName,
                  setChatName,
                  tripDetails,
                  setTripDetails,
                  step,
                  setStep,
                  user
                ).then(() => setUserInput(""))
              }
              className={PLAN_TRIP_PAGE_CLASSES.chatSendButton}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlanTripPage;