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
      <div className="flex items-center justify-center h-screen bg-planora-purple-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-planora-accent-purple"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-planora-purple-dark">
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
      <div className="flex w-full h-full">
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
          <div className="flex-1 overflow-y-auto p-4 bg-planora-purple-dark/60">
            <div className="max-w-4xl mx-auto">
              {!activeConversation ||
              activeConversation.messages?.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="bg-planora-accent-purple/20 p-4 rounded-full inline-flex items-center justify-center mb-4">
                      <MessageCircle className="h-8 w-8 text-planora-accent-purple" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">
                      How can I help plan your trip?
                    </h2>
                    <p className="text-white/60 max-w-md">
                      Start a conversation about any destination, travel dates,
                      or activities you're interested in.
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
