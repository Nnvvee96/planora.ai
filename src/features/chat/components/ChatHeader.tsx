/**
 * Chat Header Component
 *
 * This component displays the header of the chat interface, including
 * the conversation title and edit travelPersona button.
 * It follows Planora's architectural principles of separation of concerns.
 */

import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
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
    <header className="bg-background/80 backdrop-blur-md border-b border-white/10 p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
            <MessageCircle className="h-5 w-5" />
            <span className="sr-only">Toggle chat history</span>
          </Button>
        )}

        <h1 className="text-xl font-medium truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="border-white/10 bg-white/5 flex items-center gap-1.5"
          onClick={onEditTravelPersona}
        >
          <Settings className="h-3.5 w-3.5 text-planora-accent-purple" />
          <span>SmartTravel-Profile</span>
        </Button>

        <Link to="/dashboard">
          <Button
            variant="outline"
            size="sm"
            className="border-white/10 bg-white/5"
          >
            Dashboard
          </Button>
        </Link>
      </div>
    </header>
  );
};

// No default export - following Planora's architectural principles
