/**
 * Chat Header Component
 *
 * This component displays the header of the chat interface, including
 * the conversation title and edit travelPersona button.
 * It follows Planora's architectural principles of separation of concerns.
 */

import React from "react";
import { Button } from "@/ui/atoms/Button";
import { Settings, MessageCircle } from "lucide-react";

interface ChatHeaderProps {
  title: string;
  onToggleSidebar: () => void;
  onEditTravelPersona: () => void;
  isMobile: boolean;
}

export const ChatHeader = ({
  title,
  onToggleSidebar,
  onEditTravelPersona,
  isMobile,
}: ChatHeaderProps) => {
  return (
    <header className="relative bg-black/40 backdrop-blur-xl border-b border-white/20 p-4 flex items-center justify-between">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none"></div>
      
      <div className="flex items-center gap-3 relative z-10">
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggleSidebar}
            className="text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-xl"
          >
            <MessageCircle className="h-6 w-6" />
            <span className="sr-only">Toggle chat history</span>
          </Button>
        )}

        <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent truncate">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3 relative z-10">
        <Button
          size="sm"
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 px-4 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2"
          onClick={onEditTravelPersona}
        >
          <Settings className="h-4 w-4" />
          <span>SmartTravel-Profile</span>
        </Button>
      </div>
    </header>
  );
};

// No default export - following Planora's architectural principles
