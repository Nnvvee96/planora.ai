/**
 * Chat Types
 *
 * This file defines the types used throughout the chat feature,
 * ensuring type safety and consistency across components.
 */

/**
 * Message role - who sent the message
 */
export enum MessageRole {
  USER = "user",
  ASSISTANT = "assistant",
}

/**
 * Message model - represents a single message in a conversation
 */
export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
}

/**
 * Conversation model - represents a chat conversation
 */
export interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessageTime: Date;
  messages?: Message[];
}

/**
 * DTO for creating a new conversation
 */
export interface CreateConversationDto {
  userId: string;
  title: string;
}

/**
 * DTO for updating a conversation
 */
export interface UpdateConversationDto {
  id: string;
  title?: string;
}

/**
 * DTO for creating a new message
 */
export interface CreateMessageDto {
  conversationId: string;
  role: MessageRole;
  content: string;
}

/**
 * Chat state for managing conversations and messages in the UI
 */
export interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  loading: boolean;
  error: string | null;
}
