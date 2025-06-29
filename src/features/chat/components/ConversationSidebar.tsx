/**
 * Conversation Sidebar Component
 *
 * This component displays the list of conversations in the sidebar.
 * It follows Planora's architectural principles of separation of concerns.
 */

import React from "react";
import { Button } from "@/ui/atoms/Button";
import { Conversation } from "../types/chatTypes";
import { cn } from "@/lib/utils";
import { MessageCircle, Plus, Edit, Trash2, Home } from "lucide-react";
import { Logo } from "@/ui/atoms/Logo";
import { Link } from "react-router-dom";

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

export const ConversationSidebar = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onCreateConversation,
  onRenameConversation,
  onDeleteConversation,
  isMobile = false,
  isOpen = true,
  onClose,
  userProfileComponent,
}: ConversationSidebarProps) => {
  // If it's a mobile view and the sidebar is closed, don't render
  if (isMobile && !isOpen) return null;

  const handleRenameConversation = (conversationId: string) => {
    const conversation = conversations.find((c) => c.id === conversationId);
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
        "w-80 bg-black/30 backdrop-blur-xl border-r border-white/20 flex flex-col h-full transition-all duration-300 ease-in-out relative",
        isMobile ? "fixed inset-y-0 left-0 z-50" : "flex",
      )}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 pointer-events-none"></div>
      
      {/* Header with Logo */}
      <div className="relative z-10 p-6 border-b border-white/20 flex items-center">
        <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Logo noLink={true} />
        </Link>
      </div>

      {/* New Chat Button */}
      <div className="relative z-10 p-4">
        <Button
          onClick={onCreateConversation}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Plus className="h-5 w-5" />
          New Chat
        </Button>
      </div>

      {/* Conversations List */}
      <div className="relative z-10 flex-1 overflow-y-auto p-3 space-y-2">
        {conversations.length === 0 ? (
          <div className="text-center p-6 text-white/50 text-sm bg-white/5 rounded-xl border border-white/10">
            <MessageCircle className="h-8 w-8 mx-auto mb-3 text-white/30" />
            <p>No conversations yet.</p>
            <p className="mt-1">Start a new chat to begin.</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={cn(
                "group flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-300 border",
                activeConversationId === conversation.id
                  ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/30 shadow-lg shadow-purple-500/10"
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20",
              )}
              onClick={() => {
                onSelectConversation(conversation.id);
                if (isMobile && onClose) {
                  onClose();
                }
              }}
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className={cn(
                  "p-2 rounded-lg transition-colors",
                  activeConversationId === conversation.id
                    ? "bg-purple-500/30"
                    : "bg-white/10"
                )}>
                  <MessageCircle className={cn(
                    "h-4 w-4 transition-colors",
                    activeConversationId === conversation.id
                      ? "text-purple-200"
                      : "text-white/60"
                  )} />
                </div>
                <div className="truncate">
                  <p className={cn(
                    "text-sm font-semibold truncate transition-colors",
                    activeConversationId === conversation.id
                      ? "text-white"
                      : "text-white/90"
                  )}>
                    {conversation.title}
                  </p>
                  <p className="text-xs text-white/50 truncate mt-1">
                    {new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                    }).format(conversation.lastMessageTime)}
                  </p>
                </div>
              </div>

              <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRenameConversation(conversation.id);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white/60 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConversation(conversation.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer with Back to Dashboard and Profile */}
      <div className="relative z-10 p-4 border-t border-white/20 flex items-center justify-between bg-black/20 backdrop-blur-sm">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold transition-all duration-300"
        >
          <Home className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
        <div className="ml-3">
          {userProfileComponent}
        </div>
      </div>
    </aside>
  );
};

// No default export - following Planora's architectural principles
