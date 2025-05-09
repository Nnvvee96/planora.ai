// src/pages/PlanTripPage.jsx
import React from "react";
import { PLAN_TRIP_PAGE_CLASSES } from "../utils/constants";
import { handleSendMessage } from "../utils/chatLogic";
import { useChat } from "../hooks/useChat";

function PlanTripPage() {
  const {
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
    step,
    tripDetails,
    setMessages,
    setChatName,
    setTripDetails,
    setStep,
  } = useChat();

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