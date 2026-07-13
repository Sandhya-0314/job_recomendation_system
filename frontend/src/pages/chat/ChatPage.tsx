import { useEffect, useRef, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { chatService, chatHistoryService } from '@/services/chatService';
import type { ChatMessage } from '@/types';
import { MessageSquare, Send, Trash2, Bot, User, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChatPage() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const history = chatHistoryService.getHistory();
        setMessages(history);
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || sending) return;
        const userMsg: ChatMessage = { role: 'user', content: text, timestamp: new Date().toISOString() };
        setMessages((prev) => [...prev, userMsg]);
        chatHistoryService.addMessage(userMsg);
        setInput('');
        setSending(true);
        try {
            const response = await chatService.sendMessage(text);
            const assistantMsg: ChatMessage = { role: 'assistant', content: response, timestamp: new Date().toISOString() };
            setMessages((prev) => [...prev, assistantMsg]);
            chatHistoryService.addMessage(assistantMsg);
        } catch {
            toast.error('Failed to get response from AI');
            const errorMsg: ChatMessage = { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', timestamp: new Date().toISOString() };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setSending(false);
        }
    };

    const clearHistory = () => {
        chatHistoryService.clearHistory();
        setMessages([]);
        toast.success('Chat history cleared');
    };

    const suggestions = [
        'What jobs match my skills?',
        'How can I improve my profile?',
        'What are the top remote jobs available?',
        'Which skills are in high demand?',
    ];

    return (
        <DashboardLayout>
            <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 animate-slide-up">
                    <div>
                        <h1 className="section-title text-3xl flex items-center gap-2">
                            <MessageSquare className="w-7 h-7 text-primary-400" />
                            AI Career Chat
                        </h1>
                        <p className="section-subtitle">Ask your AI career assistant anything</p>
                    </div>
                    {messages.length > 0 && (
                        <button onClick={clearHistory} className="btn-secondary flex items-center gap-2 text-sm py-2">
                            <Trash2 className="w-4 h-4" /> Clear
                        </button>
                    )}
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto bg-gray-900 rounded-2xl border border-white/5 p-4 space-y-4 mb-4">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary-600/30">
                                <Sparkles className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">AI Career Assistant</h3>
                            <p className="text-gray-400 text-sm max-w-sm mb-8">Ask me about job recommendations, career advice, skill gaps, or anything related to your career journey.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                                {suggestions.map((s) => (
                                    <button key={s} onClick={() => setInput(s)}
                                        className="text-left text-sm bg-white/3 hover:bg-white/8 border border-white/5 hover:border-primary-500/30 rounded-xl px-4 py-3 text-gray-400 hover:text-white transition-all">
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in`}>
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${msg.role === 'user'
                                        ? 'bg-primary-600'
                                        : 'bg-gradient-to-br from-primary-800 to-primary-900 border border-primary-700/30'
                                    }`}>
                                    {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-primary-300" />}
                                </div>
                                <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                            ? 'bg-primary-600 text-white rounded-tr-sm'
                                            : 'bg-white/5 text-gray-200 rounded-tl-sm border border-white/5'
                                        }`}>
                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                    {msg.timestamp && (
                                        <span className="text-xs text-gray-600">
                                            {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                    {sending && (
                        <div className="flex gap-3 animate-fade-in">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-800 to-primary-900 border border-primary-700/30 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-4 h-4 text-primary-300" />
                            </div>
                            <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                        placeholder="Ask about jobs, skills, career advice..."
                        className="input-field flex-1"
                        disabled={sending}
                    />
                    <button onClick={sendMessage} disabled={!input.trim() || sending}
                        className="btn-primary px-5 flex items-center gap-2 flex-shrink-0 disabled:opacity-40">
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}
