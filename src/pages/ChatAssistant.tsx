import { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, Send, ChevronDown, Paperclip, Settings2, Trash2, Sparkles, X, FileText, Image as ImageIcon } from 'lucide-react';
import { type Conversation, type Message } from '@/data/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import { useConversations } from '@/hooks/useChatData';
import {
  createConversation,
  deleteConversation as deleteConversationService,
  streamChat,
  saveMessage,
  updateConversationTitle,
} from '@/services/chat';
import { ConversationListSkeleton } from '@/components/skeletons/PageSkeletons';
import ErrorState from '@/components/ErrorState';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

interface AttachedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

const ChatAssistant = () => {
  const { data: initialConversations, isLoading: conversationsLoading, isError: conversationsError, refetch: refetchConversations } = useConversations();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamContentRef = useRef('');

  useEffect(() => {
    if (initialConversations && conversations.length === 0) {
      setConversations(initialConversations);
      setActiveConversationId(initialConversations[0]?.id || null);
    }
  }, [initialConversations]);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };
  useEffect(() => { scrollToBottom(); }, [activeConversation?.messages]);

  const handleNewChat = async () => {
    const newConversation = await createConversation();
    setConversations([newConversation, ...conversations]);
    setActiveConversationId(newConversation.id);
    setInputValue('');
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteConversationService(id);
    setConversations(conversations.filter(c => c.id !== id));
    if (activeConversationId === id) setActiveConversationId(conversations[0]?.id || null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles: AttachedFile[] = Array.from(files).map(file => ({ id: Date.now().toString() + Math.random().toString(36).substr(2, 9), name: file.name, type: file.type, size: file.size, url: URL.createObjectURL(file) }));
    setAttachedFiles(prev => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachedFile = (id: string) => {
    setAttachedFiles(prev => { const file = prev.find(f => f.id === id); if (file) URL.revokeObjectURL(file.url); return prev.filter(f => f.id !== id); });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const upsertAssistantMessage = useCallback((convId: string, content: string) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id !== convId) return conv;
      const msgs = [...conv.messages];
      const last = msgs[msgs.length - 1];
      if (last?.role === 'assistant' && last.id.startsWith('streaming-')) {
        msgs[msgs.length - 1] = { ...last, content };
      } else {
        msgs.push({ id: 'streaming-' + Date.now(), role: 'assistant', content, timestamp: new Date().toISOString() });
      }
      return { ...conv, messages: msgs };
    }));
  }, []);

  const finalizeAssistantMessage = useCallback((convId: string) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id !== convId) return conv;
      const msgs = conv.messages.map(m =>
        m.id.startsWith('streaming-') ? { ...m, id: Date.now().toString() } : m
      );
      const lastMsg = msgs[msgs.length - 1];
      return { ...conv, messages: msgs, preview: lastMsg?.content.slice(0, 60) ?? conv.preview };
    }));
  }, []);

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && attachedFiles.length === 0) || !activeConversationId || isStreaming) return;

    const fileNames = attachedFiles.map(f => f.name);
    const messageContent = inputValue.trim() + (fileNames.length > 0 ? `\n\n📎 Attached: ${fileNames.join(', ')}` : '');
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: messageContent, timestamp: new Date().toISOString(), attachments: attachedFiles.map(f => ({ name: f.name, type: f.type, size: f.size, url: f.url })) };

    const convId = activeConversationId;

    // Determine if this is the first message (used to set the conversation title)
    const currentConv = conversations.find(c => c.id === convId);
    const isFirstMessage = (currentConv?.messages.length ?? 0) === 0;
    const newTitle = inputValue.trim() || (fileNames.length > 0 ? `Files: ${fileNames[0]}` : 'New conversation');

    setConversations(prev => prev.map(conv => {
      if (conv.id === convId) {
        return {
          ...conv,
          title: isFirstMessage ? newTitle.slice(0, 40) : conv.title,
          preview: (inputValue || fileNames.join(', ')).slice(0, 60),
          updatedAt: new Date().toISOString(),
          messages: [...conv.messages, userMessage],
        };
      }
      return conv;
    }));

    // Persist user message + (optionally) update title in Supabase — fire-and-forget
    saveMessage(convId, 'user', messageContent);
    if (isFirstMessage) updateConversationTitle(convId, newTitle.slice(0, 40));

    // Build message history for the API
    const history = [
      ...(currentConv?.messages ?? []).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user' as const, content: messageContent },
    ];

    setInputValue('');
    setAttachedFiles([]);
    setIsStreaming(true);
    streamContentRef.current = '';

    await streamChat({
      messages: history,
      onDelta: (chunk) => {
        streamContentRef.current += chunk;
        upsertAssistantMessage(convId, streamContentRef.current);
      },
      onDone: () => {
        finalizeAssistantMessage(convId);
        setIsStreaming(false);
        // Persist AI response to Supabase — fire-and-forget
        if (streamContentRef.current) {
          saveMessage(convId, 'assistant', streamContentRef.current);
        }
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  const formatDate = (timestamp: string) => new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="flex flex-col md:flex-row h-full">
      <div className="w-full md:w-[280px] border-b md:border-b-0 md:border-r border-border bg-secondary/30 flex flex-col max-h-[40vh] md:max-h-none">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 text-foreground mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-base font-semibold">Chat Assistant</span>
          </div>
          <button onClick={handleNewChat} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 rounded-full text-primary-foreground transition-colors">
            <Plus className="w-4 h-4" /><span className="text-sm font-medium">New Chat</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {conversationsError ? <ErrorState compact message="Couldn't load conversations" onRetry={() => refetchConversations()} /> : conversationsLoading ? <ConversationListSkeleton /> : (
            conversations.map(conv => (
              <div key={conv.id} onClick={() => setActiveConversationId(conv.id)} className={`group flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all mb-1 ${activeConversationId === conv.id ? 'bg-card border-l-2 border-l-primary shadow-sm' : 'hover:bg-card/50'}`}>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-foreground truncate font-medium">{conv.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{conv.preview || 'No messages yet'}</div>
                </div>
                <button onClick={e => handleDeleteConversation(conv.id, e)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-secondary rounded-lg transition-opacity">
                  <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-background">
        {activeConversation ? (
          <>
            <div className="px-8 py-5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center"><Sparkles className="w-5 h-5 text-primary-foreground" /></div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">{activeConversation.title}</h1>
                  <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">{formatDate(activeConversation.updatedAt)}<ChevronDown className="w-3 h-3" /></button>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-[800px] mx-auto px-8 py-6">
                {activeConversation.messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[400px] text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mb-5"><Sparkles className="w-8 h-8 text-primary-foreground" /></div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">How can I help you today?</h2>
                    <p className="text-base text-muted-foreground max-w-[400px]">Ask me about your repositories, Jira tickets, team assignments, or any project-related questions.</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <AnimatePresence>
                      {activeConversation.messages.map(message => (
                        <motion.div key={message.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
                          {message.role === 'user' ? (
                            <div className="flex justify-end"><div className="bg-primary text-primary-foreground rounded-2xl rounded-br-md px-5 py-3 max-w-[70%]"><p className="text-sm whitespace-pre-wrap">{message.content}</p></div></div>
                          ) : (
                            <div className="flex justify-start">
                              <div className="bg-card border border-border rounded-2xl rounded-bl-md px-5 py-4 max-w-[85%] shadow-sm">
                                <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                                  <ReactMarkdown>{message.content}</ReactMarkdown>
                                </div>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {isStreaming && activeConversation.messages[activeConversation.messages.length - 1]?.role !== 'assistant' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 py-3">
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
            <div className="px-8 py-5 border-t border-border">
              <div className="max-w-[800px] mx-auto">
                {attachedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {attachedFiles.map(file => (
                      <div key={file.id} className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2 border border-border">
                        {file.type.startsWith('image/') ? (<ImageIcon className="w-4 h-4 text-primary" />) : (<FileText className="w-4 h-4 text-muted-foreground" />)}
                        <div className="flex flex-col"><span className="text-xs text-foreground truncate max-w-[150px]">{file.name}</span><span className="text-[10px] text-muted-foreground">{formatFileSize(file.size)}</span></div>
                        <button onClick={() => removeAttachedFile(file.id)} className="p-1 hover:bg-card rounded-lg transition-colors"><X className="w-3.5 h-3.5 text-muted-foreground" /></button>
                      </div>
                    ))}
                  </div>
                )}
                <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" accept="image/*,.pdf,.doc,.docx,.txt,.md,.json,.csv" />
                <div className="flex items-center gap-3 bg-card rounded-2xl px-4 py-3 border border-border shadow-sm">
                  <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-secondary rounded-xl transition-colors"><Paperclip className="w-5 h-5 text-muted-foreground" /></button>
                  <input ref={textareaRef} type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} placeholder="Ask about repositories, tickets, or team assignments..." className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" disabled={isStreaming} />
                  <button onClick={handleSendMessage} disabled={(!inputValue.trim() && attachedFiles.length === 0) || isStreaming} className={`p-2.5 rounded-xl transition-all ${(inputValue.trim() || attachedFiles.length > 0) && !isStreaming ? 'bg-primary hover:bg-primary/90' : 'bg-secondary cursor-not-allowed'}`}>
                    <Send className={`w-4 h-4 ${(inputValue.trim() || attachedFiles.length > 0) && !isStreaming ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                  </button>
                </div>
                <div className="flex justify-end mt-2"><button className="p-1.5 hover:bg-secondary rounded-lg transition-colors"><Settings2 className="w-4 h-4 text-muted-foreground" /></button></div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center"><p className="text-base text-muted-foreground">Select a conversation or start a new chat</p></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatAssistant;
