// src/utils/constants.js
export const SEARCH_BAR_PLACEHOLDER = "E.g., I want a sunny beach trip under €600";

export const TRIP_CARD_CLASSES = {
  container: "bg-gray-800 bg-opacity-80 backdrop-blur-md p-6 rounded-lg shadow-lg w-full max-w-md",
  title: "text-2xl font-bold text-white mb-2",
  description: "text-gray-400 mb-2",
  price: "text-blue-400 font-semibold mb-4",
  link: "bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors",
};

export const TRIP_CARD_LINK_TEXT = "View Details";

export const ERROR_PAGE_CLASSES = "text-white bg-black min-h-screen";

export const HELP_FEEDBACK_PAGE_CLASSES = {
  container: "min-h-screen bg-gray-900 text-gray-200 flex flex-col",
  content: "flex-1 p-4",
  card: "bg-gray-800 p-6 rounded-lg shadow-lg",
  title: "text-xl font-semibold mb-4",
  text: "text-gray-200",
};

export const LANDING_PAGE_CLASSES = {
  container: "min-h-screen bg-gradient-to-b from-black to-gray-900 text-white flex flex-col",
  main: "flex flex-col items-center justify-center flex-grow text-center px-4 pt-16 pb-8",
  title: "text-5xl md:text-7xl font-bold mb-4",
  subtitle: "text-lg md:text-xl mb-8 max-w-2xl",
  buttonWrapper: "", // Leer, da keine spezifische Klasse
  button: "bg-blue-500 text-white px-6 py-3 rounded-full text-lg hover:bg-blue-600 transition-colors",
};

export const LOGIN_PAGE_CLASSES = {
  container: "min-h-screen bg-gray-900 flex flex-col",
  main: "flex-grow flex items-center justify-center p-4",
  card: "bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md",
  title: "text-2xl font-bold text-gray-200 mb-6 text-center",
  error: "bg-red-600 text-white p-3 rounded-lg mb-4 text-center",
  label: "block text-gray-300 mb-2",
  input: "w-full p-3 rounded-lg bg-gray-700 text-gray-200 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500",
  button: "w-full bg-blue-600 text-gray-100 py-3 rounded-lg hover:bg-blue-700 transition-colors",
  link: "text-blue-500 hover:underline",
  footerText: "text-gray-400 text-center mt-4",
};

export const ONBOARDING_PAGE_CLASSES = {
  container: "min-h-screen bg-gradient-to-b from-black to-gray-900 text-white flex flex-col",
  main: "flex-1 flex items-center justify-center p-4",
  card: "bg-gray-800 bg-opacity-80 backdrop-blur-md p-8 rounded-lg shadow-lg w-full max-w-md",
  title: "text-2xl font-bold mb-6",
  label: "block text-left mb-1 text-gray-300",
  select: "text-black",
  info: "text-sm text-gray-400 mt-1",
  button: "w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors",
};

export const REGISTER_PAGE_CLASSES = {
  container: "min-h-screen bg-gradient-to-b from-black to-gray-900 text-white flex flex-col",
  main: "flex flex-col items-center justify-center flex-grow text-center px-4 py-8",
  card: "bg-gray-800 bg-opacity-80 backdrop-blur-md p-8 rounded-lg shadow-lg w-full max-w-md",
  title: "text-3xl font-bold mb-6",
  label: "block text-left mb-1 text-gray-300",
  input: "w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500",
  select: "text-black",
  autosuggest: "w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500",
  autosuggestSuggestions: "bg-gray-800 text-white rounded-lg mt-1 z-50",
  autosuggestSuggestion: "p-2 cursor-pointer hover:bg-gray-700",
  autosuggestHighlighted: "bg-gray-700",
  button: "w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors",
};

export const PROFILE_PAGE_CLASSES = {
  container: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50",
  toast: "absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50",
  modal: "bg-gray-900 text-white w-full max-w-4xl h-[80vh] rounded-lg shadow-lg flex relative overflow-hidden",
  closeButton: "absolute top-4 right-4 text-gray-400 hover:text-gray-200 focus:outline-none z-10",
  sidebar: "w-64 bg-gray-800 bg-opacity-80 backdrop-blur-md rounded-l-lg p-4 flex-shrink-0 md:block hidden",
  sidebarTitle: "text-xl font-semibold mb-4",
  sidebarItem: "w-full text-left py-2 px-4 rounded-lg",
  sidebarActive: "bg-blue-500 text-white",
  sidebarInactive: "bg-gray-700 text-gray-300 hover:bg-gray-600",
  mobileSelect: "w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500",
  content: "flex-grow p-8 overflow-y-auto",
  contentTitle: "text-xl font-semibold mb-4",
  label: "block text-left mb-1 text-gray-300",
  input: "w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500",
  select: "text-black",
  autosuggest: "w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500",
  autosuggestSuggestions: "bg-gray-800 text-white rounded-lg mt-1 z-50",
  autosuggestSuggestion: "p-2 cursor-pointer hover:bg-gray-700",
  autosuggestHighlighted: "bg-gray-700",
  button: "w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors",
  buttonGray: "w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-500 transition-colors",
  buttonRed: "w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors",
  buttonYellow: "w-full bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600 transition-colors",
  info: "text-sm text-gray-400 mt-1",
};

