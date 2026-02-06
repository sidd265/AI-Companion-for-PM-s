import { useState, useRef, useEffect } from 'react';
import { Plus, Send, ChevronLeft, ChevronDown, Paperclip, Settings2, Trash2, Sparkles } from 'lucide-react';
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      return `Can you explain how the payment refund flow works in three main steps:

1. **Request Validation:** When a refund is requested, the system first validates the original transaction and checks if it's eligible for refund.

2. **Stripe Integration:** The service communicates with Stripe's Refund API to process the actual refund.

3. **Database Update:** After successful processing, the transaction status is updated in our database.

Would you like me to show you [who has worked on this feature recently?](#)`;
    }

    if (lowerQuery.includes('assign') || lowerQuery.includes('who should')) {
      return `Based on expertise and current workload, I recommend:

1. **Top Recommendation: Sarah Chen**
   - 85% expertise match (Python, AWS, Backend)
   - 60% current capacity (has bandwidth)
   - 15 commits to similar services

2. **Alternative: James Park**
   - 75% expertise match
   - 70% capacity (moderately busy)

Would you like me to [create a Jira ticket and assign it automatically?](#)`;
    }

    if (lowerQuery.includes('sprint') || lowerQuery.includes('status') || lowerQuery.includes('progress')) {
      return `**Sprint Progress Summary**

Overall: 56% complete (18/32 tickets)

1. **Done:** 18 tickets
2. **In Progress:** 6 tickets
3. **To Do:** 6 tickets
4. **Blocked:** 2 tickets

**Risks:**
- 2 tickets are blocked and need attention
- 7 tickets are unassigned

Would you like me to [show the blocked tickets?](#)`;
    }

    return `I understand you're asking about "${query}".

I can help you with:

1. **Repository analysis** - Explain code structure and recent changes
2. **Task assignment** - Suggest optimal team member assignments
3. **Sprint tracking** - Review progress and identify blockers
4. **Team insights** - Analyze capacity and expertise

Could you provide more specific details about what you'd like to know?`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSendMessage();
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderMessageContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      // Bold headers like **Text:**
      if (line.match(/^\d+\.\s+\*\*.*?\*\*/)) {
        const match = line.match(/^(\d+\.)\s+\*\*(.*?)\*\*(.*)$/);
        if (match) {
          return (
            <p key={i} className="my-[6px]">
              <span className="text-white">{match[1]} </span>
              <span className="font-semibold text-white">{match[2]}</span>
              <span className="text-gray-300">{match[3]}</span>
            </p>
          );
        }
      }
      // Links
      if (line.includes('[') && line.includes('](#)')) {
        const match = line.match(/^(.*?)\[(.*?)\]\(#\)(.*)$/);
        if (match) {
          return (
            <p key={i} className="my-[6px]">
              <span className="text-gray-300">{match[1]}</span>
              <span className="text-blue-400 underline cursor-pointer hover:text-blue-300">{match[2]}</span>
              <span className="text-gray-300">{match[3]}</span>
            </p>
          );
        }
      }
      // Regular bold text
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <p key={i} className="font-semibold text-white my-[8px]">
            {line.replace(/\*\*/g, '')}
          </p>
        );
      }
      // Bullet points
      if (line.startsWith('- ')) {
        return (
          <p key={i} className="text-gray-300 pl-[16px] my-[4px]">
            • {line.slice(2).replace(/\*\*(.*?)\*\*/g, '$1')}
          </p>
        );
      }
      // Empty lines
      if (line.trim() === '') {
        return <br key={i} />;
      }
      // Regular text with inline bold
      const processedLine = line.replace(/\*\*(.*?)\*\*/g, '$1');
      return (
        <p key={i} className="text-gray-300 my-[4px]">
          {processedLine}
        </p>
      );
    });
  };

  return (
    <div className="flex h-full">
      {/* Chat Sidebar */}
      <div className="w-[240px] border-r border-notion-border bg-[#1a1a2e] flex flex-col">
        {/* Header */}
        <div className="p-[16px] border-b border-white/10">
          <div className="flex items-center gap-[8px] text-white mb-[16px]">
            <ChevronLeft className="w-[18px] h-[18px] text-gray-400" />
            <span className="text-[15px] font-medium">Chat Assistant</span>
            <ChevronDown className="w-[14px] h-[14px] text-gray-400 ml-auto" />
          </div>
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-[8px] px-[12px] py-[10px] bg-[#2a2a4a] hover:bg-[#3a3a5a] rounded-[6px] text-white transition-colors"
          >
            <Plus className="w-[16px] h-[16px]" />
            <span className="text-[14px]">New Chat</span>
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-[8px]">
          {conversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => setActiveConversationId(conv.id)}
              className={`group flex items-center justify-between px-[12px] py-[10px] rounded-[6px] cursor-pointer transition-colors mb-[4px] ${
                activeConversationId === conv.id
                  ? 'bg-[#2a2a4a]'
                  : 'hover:bg-[#2a2a4a]/50'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="text-[14px] text-white truncate">
                  {conv.title}
                </div>
                <div className="text-[12px] text-gray-400 truncate">
                  {conv.preview || 'No messages yet'}
                </div>
              </div>
              <button
                onClick={e => handleDeleteConversation(conv.id, e)}
                className="opacity-0 group-hover:opacity-100 p-[4px] hover:bg-white/10 rounded-[4px] transition-opacity"
              >
                <Trash2 className="w-[14px] h-[14px] text-gray-400" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-[#0f0f1a]">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="px-[32px] py-[20px] border-b border-white/10">
              <div className="flex items-center gap-[12px]">
                <div className="w-[40px] h-[40px] bg-gradient-to-br from-blue-500 to-purple-600 rounded-[8px] flex items-center justify-center">
                  <Sparkles className="w-[20px] h-[20px] text-white" />
                </div>
                <div>
                  <h1 className="text-[18px] font-semibold text-white">
                    {activeConversation.title}
                  </h1>
                  <button className="flex items-center gap-[4px] text-[13px] text-gray-400 hover:text-gray-300">
                    {formatDate(activeConversation.updatedAt)}
                    <ChevronDown className="w-[12px] h-[12px]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-[800px] mx-auto px-[32px] py-[24px]">
                {activeConversation.messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[400px] text-center">
                    <div className="w-[56px] h-[56px] bg-gradient-to-br from-blue-500 to-purple-600 rounded-[12px] flex items-center justify-center mb-[20px]">
                      <Sparkles className="w-[28px] h-[28px] text-white" />
                    </div>
                    <h2 className="text-[24px] font-semibold text-white mb-[8px]">
                      How can I help you today?
                    </h2>
                    <p className="text-[15px] text-gray-400 max-w-[400px]">
                      Ask me about your repositories, Jira tickets, team assignments, or any project-related questions.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-[20px]">
                    <AnimatePresence>
                      {activeConversation.messages.map(message => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          {message.role === 'user' ? (
                            <div className="text-[15px] text-gray-300 py-[8px]">
                              {message.content}
                            </div>
                          ) : (
                            <div className="bg-[#1a1a2e] rounded-[12px] p-[20px] border border-white/5">
                              {/* Card Header */}
                              <div className="text-[16px] font-semibold text-white mb-[12px] pb-[12px] border-b border-white/10">
                                {activeConversation.title}
                              </div>
                              {/* Card Content */}
                              <div className="text-[14px] leading-[1.7]">
                                {renderMessageContent(message.content)}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-[8px] py-[12px]"
                      >
                        <div className="flex gap-[4px]">
                          <span className="w-[6px] h-[6px] bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-[6px] h-[6px] bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-[6px] h-[6px] bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-[14px] text-gray-400">AI is thinking...</span>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </div>

            {/* Input Area */}
            <div className="px-[32px] py-[20px] border-t border-white/10">
              <div className="max-w-[800px] mx-auto">
                <div className="flex items-center gap-[12px] bg-[#1a1a2e] rounded-[12px] px-[16px] py-[12px] border border-white/10">
                  <button className="p-[6px] hover:bg-white/10 rounded-[6px] transition-colors">
                    <Paperclip className="w-[18px] h-[18px] text-gray-400" />
                  </button>
                  <input
                    ref={textareaRef as any}
                    type="text"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Ask about repositories, tickets, or team assignments..."
                    className="flex-1 bg-transparent text-[14px] text-white placeholder:text-gray-500 outline-none"
                  />
                  <button className="p-[6px] hover:bg-white/10 rounded-[6px] transition-colors">
                    <Send className="w-[18px] h-[18px] text-gray-400" />
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isTyping}
                    className={`p-[10px] rounded-[8px] transition-colors ${
                      inputValue.trim() && !isTyping
                        ? 'bg-blue-600 hover:bg-blue-500'
                        : 'bg-gray-700 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-[16px] h-[16px] text-white" />
                  </button>
                </div>
                <div className="flex justify-end mt-[8px]">
                  <button className="p-[4px] hover:bg-white/10 rounded-[4px] transition-colors">
                    <Settings2 className="w-[16px] h-[16px] text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-[16px] text-gray-400">
                Select a conversation or start a new chat
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatAssistant;
