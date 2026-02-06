import { useState, useRef, useEffect } from 'react';
import { Plus, Send, Trash2, Sparkles } from 'lucide-react';
import { conversations as initialConversations, Conversation, Message } from '@/data/mockData';
import { motion, AnimatePresence } from 'framer-motion';
const ChatAssistant = () => {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(initialConversations[0]?.id || null);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages]);
  const handleNewChat = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New conversation',
      preview: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: []
    };
    setConversations([newConversation, ...conversations]);
    setActiveConversationId(newConversation.id);
    setInputValue('');
  };
  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations(conversations.filter(c => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(conversations[0]?.id || null);
    }
  };
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !activeConversationId) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString()
    };

    // Update conversation with user message
    setConversations(prev => prev.map(conv => {
      if (conv.id === activeConversationId) {
        const isFirstMessage = conv.messages.length === 0;
        return {
          ...conv,
          title: isFirstMessage ? inputValue.slice(0, 40) : conv.title,
          preview: inputValue.slice(0, 60),
          updatedAt: new Date().toISOString(),
          messages: [...conv.messages, userMessage]
        };
      }
      return conv;
    }));
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputValue);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString()
      };
      setConversations(prev => prev.map(conv => {
        if (conv.id === activeConversationId) {
          return {
            ...conv,
            messages: [...conv.messages, assistantMessage]
          };
        }
        return conv;
      }));
      setIsTyping(false);
    }, 1500);
  };
  const generateAIResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('payment') || lowerQuery.includes('refund')) {
      return `Based on my analysis of the **payment-service** repository, here's what I found:\n\n**Overview**\nThe payment service handles all payment processing through Stripe integration. It includes refund capabilities, subscription management, and webhook handling.\n\n**Recent Activity**\n- Sarah Chen has been actively working on the refund feature (15 commits this week)\n- 3 open pull requests related to payment processing\n\n**Key Files**\n- \`/src/services/stripe.ts\` - Main Stripe integration\n- \`/src/handlers/refund.ts\` - Refund processing logic\n\nWould you like me to suggest who should review the pending PRs?`;
    }
    if (lowerQuery.includes('assign') || lowerQuery.includes('who should')) {
      return `Based on expertise and current workload, I recommend:\n\n**Top Recommendation: Sarah Chen**\n- ✅ 85% expertise match (Python, AWS, Backend)\n- ✅ 60% current capacity (has bandwidth)\n- ✅ 15 commits to similar services\n\n**Alternative: James Park**\n- ✅ 75% expertise match\n- ⚠️ 70% capacity (moderately busy)\n\nWould you like me to create a Jira ticket and assign it automatically?`;
    }
    if (lowerQuery.includes('sprint') || lowerQuery.includes('status') || lowerQuery.includes('progress')) {
      return `**Sprint Progress Summary**\n\n📊 **Overall**: 56% complete (18/32 tickets)\n\n**By Status:**\n- ✅ Done: 18 tickets\n- 🔄 In Progress: 6 tickets\n- 📋 To Do: 6 tickets\n- 🚫 Blocked: 2 tickets\n\n**Risks:**\n- 2 tickets are blocked and need attention\n- 7 tickets are unassigned\n\n**Velocity:** On track to complete by sprint end.`;
    }
    if (lowerQuery.includes('team') || lowerQuery.includes('capacity')) {
      return `**Team Capacity Overview**\n\n| Member | Capacity | Status |\n|--------|----------|--------|\n| Sarah Chen | 75% | Busy |\n| Michael Torres | 60% | Available |\n| Emily Rodriguez | 85% | Very Busy |\n| David Kim | 45% | Available |\n| Lisa Wang | 55% | Available |\n| James Park | 70% | Moderately Busy |\n\n**3 team members** are available for new assignments. Would you like me to suggest optimal task distribution?`;
    }
    return `I understand you're asking about "${query}". \n\nI can help you with:\n- **Repository analysis** - Explain code structure and recent changes\n- **Task assignment** - Suggest optimal team member assignments\n- **Sprint tracking** - Review progress and identify blockers\n- **Team insights** - Analyze capacity and expertise\n\nCould you provide more specific details about what you'd like to know?`;
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSendMessage();
    }
  };
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  // Group conversations by date
  const groupedConversations = conversations.reduce((groups, conv) => {
    const date = formatTimestamp(conv.updatedAt);
    if (!groups[date]) groups[date] = [];
    groups[date].push(conv);
    return groups;
  }, {} as Record<string, Conversation[]>);
  return <div className="flex h-full">
      {/* Conversation Sidebar */}
      <div className="w-notion-chat-sidebar border-r border-notion-border bg-[#FAFAF9] flex flex-col">
        <div className="p-[12px] px-[8px]">
          <button onClick={handleNewChat} className="w-full notion-btn-secondary flex items-center justify-center gap-2">
            <Plus className="w-[14px] h-[14px]" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-[8px] pb-[12px]">
          {Object.entries(groupedConversations).map(([date, convs]) => <div key={date} className="mb-[16px]">
              <div className="text-[12px] text-notion-text-tertiary px-[8px] py-[4px] font-medium">
                {date}
              </div>
              {convs.map(conv => <div key={conv.id} onClick={() => setActiveConversationId(conv.id)} className={`group flex items-center justify-between px-[8px] py-[6px] rounded-[4px] cursor-pointer transition-colors duration-150 ${activeConversationId === conv.id ? 'bg-notion-active' : 'hover:bg-notion-hover'}`}>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] text-notion-text truncate">
                      {conv.title}
                    </div>
                    <div className="text-[12px] text-notion-text-secondary truncate">
                      {conv.preview || 'No messages yet'}
                    </div>
                  </div>
                  <button onClick={e => handleDeleteConversation(conv.id, e)} className="opacity-0 group-hover:opacity-100 p-[4px] hover:bg-notion-border rounded-[4px] transition-opacity duration-150">
                    <Trash2 className="w-[14px] h-[14px] text-notion-text-secondary" />
                  </button>
                </div>)}
            </div>)}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {activeConversation ? <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-notion-chat mx-auto px-notion-massive py-notion-xxl">
                {activeConversation.messages.length === 0 ? <div className="flex flex-col items-center justify-center h-[400px] text-center">
                    <div className="w-[48px] h-[48px] bg-notion-blue/10 rounded-[8px] flex items-center justify-center mb-[16px]">
                      <Sparkles className="w-[24px] h-[24px] text-notion-blue" />
                    </div>
                    <h2 className="text-[24px] font-semibold text-notion-text mb-[8px]">
                      How can I help you today?
                    </h2>
                    <p className="text-[16px] text-notion-text-secondary max-w-[400px]">
                      Ask me about your repositories, Jira tickets, team assignments, or any project-related questions.
                    </p>
                  </div> : <div className="space-y-[16px]">
                    <AnimatePresence>
                      {activeConversation.messages.map(message => <motion.div key={message.id} initial={{
                  opacity: 0,
                  y: 10
                }} animate={{
                  opacity: 1,
                  y: 0
                }} transition={{
                  duration: 0.15
                }}>
                          {message.role === 'user' ? <div className="border border-notion-border rounded-[6px] p-[12px] px-[16px] bg-primary-foreground">
                              <p className="text-[15px] text-notion-text whitespace-pre-wrap">
                                {message.content}
                              </p>
                            </div> : <div className="py-[12px]">
                              <div className="prose prose-notion text-[15px] leading-[1.6] text-notion-text">
                                {message.content.split('\n').map((line, i) => {
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return <p key={i} className="font-semibold text-notion-text my-[8px]">
                                        {line.replace(/\*\*/g, '')}
                                      </p>;
                        }
                        if (line.startsWith('- ')) {
                          return <p key={i} className="text-notion-text pl-[16px] my-[4px]">
                                        • {line.slice(2)}
                                      </p>;
                        }
                        if (line.startsWith('|')) {
                          return <p key={i} className="text-notion-text font-mono text-[13px] my-[4px]">
                                        {line}
                                      </p>;
                        }
                        if (line.trim() === '') {
                          return <br key={i} />;
                        }
                        return <p key={i} className="text-notion-text my-[4px]">
                                      {line.replace(/\*\*(.*?)\*\*/g, (_, text) => text)}
                                    </p>;
                      })}
                              </div>
                            </div>}
                        </motion.div>)}
                    </AnimatePresence>
                    
                    {isTyping && <motion.div initial={{
                opacity: 0
              }} animate={{
                opacity: 1
              }} className="flex items-center gap-[8px] py-[12px]">
                        <div className="flex gap-[4px]">
                          <span className="w-[6px] h-[6px] bg-notion-text-tertiary rounded-full animate-bounce" style={{
                    animationDelay: '0ms'
                  }} />
                          <span className="w-[6px] h-[6px] bg-notion-text-tertiary rounded-full animate-bounce" style={{
                    animationDelay: '150ms'
                  }} />
                          <span className="w-[6px] h-[6px] bg-notion-text-tertiary rounded-full animate-bounce" style={{
                    animationDelay: '300ms'
                  }} />
                        </div>
                        <span className="text-[14px] text-notion-text-secondary">AI is thinking...</span>
                      </motion.div>}
                    <div ref={messagesEndRef} />
                  </div>}
              </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-notion-border bg-white">
              <div className="max-w-notion-chat mx-auto px-notion-massive py-[16px]">
                <div className="relative">
                  <textarea ref={textareaRef} value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask about repositories, tickets, or team assignments..." className="notion-input w-full min-h-[42px] max-h-[120px] pr-[48px] resize-none" rows={1} />
                  <button onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping} className={`absolute right-[8px] top-1/2 -translate-y-1/2 p-[8px] rounded-[4px] transition-colors duration-150 ${inputValue.trim() && !isTyping ? 'bg-notion-blue text-white hover:bg-[#1a6fcc]' : 'bg-notion-border text-notion-text-tertiary cursor-not-allowed'}`}>
                    <Send className="w-[16px] h-[16px]" />
                  </button>
                </div>
                <p className="text-[12px] text-notion-text-tertiary mt-[8px]">
                  Press Cmd/Ctrl + Enter to send
                </p>
              </div>
            </div>
          </> : <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-[16px] text-notion-text-secondary">
                Select a conversation or start a new chat
              </p>
            </div>
          </div>}
      </div>
    </div>;
};
export default ChatAssistant;