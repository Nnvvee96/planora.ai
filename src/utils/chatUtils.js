// src/utils/chatUtils.js
export const formatTimeDifference = (timestamp) => {
    const now = new Date();
    const chatDate = new Date(timestamp);
    const diffMs = now - chatDate;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return chatDate.toLocaleDateString();
  };
  
  export const groupChatsByDate = (chats, searchQuery) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const thisYear = now.getFullYear();
  
    const grouped = {
      Today: [],
      Yesterday: [],
      "This Year": [],
      Older: [],
    };
  
    chats
      .filter((chat) => chat.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .forEach((chat) => {
        const chatDate = new Date(chat.timestamp);
        const chatDay = new Date(chatDate.getFullYear(), chatDate.getMonth(), chatDate.getDate());
  
        if (chatDay.getTime() === today.getTime()) {
          grouped.Today.push(chat);
        } else if (chatDay.getTime() === yesterday.getTime()) {
          grouped.Yesterday.push(chat);
        } else if (chatDate.getFullYear() === thisYear) {
          grouped["This Year"].push(chat);
        } else {
          grouped.Older.push(chat);
        }
      });
  
    return grouped;
  };
  
  export const getInitials = (user) => {
    if (!user) return "?";
    const firstInitial = user.firstName?.charAt(0)?.toUpperCase() || "";
    const lastInitial = user.lastName?.charAt(0)?.toUpperCase() || "";
    return firstInitial + lastInitial || "?";
  };
  
  export const getBackgroundColor = (user) => {
    if (user?.gender === "male") return "bg-blue-500";
    if (user?.gender === "female") return "bg-pink-500";
    return "bg-gray-500";
  };
  
  export const generateChatName = (prompt) => {
    const lowerPrompt = prompt.toLowerCase();
    if (lowerPrompt.includes("beach") && lowerPrompt.includes("europe")) {
      return "Sunny Beach Trip in Europe";
    } else if (lowerPrompt.includes("city") && lowerPrompt.includes("cultural")) {
      return "Cultural City Tour";
    } else if (lowerPrompt.includes("adventure")) {
      return "Adventure Getaway";
    } else {
      return prompt.slice(0, 20) + (prompt.length > 20 ? "..." : "");
    }
  };