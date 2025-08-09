import React, { useState, useRef, useEffect } from 'react';
import type { MarketingGoal, Task } from './types';

interface AIMarketingAssistantProps {
  marketingGoals?: MarketingGoal[];
  tasks?: Task[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIMarketingAssistant({ marketingGoals = [], tasks = [] }: AIMarketingAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi there! I\'m Hillary, your marketing consultant. I\'m here to help you with your marketing strategy, especially as you work through your marketing track. What would you like to work on today?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Prepare conversation history for context
      const conversationHistory = messages.slice(-5).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const { API_BASE_URL } = await import('./services/api');
      const response = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          conversationHistory
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.data.response,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const activeGoal = marketingGoals.find(goal => goal.isActive);
  const pendingTasks = tasks.filter(task => task.status === 'todo');

  return (
    <div className="ai-marketing-assistant">
      <div className="ai-header">
        <h1>AI Marketing Assistant</h1>
        <p>Get personalized marketing advice from Hillary, your marketing consultant</p>
        {activeGoal && (
          <div className="current-track-info">
            <h3>Current Track: {activeGoal.title}</h3>
            <p>Week {activeGoal.currentWeek} of {activeGoal.duration} • {activeGoal.progress}% complete</p>
            <p>{pendingTasks.length} pending tasks</p>
          </div>
        )}
      </div>

      <div className="chat-container">
        <div className="messages">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.role}`}>
              <div className="message-content">
                {message.content}
              </div>
              <div className="message-timestamp">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message assistant">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about your marketing strategy, current track progress, or any marketing questions..."
            disabled={isLoading}
          />
          <button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="send-button"
          >
            Send
          </button>
        </div>
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button onClick={() => setInputValue('Help me understand this week\'s marketing concept better')}>
            Clarify This Week's Concept
          </button>
          <button onClick={() => setInputValue('I\'m not sure how to implement this week\'s action item')}>
            Help with Action Item
          </button>
          <button onClick={() => setInputValue('Can you suggest the best way to approach this for my specific business?')}>
            Business-Specific Advice
          </button>
          <button onClick={() => setInputValue('I feel overwhelmed with marketing. What should I focus on?')}>
            Simplify My Approach
          </button>
        </div>
      </div>
    </div>
  );
}
