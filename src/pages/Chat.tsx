
/**
 * Chat Page Component
 * 
 * This is the main chat interface component that integrates all the chat feature
 * components. It follows Planora's architectural principles of separation of concerns.
 */

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthService } from '@/features/auth/authApi';
import { getUserProfileMenuComponent } from '@/features/user-profile/userProfileApi';

// Import our chat components
import { ConversationSidebar } from '@/features/chat/components/ConversationSidebar';
import { ChatHeader } from '@/features/chat/components/ChatHeader';
import { ChatInput } from '@/features/chat/components/ChatInput';
import { ChatMessage } from '@/features/chat/components/ChatMessage';
import { TravelPersonaEditPanel } from '@/features/chat/components/TravelPersonaEditPanel';

// Import from chat feature API
import { useChatState, MessageRole } from '@/features/chat/chatApi';

// Import icons
import { MessageCircle } from 'lucide-react';

const Chat: React.FC = () => {
  // Navigation
  const navigate = useNavigate();
  
  // Auth state
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // UI state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTravelPersonaEditOpen, setIsTravelPersonaEditOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get the UserProfileMenu component using the factory function
  const UserProfileMenu = getUserProfileMenuComponent();
  
  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        
        // Get auth service
        const authService = getAuthService();
        
        // Check if user is authenticated
        const user = await authService.getCurrentUser();
        
        if (user) {
          setUserId(user.id);
        } else {
          // Redirect to login if not authenticated
          navigate('/login');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [navigate]);
  
  // Initialize chat state using our custom hook
  const chatState = useChatState(userId || '');
  
  // Get the active conversation
  const activeConversation = chatState.getActiveConversation();
  
  // Auto scroll to bottom of messages when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConversation?.messages]);
  
  // Handle sending a message
  const handleSendMessage = useCallback(async (content: string) => {
    if (!userId) return;
    
    // If no active conversation, create one with the message as the title
    if (!chatState.activeConversationId) {
      await chatState.createConversation(content.slice(0, 30) + (content.length > 30 ? '...' : ''));
    }
    
    // Send the message
    await chatState.sendMessage(content);
  }, [chatState, userId]);
  
  // Toggle the mobile menu
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);
  
  // Toggle the travel persona edit panel
  const toggleTravelPersonaEdit = useCallback(() => {
    setIsTravelPersonaEditOpen(prev => !prev);
  }, []);
  
  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-planora-purple-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-planora-accent-purple"></div>
      </div>
    );
  }
  
  // Track window width for responsive design
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // Update width on resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const isMobileView = windowWidth < 768;
  
  return (
    <div className="flex h-screen overflow-hidden bg-planora-purple-dark">
      {/* Travel Persona Edit Panel - Only shown when open */}
      <TravelPersonaEditPanel 
        isOpen={isTravelPersonaEditOpen} 
        onClose={toggleTravelPersonaEdit} 
      />
      
      {/* Main layout container - adjusts based on sidebar state */}
      <div className="flex w-full h-full">
        {/* Conversation Sidebar - only takes up space when visible on desktop */}
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
          userProfileComponent={
            <Suspense fallback={<div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse"></div>}>
              <UserProfileMenu userName="" mini={true} />
            </Suspense>
          }
        />
      
        {/* Main chat area */}
        <div className={`flex-1 flex flex-col h-full overflow-hidden ${isMobileMenuOpen && isMobileView ? 'opacity-50' : ''}`}>
          {/* Chat header */}
          <ChatHeader 
            title={activeConversation?.title || "New Chat"}
            onToggleSidebar={toggleMobileMenu}
            onEditTravelPersona={toggleTravelPersonaEdit}
            isMobile={isMobileView}
          />
          
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 bg-planora-purple-dark/60">
            <div className="max-w-4xl mx-auto">
              {!activeConversation || activeConversation.messages?.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="bg-planora-accent-purple/20 p-4 rounded-full inline-flex items-center justify-center mb-4">
                      <MessageCircle className="h-8 w-8 text-planora-accent-purple" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">How can I help plan your trip?</h2>
                    <p className="text-white/60 max-w-md">
                      Start a conversation about any destination, travel dates, or activities you're interested in.
                    </p>
                  </div>
                </div>
              ) : (
                activeConversation.messages?.map(message => (
                  <ChatMessage 
                    key={message.id}
                    id={message.id}
                    role={message.role}
                    content={message.content}
                    timestamp={message.createdAt}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Input area */}
          <ChatInput 
            onSendMessage={handleSendMessage}
            disabled={chatState.loading}
          />
        </div>
      </div>
    </div>
  );
};

export { Chat };
