/**
 * Chat State Hook
 * 
 * Custom React hook to manage chat state including conversations and messages.
 * Follows Planora's architectural principles with separation of concerns.
 */

import { useState, useEffect, useCallback } from 'react';
import { chatService } from '../services/chatService';
import { 
  ChatState,
  MessageRole
} from '../types/chatTypes';

/**
 * React hook for managing chat state and operations
 * @param userId The ID of the current user
 * @returns Chat state and functions for managing conversations and messages
 */
export const useChatState = (userId: string) => {
  // Initialize chat state
  const [state, setState] = useState<ChatState>({
    conversations: [],
    activeConversationId: null,
    loading: true,
    error: null
  });

  // Load conversations on mount
  useEffect(() => {
    if (!userId) return;
    
    const loadConversations = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const conversations = await chatService.getConversations(userId);
        
        setState(prev => ({
          ...prev,
          conversations,
          loading: false,
          // Set the active conversation to the first one if none is selected
          activeConversationId: prev.activeConversationId || (conversations.length > 0 ? conversations[0].id : null)
        }));
      } catch (error) {
        console.error('Error loading conversations:', error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load conversations. Please try again.'
        }));
      }
    };
    
    loadConversations();
  }, [userId]);

  // Set the active conversation and load its messages
  const setActiveConversation = useCallback(async (conversationId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const conversation = await chatService.getConversationWithMessages(conversationId);
      
      if (!conversation) {
        throw new Error('Conversation not found');
      }
      
      // Update the active conversation with its messages
      setState(prev => ({
        ...prev,
        conversations: prev.conversations.map(c => 
          c.id === conversation.id ? conversation : c
        ),
        activeConversationId: conversationId,
        loading: false
      }));
      
      return conversation;
    } catch (error) {
      console.error('Error setting active conversation:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load conversation messages. Please try again.'
      }));
      return null;
    }
  }, []);

  // Create a new conversation
  const createConversation = useCallback(async (title: string = 'New conversation') => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const newConversation = await chatService.createConversation({
        userId,
        title
      });
      
      setState(prev => ({
        ...prev,
        conversations: [newConversation, ...prev.conversations],
        activeConversationId: newConversation.id,
        loading: false
      }));
      
      return newConversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to create new conversation. Please try again.'
      }));
      return null;
    }
  }, [userId]);

  // Rename a conversation
  const renameConversation = useCallback(async (conversationId: string, newTitle: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const updatedConversation = await chatService.updateConversation({
        id: conversationId,
        title: newTitle
      });
      
      setState(prev => ({
        ...prev,
        conversations: prev.conversations.map(c => 
          c.id === updatedConversation.id ? { ...c, title: updatedConversation.title } : c
        ),
        loading: false
      }));
      
      return updatedConversation;
    } catch (error) {
      console.error('Error renaming conversation:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to rename conversation. Please try again.'
      }));
      return null;
    }
  }, []);

  // Delete a conversation
  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      await chatService.deleteConversation(conversationId);
      
      // Update state: remove the deleted conversation and set a new active one if needed
      setState(prev => {
        const updatedConversations = prev.conversations.filter(c => c.id !== conversationId);
        let newActiveId = prev.activeConversationId;
        
        // If we deleted the active conversation, select a new one
        if (prev.activeConversationId === conversationId) {
          newActiveId = updatedConversations.length > 0 ? updatedConversations[0].id : null;
        }
        
        return {
          ...prev,
          conversations: updatedConversations,
          activeConversationId: newActiveId,
          loading: false
        };
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to delete conversation. Please try again.'
      }));
      return false;
    }
  }, []);

  // Send a user message and get assistant response
  const sendMessage = useCallback(async (content: string) => {
    if (!state.activeConversationId) {
      // If no active conversation, create one first
      const newConversation = await createConversation(content.slice(0, 30) + (content.length > 30 ? '...' : ''));
      if (!newConversation) return null;
    }
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Add user message
      const userMessage = await chatService.createMessage({
        conversationId: state.activeConversationId!,
        role: MessageRole.USER,
        content
      });
      
      // Update state with the new user message
      setState(prev => {
        const updatedConversations = prev.conversations.map(c => {
          if (c.id === prev.activeConversationId) {
            return {
              ...c,
              lastMessageTime: userMessage.createdAt,
              messages: [...(c.messages || []), userMessage]
            };
          }
          return c;
        });
        
        return {
          ...prev,
          conversations: updatedConversations,
          loading: true // Still loading because we're waiting for assistant response
        };
      });
      
      // In a real implementation, here we would call the AI service to get a response
      // For now, we'll just simulate a response after a delay
      
      // This will be replaced with actual AI calls in the future
      return userMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to send message. Please try again.'
      }));
      return null;
    }
  }, [state.activeConversationId, createConversation]);

  // Get the active conversation
  const getActiveConversation = useCallback(() => {
    if (!state.activeConversationId) return null;
    return state.conversations.find(c => c.id === state.activeConversationId) || null;
  }, [state.activeConversationId, state.conversations]);

  return {
    ...state,
    setActiveConversation,
    createConversation,
    renameConversation,
    deleteConversation,
    sendMessage,
    getActiveConversation
  };
};

// No default export - following Planora's architectural principles
