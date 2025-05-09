import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { handleSendMessage } from "../utils/chatLogic";
import { formatTimeDifference, groupChatsByDate } from "../utils/chatUtils";
import { getInitials, getBackgroundColor } from "../utils/userUtils";

export const useChat = () => {
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
  }, [messages, step, tripDetails, chatName, currentChatId, updateUser]);

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

  return {
    user,
    navigate,
    chatHistory,
    currentChatId,
    messages,
    userInput,
    chatName,
    isHistoryOpen,
    searchQuery,
    isProfileOpen,
    step,
    tripDetails,
    messagesEndRef,
    handleNewChat,
    handleSelectChat,
    handleSearchQuery,
    handleProfileClick,
    handleCloseProfile,
    handleLogout,
    handleUserInput,
    handleKeyPress,
    groupedChats,
    setIsHistoryOpen,
    setUserInput,
    getInitials,
    getBackgroundColor,
  };
};