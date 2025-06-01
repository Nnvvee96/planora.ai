/**
 * Chat Service
 * 
 * Provides data access and management functions for the chat feature.
 * This service follows Planora's architectural principles of separation of concerns.
 */

import { supabase } from '@/database/databaseApi';
import { 
  Conversation, 
  Message, 
  CreateConversationDto, 
  UpdateConversationDto, 
  CreateMessageDto,
  MessageRole
} from '../types/chatTypes';

/**
 * Gets all conversations for a user
 * @param userId The user ID
 * @returns A list of conversations
 */
export const getConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('last_message_time', { ascending: false });
    
    if (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
    
    return data.map(conversation => ({
      id: conversation.id,
      userId: conversation.user_id,
      title: conversation.title,
      createdAt: new Date(conversation.created_at),
      updatedAt: new Date(conversation.updated_at),
      lastMessageTime: new Date(conversation.last_message_time),
    }));
  } catch (error) {
    console.error('Error in getConversations:', error);
    throw error;
  }
};

/**
 * Gets a single conversation by ID, including its messages
 * @param conversationId The conversation ID
 * @returns The conversation with messages
 */
export const getConversationWithMessages = async (conversationId: string): Promise<Conversation | null> => {
  try {
    // First, get the conversation
    const { data: conversationData, error: conversationError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();
    
    if (conversationError) {
      console.error('Error fetching conversation:', conversationError);
      throw conversationError;
    }
    
    if (!conversationData) {
      return null;
    }
    
    // Then, get the messages for this conversation
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      throw messagesError;
    }
    
    // Map the conversation and messages to our model
    const conversation: Conversation = {
      id: conversationData.id,
      userId: conversationData.user_id,
      title: conversationData.title,
      createdAt: new Date(conversationData.created_at),
      updatedAt: new Date(conversationData.updated_at),
      lastMessageTime: new Date(conversationData.last_message_time),
      messages: messagesData.map(message => ({
        id: message.id,
        conversationId: message.conversation_id,
        role: message.role as MessageRole,
        content: message.content,
        createdAt: new Date(message.created_at),
      }))
    };
    
    return conversation;
  } catch (error) {
    console.error('Error in getConversationWithMessages:', error);
    throw error;
  }
};

/**
 * Creates a new conversation
 * @param data The conversation data
 * @returns The created conversation
 */
export const createConversation = async (data: CreateConversationDto): Promise<Conversation> => {
  try {
    const { data: conversationData, error } = await supabase
      .from('conversations')
      .insert({
        user_id: data.userId,
        title: data.title,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
    
    return {
      id: conversationData.id,
      userId: conversationData.user_id,
      title: conversationData.title,
      createdAt: new Date(conversationData.created_at),
      updatedAt: new Date(conversationData.updated_at),
      lastMessageTime: new Date(conversationData.last_message_time),
    };
  } catch (error) {
    console.error('Error in createConversation:', error);
    throw error;
  }
};

/**
 * Updates a conversation
 * @param data The conversation update data
 * @returns The updated conversation
 */
export const updateConversation = async (data: UpdateConversationDto): Promise<Conversation> => {
  try {
    const updateData: any = {};
    
    if (data.title !== undefined) {
      updateData.title = data.title;
    }
    
    // Always update the last_message_time when updating a conversation
    updateData.updated_at = new Date().toISOString();
    
    const { data: conversationData, error } = await supabase
      .from('conversations')
      .update(updateData)
      .eq('id', data.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating conversation:', error);
      throw error;
    }
    
    return {
      id: conversationData.id,
      userId: conversationData.user_id,
      title: conversationData.title,
      createdAt: new Date(conversationData.created_at),
      updatedAt: new Date(conversationData.updated_at),
      lastMessageTime: new Date(conversationData.last_message_time),
    };
  } catch (error) {
    console.error('Error in updateConversation:', error);
    throw error;
  }
};

/**
 * Deletes a conversation
 * @param conversationId The ID of the conversation to delete
 * @returns True if successful
 */
export const deleteConversation = async (conversationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);
    
    if (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteConversation:', error);
    throw error;
  }
};

/**
 * Creates a new message in a conversation
 * @param data The message data
 * @returns The created message
 */
export const createMessage = async (data: CreateMessageDto): Promise<Message> => {
  try {
    // First, insert the message
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: data.conversationId,
        role: data.role,
        content: data.content,
      })
      .select()
      .single();
    
    if (messageError) {
      console.error('Error creating message:', messageError);
      throw messageError;
    }
    
    // Then, update the conversation's last_message_time
    const { error: updateError } = await supabase
      .from('conversations')
      .update({
        last_message_time: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.conversationId);
    
    if (updateError) {
      console.error('Error updating conversation last_message_time:', updateError);
    }
    
    return {
      id: messageData.id,
      conversationId: messageData.conversation_id,
      role: messageData.role as MessageRole,
      content: messageData.content,
      createdAt: new Date(messageData.created_at),
    };
  } catch (error) {
    console.error('Error in createMessage:', error);
    throw error;
  }
};

// Bundle all methods into a single service export following Planora's architectural principles
export const chatService = {
  getConversations,
  getConversationWithMessages,
  createConversation,
  updateConversation,
  deleteConversation,
  createMessage,
};
