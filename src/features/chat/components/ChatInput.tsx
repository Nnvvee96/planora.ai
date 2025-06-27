/**
 * Chat Input Component
 *
 * This component handles user input in the chat interface.
 * It follows Planora's architectural principles of separation of concerns.
 */

import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export const ChatInput = ({
  onSendMessage,
  disabled = false,
  autoFocus = true,
}: ChatInputProps) => {
  const [inputMessage, setInputMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input when the component mounts
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim() || disabled) return;

    onSendMessage(inputMessage.trim());
    setInputMessage("");
  };

  return (
    <div className="p-4 border-t border-white/10 bg-background/80 backdrop-blur-md">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="relative">
          <Input
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about travel destinations, itineraries, or activities..."
            className="bg-white/5 border-white/10 text-white pr-12 py-6"
            disabled={disabled}
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white bg-planora-accent-purple hover:bg-planora-accent-purple/90"
            disabled={!inputMessage.trim() || disabled}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

// No default export - following Planora's architectural principles
