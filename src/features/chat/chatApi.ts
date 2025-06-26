/**
 * Chat Feature API
 *
 * This file serves as the public API boundary for the chat feature.
 * It follows Planora's architectural principles by exposing only what should be
 * accessible to other parts of the application.
 */

import { chatService } from "./services/chatService";
import {
  Conversation,
  Message,
  CreateConversationDto,
  UpdateConversationDto,
  CreateMessageDto,
  MessageRole,
  ChatState,
} from "./types/chatTypes";
import { useChatState } from "./hooks/useChatState";

// Re-export types for use by other features
export type {
  Conversation,
  Message,
  CreateConversationDto,
  UpdateConversationDto,
  CreateMessageDto,
  ChatState,
};

export { MessageRole };

// Export the service functions
export { chatService };

// Export hooks
export { useChatState };

// Import lazy for component lazy loading
import { lazy } from "react";

// Factory functions to get chat-related components
export function getConversationSidebarComponent() {
  return lazy(() =>
    import("./components/ConversationSidebar").then((module) => ({
      default: module.ConversationSidebar,
    })),
  );
}

export function getChatHeaderComponent() {
  return lazy(() =>
    import("./components/ChatHeader").then((module) => ({
      default: module.ChatHeader,
    })),
  );
}

export function getChatInputComponent() {
  return lazy(() =>
    import("./components/ChatInput").then((module) => ({
      default: module.ChatInput,
    })),
  );
}

export function getChatMessageComponent() {
  return lazy(() =>
    import("./components/ChatMessage").then((module) => ({
      default: module.ChatMessage,
    })),
  );
}

export function getTravelPersonaEditPanelComponent() {
  return lazy(() =>
    import("./components/TravelPersonaEditPanel").then((module) => ({
      default: module.TravelPersonaEditPanel,
    })),
  );
}

// Factory function to get chat-related components (to be implemented later)
export const getChatPanelComponent = () => {
  return null; // Will be implemented with real components in the future
};
