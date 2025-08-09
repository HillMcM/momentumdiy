import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function FloatingAssistant() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 'welcome',
    role: 'assistant',
    content: "Hi! I’m Hillary. I can help with whatever you’re doing on this page. What do you need?",
    timestamp: new Date()
  }]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // When route changes and panel is open, optionally drop a subtle note
  useEffect(() => {
    if (!isOpen) return;
    setMessages(prev => [...prev, {
      id: `nav-${Date.now()}`,
      role: 'assistant',
      content: `I see you’re on ${location.pathname}. How can I help here?`,
      timestamp: new Date()
    }]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.slice(-5).map(m => ({ role: m.role, content: m.content }));
      const res = await fetch('http://localhost:3001/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.content,
          conversationHistory,
          pagePath: location.pathname
        })
      });
      const data = await res.json();
      if (data.success && data.data?.response) {
        const aiMsg: ChatMessage = {
          id: String(Date.now() + 1),
          role: 'assistant',
          content: data.data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (err) {
      const aiMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: "I’m having trouble connecting right now. Please try again shortly.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts: Record<string, string[]> = {
    '/': [
      'What should I focus on first from my dashboard?',
      'Summarize what’s most behind schedule.'
    ],
    '/marketing-track': [
      'Explain this week’s concept in simple terms.',
      'What’s the next step to make progress today?'
    ],
    '/task-tracker': [
      'Help me break this task into smaller steps.',
      'Which tasks should I prioritize today?'
    ]
  };

  const promptsForPage = quickPrompts[location.pathname] || [
    'What can I do on this page to move faster?',
    'Suggest one quick win for me here.'
  ];

  return (
    <div className="floating-assistant-root" aria-live="polite">
      {!isOpen && (
        <button
          className="assistant-fab"
          aria-label="Open Marketing Assistant"
          title="Marketing Assistant"
          onClick={() => setIsOpen(true)}
        >
          marketing assistant
        </button>
      )}

      {isOpen && (
        <div className="assistant-panel" role="dialog" aria-modal="false" aria-label="Marketing Assistant">
          <div className="assistant-panel-header">
            <div className="assistant-title">Hillary • Marketing Assistant</div>
            <button className="assistant-close" aria-label="Close" onClick={() => setIsOpen(false)}>×</button>
          </div>
          <div className="assistant-panel-subheader">Context: {location.pathname}</div>
          <div className="assistant-panel-body">
            <div className="assistant-messages">
              {messages.map(m => (
                <div key={m.id} className={`assistant-message ${m.role}`}>
                  <div className="assistant-bubble">{m.content}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
              {isLoading && (
                <div className="assistant-message assistant"><div className="assistant-bubble"><span className="assistant-typing"><span></span><span></span><span></span></span></div></div>
              )}
            </div>
          </div>
          <div className="assistant-quick-prompts">
            {promptsForPage.map((p, idx) => (
              <button key={idx} onClick={() => setInputValue(p)}>{p}</button>
            ))}
          </div>
          <div className="assistant-panel-footer">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask for help with what’s on this page…"
              disabled={isLoading}
              aria-label="Type your message"
            />
            <button className="assistant-send" disabled={!inputValue.trim() || isLoading} onClick={handleSend}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}


