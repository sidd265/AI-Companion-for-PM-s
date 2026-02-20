import { useState, useRef, useEffect } from 'react';
import { Plus, Send, ChevronDown, Paperclip, Settings2, Trash2, Sparkles, X, FileText, Image as ImageIcon } from 'lucide-react';
import { conversations as initialConversations, Conversation, Message } from '@/data/mockData';
import { motion, AnimatePresence } from 'framer-motion';

interface AttachedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

const ChatAssistant = () => {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(initialConversations[0]?.id || null);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: AttachedFile[] = Array.from(files).map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file)
    }));

    setAttachedFiles(prev => [...prev, ...newFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachedFile = (id: string) => {
    setAttachedFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file) URL.revokeObjectURL(file.url);
      return prev.filter(f => f.id !== id);
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && attachedFiles.length === 0) || !activeConversationId) return;

    const fileNames = attachedFiles.map(f => f.name);
    const messageContent = inputValue.trim() + (fileNames.length > 0 ? `\n\n📎 Attached: ${fileNames.join(', ')}` : '');

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date().toISOString(),
      attachments: attachedFiles.map(f => ({ name: f.name, type: f.type, size: f.size, url: f.url }))
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === activeConversationId) {
        const isFirstMessage = conv.messages.length === 0;
        const title = inputValue.trim() || (fileNames.length > 0 ? `Files: ${fileNames[0]}` : 'New conversation');
        return {
          ...conv,
          title: isFirstMessage ? title.slice(0, 40) : conv.title,
          preview: (inputValue || fileNames.join(', ')).slice(0, 60),
          updatedAt: new Date().toISOString(),
          messages: [...conv.messages, userMessage]
        };
      }
      return conv;
    }));

    setInputValue('');
    setAttachedFiles([]);
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
      return `The payment refund flow works in three main steps:

1. **Request Validation:** When a refund is requested, the system first validates the original transaction and checks if it's eligible for refund.

2. **Stripe Integration:** The service communicates with Stripe's Refund API to process the actual refund.

3. **Database Update:** After successful processing, the transaction status is updated in our database.

Would you like me to show you who has worked on this feature recently?`;
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

Would you like me to create a Jira ticket and assign it automatically?`;
    }

    if (lowerQuery.includes('sprint') || lowerQuery.includes('status') || lowerQuery.includes('progress')) {
      return `**Sprint Progress Summary**

Overall: 56% complete (18/32 tickets)

- **Done:** 18 tickets
- **In Progress:** 6 tickets
- **To Do:** 6 tickets
- **Blocked:** 2 tickets

**Risks:**
- 2 tickets are blocked and need attention
- 7 tickets are unassigned

Would you like me to show the blocked tickets?`;
    }

    return `I understand you're asking about "${query}".

I can help you with:

1. **Repository analysis** - Explain code structure and recent changes
2. **Task assignment** - Suggest optimal team member assignments
3. **Sprint tracking** - Review progress and identify blockers
4. **Team insights** - Analyze capacity and expertise

Could you provide more specific details about what you'd like to know?`;
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
            <p key={i} className="my-1.5">
              <span className="text-foreground">{match[1]} </span>
              <span className="font-semibold text-foreground">{match[2]}</span>
              <span className="text-muted-foreground">{match[3]}</span>
            </p>
          );
        }
      }
      // Regular bold text
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <p key={i} className="font-semibold text-foreground my-2">
            {line.replace(/\*\*/g, '')}
          </p>
        );
      }
      // Bullet points
      if (line.startsWith('- ')) {
        return (
          <p key={i} className="text-muted-foreground pl-4 my-1">
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
        <p key={i} className="text-muted-foreground my-1">
          {processedLine}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* Chat Sidebar */}
      <div className="w-full md:w-[280px] border-b md:border-b-0 md:border-r border-border bg-secondary/30 flex flex-col max-h-[40vh] md:max-h-none">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 text-foreground mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-base font-semibold">Chat Assistant</span>
          </div>
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 rounded-full text-primary-foreground transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">New Chat</span>
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2">
          {conversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => setActiveConversationId(conv.id)}
              className={`group flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all mb-1 ${
                activeConversationId === conv.id
                  ? 'bg-card border-l-2 border-l-primary shadow-sm'
                  : 'hover:bg-card/50'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm text-foreground truncate font-medium">
                  {conv.title}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {conv.preview || 'No messages yet'}
                </div>
              </div>
              <button
                onClick={e => handleDeleteConversation(conv.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-secondary rounded-lg transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-background">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="px-8 py-5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">
                    {activeConversation.title}
                  </h1>
                  <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {formatDate(activeConversation.updatedAt)}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-[800px] mx-auto px-8 py-6">
                {activeConversation.messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[400px] text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mb-5">
                      <Sparkles className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      How can I help you today?
                    </h2>
                    <p className="text-base text-muted-foreground max-w-[400px]">
                      Ask me about your repositories, Jira tickets, team assignments, or any project-related questions.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <AnimatePresence>
                      {activeConversation.messages.map(message => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          {message.role === 'user' ? (
                            <div className="flex justify-end">
                              <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-md px-5 py-3 max-w-[70%]">
                                <p className="text-sm">{message.content}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-start">
                              <div className="bg-card border border-border rounded-2xl rounded-bl-md px-5 py-4 max-w-[85%] shadow-sm">
                                <div className="text-sm leading-relaxed">
                                  {renderMessageContent(message.content)}
                                </div>
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
                        className="flex items-center gap-2 py-3"
                      >
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-sm text-muted-foreground">AI is thinking...</span>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </div>

            {/* Input Area */}
            <div className="px-8 py-5 border-t border-border">
              <div className="max-w-[800px] mx-auto">
                {/* Attached Files Preview */}
                {attachedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {attachedFiles.map(file => (
                      <div
                        key={file.id}
                        className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2 border border-border"
                      >
                        {file.type.startsWith('image/') ? (
                          <ImageIcon className="w-4 h-4 text-primary" />
                        ) : (
                          <FileText className="w-4 h-4 text-muted-foreground" />
                        )}
                        <div className="flex flex-col">
                          <span className="text-xs text-foreground truncate max-w-[150px]">{file.name}</span>
                          <span className="text-[10px] text-muted-foreground">{formatFileSize(file.size)}</span>
                        </div>
                        <button
                          onClick={() => removeAttachedFile(file.id)}
                          className="p-1 hover:bg-card rounded-lg transition-colors"
                        >
                          <X className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt,.md,.json,.csv"
                />
                
                <div className="flex items-center gap-3 bg-card rounded-2xl px-4 py-3 border border-border shadow-sm">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 hover:bg-secondary rounded-xl transition-colors"
                  >
                    <Paperclip className="w-5 h-5 text-muted-foreground" />
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
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={(!inputValue.trim() && attachedFiles.length === 0) || isTyping}
                    className={`p-2.5 rounded-xl transition-all ${
                      (inputValue.trim() || attachedFiles.length > 0) && !isTyping
                        ? 'bg-primary hover:bg-primary/90'
                        : 'bg-secondary cursor-not-allowed'
                    }`}
                  >
                    <Send className={`w-4 h-4 ${(inputValue.trim() || attachedFiles.length > 0) && !isTyping ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                  </button>
                </div>
                <div className="flex justify-end mt-2">
                  <button className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
                    <Settings2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-base text-muted-foreground">
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
