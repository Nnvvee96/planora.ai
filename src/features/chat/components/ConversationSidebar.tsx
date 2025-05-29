/**
 * Conversation Sidebar Component
 * 
 * This component displays the list of conversations in the sidebar.
 * It follows Planora's architectural principles of separation of concerns.
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Conversation } from '../types/chatTypes';
import { cn } from '@/lib/utils';
import { 
  MessageCircle, 
  Plus,
  Edit, 
  Trash2
} from 'lucide-react';
import { Logo } from '@/ui/atoms/Logo';
import { Link } from 'react-router-dom';

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onCreateConversation: () => void;
  onRenameConversation: (conversationId: string, newTitle: string) => void;
  onDeleteConversation: (conversationId: string) => void;
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  userProfileComponent: React.ReactNode;
}

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onCreateConversation,
  onRenameConversation,
  onDeleteConversation,
  isMobile = false,
  isOpen = true,
  onClose,
  userProfileComponent
}) => {
  
  // If it's a mobile view and the sidebar is closed, don't render
  if (isMobile && !isOpen) return null;
  
  const handleRenameConversation = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) return;
    
    const newTitle = prompt("Enter new chat title:", conversation.title);
    if (newTitle && newTitle.trim() !== conversation.title) {
      onRenameConversation(conversationId, newTitle.trim());
    }
  };
  
  const handleDeleteConversation = (conversationId: string) => {
    if (window.confirm("Delete this conversation?")) {
      onDeleteConversation(conversationId);
    }
  };
  
  return (
    <aside 
      className={cn(
        "w-80 bg-black/20 border-r border-white/10 flex flex-col h-full transition-all duration-300 ease-in-out",
        isMobile ? "fixed inset-y-0 left-0 z-50" : "flex"
      )}
    >
      <div className="p-4 border-b border-white/10 flex items-center">
        <Link to="/dashboard" className="flex items-center gap-2">
          <Logo />
        </Link>
      </div>
      
      <div className="p-3">
        <Button 
          onClick={onCreateConversation} 
          className="w-full bg-gradient-to-r from-planora-accent-purple to-planora-accent-pink hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {conversations.length === 0 ? (
          <div className="text-center p-4 text-white/50 text-sm">
            No conversations yet. Start a new chat to begin.
          </div>
        ) : (
          conversations.map(conversation => (
            <div 
              key={conversation.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg cursor-pointer group",
                activeConversationId === conversation.id 
                  ? "bg-white/10" 
                  : "hover:bg-white/5"
              )}
              onClick={() => {
                onSelectConversation(conversation.id);
                if (isMobile && onClose) {
                  onClose();
                }
              }}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <MessageCircle className="h-5 w-5 text-white/60 flex-shrink-0" />
                <div className="truncate">
                  <p className="text-sm font-medium truncate">{conversation.title}</p>
                  <p className="text-xs text-white/50 truncate">
                    {new Intl.DateTimeFormat('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric'
                    }).format(conversation.lastMessageTime)}
                  </p>
                </div>
              </div>
              
              <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-white/60 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRenameConversation(conversation.id);
                  }}
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-white/60 hover:text-red-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConversation(conversation.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="p-4 border-t border-white/10 flex items-center justify-between">
        <Link to="/dashboard" className="text-sm text-white/60 hover:text-white flex items-center gap-2">
          <Home className="h-4 w-4" />
          Back to Dashboard
        </Link>
        {userProfileComponent}
      </div>
    </aside>
  );
};

// Import Home icon
import { Home } from 'lucide-react';

// No default export - following Planora's architectural principles
