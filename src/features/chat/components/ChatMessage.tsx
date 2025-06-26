/**
 * Chat Message Component
 *
 * This component displays a single message in the chat interface.
 * It follows Planora's architectural principles of separation of concerns.
 */

import React from "react";
import { MessageRole } from "../types/chatTypes";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  id: _id,
  role,
  content,
  timestamp,
}) => {
  return (
    <div
      className={cn(
        "mb-6 max-w-3xl",
        role === MessageRole.ASSISTANT ? "mr-auto" : "ml-auto",
      )}
    >
      <div
        className={cn(
          "px-4 py-3 rounded-lg",
          role === MessageRole.ASSISTANT
            ? "bg-planora-accent-purple/10 border border-planora-accent-purple/20"
            : "bg-white/10 border border-white/10",
        )}
      >
        <div className="flex items-center mb-2">
          <div
            className={cn(
              "h-7 w-7 rounded-full flex items-center justify-center mr-2",
              role === MessageRole.ASSISTANT
                ? "bg-planora-accent-purple text-white"
                : "bg-white/20",
            )}
          >
            {role === MessageRole.ASSISTANT ? "P" : "Y"}
          </div>
          <div>
            <p className="text-sm font-medium">
              {role === MessageRole.ASSISTANT ? "Planora AI" : "You"}
            </p>
            <p className="text-xs text-white/50">
              {new Intl.DateTimeFormat("en-US", {
                hour: "numeric",
                minute: "numeric",
              }).format(timestamp)}
            </p>
          </div>
        </div>
        <p className="text-sm whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
};

// No default export - following Planora's architectural principles
