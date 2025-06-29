/**
 * Chat Input Component
 *
 * This component handles user input in the chat interface.
 * It follows Planora's architectural principles of separation of concerns.
 */

import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/ui/atoms/Input";
import { Button } from "@/ui/atoms/Button";
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
    <div className="relative p-6 border-t border-white/20 bg-black/40 backdrop-blur-xl">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-500/5 via-transparent to-transparent pointer-events-none"></div>
      
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative z-10">
        <div className="relative">
          {/* Input container with glassmorphism */}
          <div className="relative bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden transition-all duration-300 focus-within:border-purple-400/50 focus-within:bg-white/10">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about travel destinations, itineraries, or activities..."
              className="bg-transparent border-0 text-white placeholder:text-white/50 px-6 py-4 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
              disabled={disabled}
            />
            
            {/* Send button */}
            <Button
              type="submit"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 rounded-xl h-10 w-10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!inputMessage.trim() || disabled}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Subtle glow effect when focused */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 transition-opacity duration-300 pointer-events-none focus-within:opacity-100 blur-xl"></div>
        </div>
        
        {/* Helper text */}
        <p className="text-white/40 text-sm mt-3 text-center">
          Press Enter to send • Shift+Enter for new line
        </p>
      </form>
    </div>
  );
};

// No default export - following Planora's architectural principles
