/**
 * Chat Message Component
 *
 * This component displays a single message in the chat interface.
 * It follows Planora's architectural principles of separation of concerns.
 */

import React from "react";
import { MessageRole } from "../types/chatTypes";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export const ChatMessage = ({
  id: _id,
  role,
  content,
  timestamp,
}: ChatMessageProps) => {
  const isAssistant = role === MessageRole.ASSISTANT;
  
  return (
    <div
      className={cn(
        "mb-8 max-w-4xl group",
        isAssistant ? "mr-auto" : "ml-auto",
      )}
    >
      <div
        className={cn(
          "relative p-6 rounded-2xl backdrop-blur-sm border transition-all duration-300",
          isAssistant
            ? "bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-400/20 shadow-lg shadow-purple-500/5"
            : "bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-400/20 shadow-lg shadow-blue-500/5",
        )}
      >
        {/* Subtle inner glow */}
        <div className={cn(
          "absolute inset-0 rounded-2xl opacity-50 pointer-events-none",
          isAssistant
            ? "bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5"
            : "bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5"
        )}></div>
        
        <div className="flex items-start mb-4 relative z-10">
          {/* Modern avatar */}
          <div
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-xl mr-4 shadow-lg transition-transform duration-300 group-hover:scale-105",
              isAssistant
                ? "bg-gradient-to-br from-purple-500 to-pink-500"
                : "bg-gradient-to-br from-blue-500 to-cyan-500",
            )}
          >
            {isAssistant ? (
              <Bot className="h-5 w-5 text-white" />
            ) : (
              <User className="h-5 w-5 text-white" />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-base font-semibold text-white">
                {isAssistant ? "Planora AI" : "You"}
              </p>
              <p className="text-xs text-white/50 font-medium">
                {new Intl.DateTimeFormat("en-US", {
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                }).format(timestamp)}
              </p>
            </div>
          </div>
        </div>
        
        {/* Message content */}
        <div className="relative z-10 ml-14">
          <p className="text-white/90 text-base leading-relaxed whitespace-pre-wrap">
            {content}
          </p>
        </div>
      </div>
    </div>
  );
};

// No default export - following Planora's architectural principles
