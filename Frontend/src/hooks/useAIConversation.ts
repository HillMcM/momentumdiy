import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const CONVERSATION_STORAGE_KEY = 'momentumdiy_ai_conversation';
const CONVERSATION_MAX_MESSAGES = 50; // Keep last 50 messages

/**
 * Hook for managing AI conversation history with persistence
 */
export function useAIConversation(conversationId: string = 'default') {
  const storageKey = `${CONVERSATION_STORAGE_KEY}_${conversationId}`;
  
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Load from localStorage on mount
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
    } catch (error) {
      console.warn('Failed to load conversation history', error);
    }
    return [];
  });

  // Persist to localStorage whenever messages change
  useEffect(() => {
    try {
      const toStore = messages.slice(-CONVERSATION_MAX_MESSAGES).map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString()
      }));
      localStorage.setItem(storageKey, JSON.stringify(toStore));
    } catch (error) {
      console.warn('Failed to save conversation history', error);
    }
  }, [messages, storageKey]);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => [...prev, message].slice(-CONVERSATION_MAX_MESSAGES));
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn('Failed to clear conversation history', error);
    }
  }, [storageKey]);

  const setMessagesDirect = useCallback((newMessages: ChatMessage[]) => {
    setMessages(newMessages);
  }, []);

  return {
    messages,
    addMessage,
    clearMessages,
    setMessages: setMessagesDirect
  };
}

/**
 * Hook for managing favorite prompts
 */
export function useFavoritePrompts() {
  const STORAGE_KEY = 'momentumdiy_favorite_prompts';

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const addFavorite = useCallback((prompt: string) => {
    setFavorites(prev => {
      const updated = [...prev, prompt].filter((v, i, arr) => arr.indexOf(v) === i); // Remove duplicates
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore storage errors
      }
      return updated;
    });
  }, []);

  const removeFavorite = useCallback((prompt: string) => {
    setFavorites(prev => {
      const updated = prev.filter(p => p !== prompt);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore storage errors
      }
      return updated;
    });
  }, []);

  const isFavorite = useCallback((prompt: string) => {
    return favorites.includes(prompt);
  }, [favorites]);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite
  };
}