export const SETTINGS_PAGE_CLASSES = {
  container: "min-h-screen bg-gray-900 text-gray-200 flex flex-col",
  content: "flex-1 p-4",
  card: "bg-gray-800 p-6 rounded-lg shadow-lg",
  title: "text-xl font-semibold mb-4",
  text: "text-gray-200",
};

export const UPGRADE_PLAN_PAGE_CLASSES = {
  container: "min-h-screen bg-gray-900 text-gray-200 flex flex-col",
  content: "flex-1 p-4",
  card: "bg-gray-800 p-6 rounded-lg shadow-lg",
  title: "text-xl font-semibold mb-4",
  text: "text-gray-200",
};

export const PLAN_TRIP_PAGE_CLASSES = {
  container: "min-h-screen bg-gray-900 text-gray-200 flex flex-col",
  header: "flex justify-between items-center p-4 bg-gray-800 border-b border-gray-600",
  headerButton: "text-gray-400 hover:text-gray-200 focus:outline-none",
  headerTitle: "text-xl font-semibold text-gray-200",
  backButton: "text-gray-400 hover:text-gray-200 focus:outline-none flex items-center space-x-1",
  backIcon: "w-5 h-5",
  backText: "text-sm",
  profileContainer: "relative",
  profileImage: "w-10 h-10 rounded-full border-2 border-gray-500 object-cover",
  profileInitials: "w-10 h-10 rounded-full border-2 border-gray-500 flex items-center justify-center text-white font-semibold",
  profileDropdown: "absolute right-0 mt-2 w-48 bg-gray-700 rounded-lg shadow-lg py-2 z-10",
  profileDropdownHeader: "flex justify-between items-center px-4 py-2 border-b border-gray-600",
  profileDropdownTitle: "text-gray-300 font-semibold",
  profileDropdownClose: "text-gray-400 hover:text-gray-200 focus:outline-none",
  profileDropdownItem: "block w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-600 hover:text-gray-100",
  historyContainer: "fixed inset-y-0 left-0 w-80 bg-gray-800 p-4 flex flex-col border-r border-gray-600 z-20",
  historyHeader: "flex justify-between items-center mb-4",
  historyTitle: "text-xl font-semibold text-gray-200",
  historyCloseButton: "text-gray-400 hover:text-gray-200 focus:outline-none",
  historySearchInput: "w-full p-2 mb-4 rounded-lg bg-gray-700 text-gray-200 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500",
  historyNewChatButton: "mb-4 bg-blue-600 text-gray-100 py-2 rounded-lg hover:bg-blue-700",
  historyChatsContainer: "flex-1 overflow-y-auto",
  historyGroupTitle: "text-sm font-semibold text-gray-500 mb-2",
  historyChatItem: "p-3 rounded-lg cursor-pointer flex justify-between items-center mb-2",
  historyChatActive: "bg-blue-600 text-gray-100",
  historyChatInactive: "bg-gray-700 text-gray-300 hover:bg-gray-600",
  historyChatCurrentTag: "text-xs bg-green-500 text-white px-2 py-1 rounded-full",
  historyChatTimestamp: "text-sm text-gray-400",
  historyEmptyText: "text-gray-400",
  chatContainer: "flex-1 flex flex-col p-4",
  chatCard: "bg-gray-800 p-6 rounded-lg shadow-lg flex-1 flex flex-col border border-gray-700",
  chatTitle: "text-2xl font-bold mb-4 text-gray-200",
  chatMessagesContainer: "flex-1 overflow-y-auto mb-4",
  chatEmptyMessage: "text-gray-400 text-center mt-10",
  chatMessage: "mb-3 flex",
  chatMessageUser: "justify-end",
  chatMessageBot: "justify-start",
  chatMessageBubble: "inline-block p-4 rounded-lg max-w-[70%] shadow-md whitespace-pre-wrap",
  chatMessageUserBubble: "bg-blue-600 text-gray-100",
  chatMessageBotBubble: "bg-gray-700 text-gray-200",
  chatInputContainer: "flex items-center space-x-3",
  chatInput: "flex-1 p-4 rounded-lg bg-gray-700 text-gray-200 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg",
  chatSendButton: "bg-blue-600 text-gray-100 px-6 py-3 rounded-lg hover:bg-blue-700 text-lg",
};

export const PAST_TRIPS_PAGE_CLASSES = {
  container: "min-h-screen bg-gradient-to-b from-black to-gray-900 text-white flex flex-col items-center p-4",
  card: "bg-gray-800 bg-opacity-80 backdrop-blur-md p-8 rounded-lg shadow-lg w-full max-w-2xl",
  title: "text-2xl font-bold mb-6",
  tripContainer: "space-y-4",
  tripCard: "bg-gray-700 p-4 rounded-lg",
  tripTitle: "text-xl font-semibold",
  tripText: "text-gray-300",
  tripNotes: "text-gray-400 mt-2",
  emptyText: "text-gray-300",
};

export const footerLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];