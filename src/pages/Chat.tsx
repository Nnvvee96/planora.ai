
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MessageCircle, 
  Send, 
  Home,
  Plus,
  Edit,
  Trash2,
  ChevronRight
} from 'lucide-react';
import Logo from '@/components/Logo';
import UserProfileMenu from '@/components/UserProfileMenu';
import { cn } from "@/lib/utils";

// Types for the chat interface
type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  lastMessageTime: Date;
};

const Chat: React.FC = () => {
  // Sample conversations for the UI
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      title: "Weekend in Barcelona",
      messages: [
        { 
          id: "1-1", 
          role: "user", 
          content: "I want to plan a weekend trip to Barcelona in June", 
          timestamp: new Date(2025, 4, 10, 14, 35)
        },
        {
          id: "1-2",
          role: "assistant",
          content: "Great choice! Barcelona in June offers wonderful weather for exploring. Let me help you plan the perfect weekend itinerary. Let's start with some essential details:\n\n1. What's your budget for this trip?\n2. Do you prefer hotels, hostels, or vacation rentals?\n3. Are you interested more in cultural experiences, beaches, nightlife, or food?",
          timestamp: new Date(2025, 4, 10, 14, 36)
        }
      ],
      lastMessageTime: new Date(2025, 4, 10, 14, 36)
    },
    {
      id: "2",
      title: "Family trip to Japan",
      messages: [
        { 
          id: "2-1", 
          role: "user", 
          content: "Planning a family trip to Japan with kids aged 8 and 12", 
          timestamp: new Date(2025, 4, 8, 10, 15)
        },
        {
          id: "2-2",
          role: "assistant",
          content: "Japan is a fantastic destination for families! With kids aged 8 and 12, you'll have many exciting options. Let me help you create a family-friendly itinerary. To get started, I'll need a few key details:\n\n1. What's your overall budget for the trip?\n2. How long are you planning to stay?\n3. When are you thinking of traveling? (Japan has distinct seasons with different experiences)\n4. Are there specific cities or attractions your family is interested in visiting?",
          timestamp: new Date(2025, 4, 8, 10, 17)
        }
      ],
      lastMessageTime: new Date(2025, 4, 8, 10, 17)
    }
  ]);
  
  const [activeConversationId, setActiveConversationId] = useState<string | null>("1");
  const [inputMessage, setInputMessage] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversationId, conversations]);

  // Focus the input field when the chat is loaded
  useEffect(() => {
    inputRef.current?.focus();
  }, [activeConversationId]);
  
  const activeConversation = conversations.find(c => c.id === activeConversationId);
  
  const createNewChat = () => {
    const newConversationId = Date.now().toString();
    
    setConversations(prev => [
      {
        id: newConversationId,
        title: "New conversation",
        messages: [],
        lastMessageTime: new Date()
      },
      ...prev
    ]);
    
    setActiveConversationId(newConversationId);
    setInputMessage("");
    setIsMobileMenuOpen(false);
  };
  
  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    
    if (activeConversationId === id) {
      if (conversations.length > 1) {
        const nextConversation = conversations.find(c => c.id !== id);
        setActiveConversationId(nextConversation?.id || null);
      } else {
        createNewChat();
      }
    }
  };
  
  const renameConversation = (id: string, newTitle: string) => {
    setConversations(prev => 
      prev.map(c => c.id === id ? { ...c, title: newTitle } : c)
    );
  };
  
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !activeConversationId) return;
    
    const messageId = Date.now().toString();
    const newMessage: Message = {
      id: messageId,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };
    
    // Update the conversation with the new message
    setConversations(prev => 
      prev.map(c => {
        if (c.id === activeConversationId) {
          // If it's a new conversation without a title, set the title based on first message
          const title = c.messages.length === 0 
            ? inputMessage.trim().slice(0, 30) + (inputMessage.trim().length > 30 ? '...' : '')
            : c.title;
          
          return {
            ...c,
            title,
            messages: [...c.messages, newMessage],
            lastMessageTime: new Date()
          };
        }
        return c;
      })
    );
    
    setInputMessage("");
    
    // Simulate AI response after a short delay
    setTimeout(() => {
      const isNewConversation = activeConversation?.messages.length === 0;
      let responseContent = "";
      
      if (isNewConversation) {
        // For a brand new conversation, ask for the core parameters
        responseContent = `Thanks for reaching out to Planora.ai! To help plan your perfect trip, I'll need a few essential details:

1. What's your travel budget?
2. What type of accommodation do you prefer? (hotel, hostel, vacation rental)
3. What type of trip are you looking for? (beach, city exploration, nature)
4. When are you planning to travel? (specific dates or timeframe)
5. Where will you be departing from?

Once I have these details, I can provide personalized recommendations for your vacation.`;
      } else {
        // For an existing conversation
        responseContent = `I'd be happy to help you plan your trip! Based on what you've shared, here are some suggestions and questions to refine your plan:

1. Would you prefer budget-friendly options or are you looking for more luxury experiences?
2. Are you interested in popular tourist attractions or would you prefer off-the-beaten-path experiences?
3. How do you feel about ${inputMessage.toLowerCase().includes('beach') ? 'beachfront accommodations' : 'centrally located hotels'}?

Let me know your preferences, and I can tailor recommendations specifically for you.`;
      }
      
      const aiMessageId = Date.now().toString();
      const aiResponse: Message = {
        id: aiMessageId,
        role: 'assistant',
        content: responseContent,
        timestamp: new Date()
      };
      
      setConversations(prev => 
        prev.map(c => {
          if (c.id === activeConversationId) {
            return {
              ...c,
              messages: [...c.messages, aiResponse],
              lastMessageTime: new Date()
            };
          }
          return c;
        })
      );
    }, 1000);
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-planora-purple-dark">
      {/* Sidebar - Conversation history */}
      <aside 
        className={cn(
          "w-80 bg-black/20 border-r border-white/10 flex flex-col transition-all duration-300 ease-in-out",
          isMobileMenuOpen ? "fixed inset-y-0 left-0 z-50" : "hidden md:flex"
        )}
      >
        <div className="p-4 border-b border-white/10 flex items-center">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Logo />
          </Link>
        </div>
        
        <div className="p-3">
          <Button 
            onClick={createNewChat} 
            className="w-full bg-gradient-to-r from-planora-accent-purple to-planora-accent-pink hover:opacity-90"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map(conversation => (
            <div 
              key={conversation.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg cursor-pointer group",
                activeConversationId === conversation.id 
                  ? "bg-white/10" 
                  : "hover:bg-white/5"
              )}
              onClick={() => {
                setActiveConversationId(conversation.id);
                setIsMobileMenuOpen(false);
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
                    const newTitle = prompt("Enter new chat title:", conversation.title);
                    if (newTitle) renameConversation(conversation.id, newTitle);
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
                    if (confirm("Delete this conversation?")) {
                      deleteConversation(conversation.id);
                    }
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-white/10 flex items-center justify-between">
          <Link to="/dashboard" className="text-sm text-white/60 hover:text-white flex items-center gap-2">
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <UserProfileMenu userName="Sarah" mini={true} />
        </div>
      </aside>
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Chat header */}
        <header className="bg-background/80 backdrop-blur-md border-b border-white/10 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <MessageCircle className="h-5 w-5" />
              <span className="sr-only">Toggle chat history</span>
            </Button>
            
            <h1 className="text-xl font-medium">
              {activeConversation ? activeConversation.title : "New Chat"}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Link to="/dashboard">
              <Button variant="outline" size="sm" className="border-white/10 bg-white/5">
                Dashboard
              </Button>
            </Link>
          </div>
        </header>
        
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 bg-planora-purple-dark/60">
          <div className="max-w-4xl mx-auto">
            {activeConversation?.messages.length === 0 ? (
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
              activeConversation?.messages.map(message => (
                <div 
                  key={message.id} 
                  className={cn(
                    "mb-6 max-w-3xl",
                    message.role === "assistant" ? "mr-auto" : "ml-auto"
                  )}
                >
                  <div 
                    className={cn(
                      "px-4 py-3 rounded-lg",
                      message.role === "assistant" 
                        ? "bg-planora-accent-purple/10 border border-planora-accent-purple/20" 
                        : "bg-white/10 border border-white/10"
                    )}
                  >
                    <div className="flex items-center mb-2">
                      <div 
                        className={cn(
                          "h-7 w-7 rounded-full flex items-center justify-center mr-2",
                          message.role === "assistant" 
                            ? "bg-planora-accent-purple text-white" 
                            : "bg-white/20"
                        )}
                      >
                        {message.role === "assistant" ? "P" : "S"}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {message.role === "assistant" ? "Planora AI" : "You"}
                        </p>
                        <p className="text-xs text-white/50">
                          {new Intl.DateTimeFormat('en-US', { 
                            hour: 'numeric', 
                            minute: 'numeric'
                          }).format(message.timestamp)}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Input area */}
        <div className="p-4 border-t border-white/10 bg-background/80 backdrop-blur-md">
          <form onSubmit={sendMessage} className="max-w-4xl mx-auto">
            <div className="relative">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about travel destinations, itineraries, or activities..."
                className="bg-white/5 border-white/10 text-white pr-12 py-6"
              />
              <Button 
                type="submit" 
                size="icon" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white bg-planora-accent-purple hover:bg-planora-accent-purple/90"
                disabled={!inputMessage.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
