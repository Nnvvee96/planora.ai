/**
 * Chat Page Component
 *
 * This is the main chat interface component that integrates all the chat feature
 * components. It follows Planora's architectural principles of separation of concerns.
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  Suspense,
} from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/authApi";
import { getUserProfileMenuComponent } from "@/features/user-profile/userProfileApi";

// Import from chat feature API - following architectural principles
import {
  useChatState,
  getConversationSidebarComponent,
  getChatHeaderComponent,
  getChatInputComponent,
  getChatMessageComponent,
  getTravelPersonaEditPanelComponent,
} from "@/features/chat/chatApi";

// Use lazy loading factory functions
const ConversationSidebar = getConversationSidebarComponent();
const ChatHeader = getChatHeaderComponent();
const ChatInput = getChatInputComponent();
const ChatMessage = getChatMessageComponent();
const TravelPersonaEditPanel = getTravelPersonaEditPanelComponent();

// Simple loading component for Suspense fallbacks
const LoadingFallback = () => (
  <div className="flex items-center justify-center w-full h-full">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Import UI utilities
import { useClientOnly } from "@/ui/hooks/useClientOnly";

// Import icons
import { MessageCircle } from "lucide-react";

const Chat = () => {
  // Navigation
  const navigate = useNavigate();

  // Get auth state from the auth hook
  const { user, loading: authLoading } = useAuth();

  // Extract userId from auth context
  const userId = user?.id || null;

  // UI state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTravelPersonaEditOpen, setIsTravelPersonaEditOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Track window width for responsive design with SSR safety
  const [_windowWidth, setWindowWidth] = useState(0);
  const [isMobileView, setIsMobileView] = useState(false);

  // Get the UserProfileMenu component using the factory function
  const UserProfileMenu = getUserProfileMenuComponent();

  // Use client-only hook at the top level to avoid conditional hook calls
  const isClientMounted = useClientOnly();

  // Create a client-only component wrapper to avoid hydration issues
  const ClientOnlyProfileMenu = () => {
    if (!isClientMounted) {
      return (
        <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse"></div>
      );
    }

    // Pass complete user data to ensure profile displays correctly
    return (
      <UserProfileMenu
        userName={user?.firstName || ""}
        userEmail={user?.email || ""}
        firstName={user?.firstName || ""}
        lastName={user?.lastName || ""}
        mini={true}
      />
    );
  };

  // Handle unauthorized access
  useEffect(() => {
    // Only redirect if auth is done loading and no user is found
    if (!authLoading && !userId) {
      navigate("/login");
    }
  }, [userId, authLoading, navigate]);

  // Initialize chat state using our custom hook
  const chatState = useChatState(userId || "");

  // Get the active conversation
  const activeConversation = chatState.getActiveConversation();

  // Auto scroll to bottom of messages when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeConversation?.messages]);

  // Safe window access after component mount
  useEffect(() => {
    if (isClientMounted) {
      // Set initial width
      setWindowWidth(window.innerWidth);
      setIsMobileView(window.innerWidth < 768);

      // Update width on resize
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
        setIsMobileView(window.innerWidth < 768);
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [isClientMounted]);

  // Handle sending a message
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!userId) return;

      // If no active conversation, create one with the message as the title
      if (!chatState.activeConversationId) {
        await chatState.createConversation(
          content.slice(0, 30) + (content.length > 30 ? "..." : ""),
        );
      }

      // Send the message
      await chatState.sendMessage(content);
    },
    [chatState, userId],
  );

  // Toggle the mobile menu
  const _toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  // Toggle the travel persona edit panel
  const toggleTravelPersonaEdit = useCallback(() => {
    setIsTravelPersonaEditOpen((prev) => !prev);
  }, []);

  // Loading state
  if (authLoading || !userId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-600/10 via-transparent to-transparent"></div>
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          <p className="text-white/70 text-center mt-4">Loading Chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative">
      {/* Modern layered background with sophisticated gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-600/15 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-pink-600/15 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-slate-900/80 to-transparent"></div>
      
      {/* Subtle animated background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-full blur-3xl animate-pulse-light"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-full blur-3xl animate-pulse-light" style={{ animationDelay: '2s' }}></div>
      {/* Travel Persona Edit Panel - Only shown when open */}
      {isTravelPersonaEditOpen && (
        <Suspense fallback={<LoadingFallback />}>
          <TravelPersonaEditPanel
            isOpen={isTravelPersonaEditOpen}
            onClose={toggleTravelPersonaEdit}
          />
        </Suspense>
      )}

      {/* Main layout container - adjusts based on sidebar state */}
      <div className="flex w-full h-full relative z-10">
        {/* Conversation Sidebar - only takes up space when visible on desktop */}
        <Suspense fallback={<LoadingFallback />}>
          <ConversationSidebar
            conversations={chatState.conversations}
            activeConversationId={chatState.activeConversationId}
            onSelectConversation={chatState.setActiveConversation}
            onCreateConversation={chatState.createConversation}
            onRenameConversation={chatState.renameConversation}
            onDeleteConversation={chatState.deleteConversation}
            isMobile={isMobileView}
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            userProfileComponent={<ClientOnlyProfileMenu />}
          />
        </Suspense>

        {/* Main chat area */}
        <div
          className={`flex-1 flex flex-col h-full overflow-hidden ${isMobileMenuOpen && isMobileView ? "opacity-50" : ""}`}
        >
          {/* Chat Header - shows current conversation title & actions */}
          <Suspense fallback={<LoadingFallback />}>
            <ChatHeader
              title={activeConversation?.title || "New Chat"}
              onToggleSidebar={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              onEditTravelPersona={toggleTravelPersonaEdit}
              isMobile={isMobileView}
            />
          </Suspense>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-6 bg-black/20 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto">
              {!activeConversation ||
              activeConversation.messages?.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/8 to-pink-500/8 rounded-full blur-2xl"></div>
                      <div className="relative bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded-full inline-flex items-center justify-center">
                        <MessageCircle className="h-10 w-10 text-white" />
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">
                      How can I help plan your trip?
                    </h2>
                    <p className="text-white/70 max-w-lg text-lg leading-relaxed">
                      Start a conversation about any destination, travel dates,
                      or activities you're interested in. I'll use your SmartTravel-Profile 
                      to give you personalized recommendations.
                    </p>
                  </div>
                </div>
              ) : (
                activeConversation.messages?.map((message, index) => (
                  <Suspense
                    key={message.id || index}
                    fallback={<LoadingFallback />}
                  >
                    <ChatMessage
                      key={message.id}
                      id={message.id}
                      role={message.role}
                      content={message.content}
                      timestamp={message.createdAt}
                    />
                  </Suspense>
                ))
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          </div>

          {/* Input area */}
          <Suspense fallback={<LoadingFallback />}>
            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={chatState.loading}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export { Chat };
