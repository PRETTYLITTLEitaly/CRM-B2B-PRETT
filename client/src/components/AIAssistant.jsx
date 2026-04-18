import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Bot, User, Loader2 } from 'lucide-react';

const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Ciao! Sono il tuo assistente PrettyB2B. Come posso aiutarti oggi?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    message: input,
                    history: messages 
                })
            });

            const data = await response.json();
            if (data.success) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: 'Ops, qualcosa è andato storto. Riprova più tardi.' }]);
            }
        } catch (error) {
            console.error('AI Chat Error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Errore di connessione con l\'assistente.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4 w-[400px] h-[600px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden backdrop-blur-xl bg-white/90"
                    >
                        {/* Header */}
                        <div className="p-6 bg-indigo-600 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-widest">AI Assistant</h3>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                        <span className="text-[10px] font-bold uppercase opacity-80">Online</span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/50">
                            {messages.map((msg, filterIndex) => (
                                <div key={filterIndex} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                            msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-100 text-indigo-600 shadow-sm'
                                        }`}>
                                            {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                        </div>
                                        <div className={`p-4 rounded-2xl text-[13px] leading-relaxed ${
                                            msg.role === 'user' 
                                            ? 'bg-indigo-600 text-white rounded-tr-none font-medium' 
                                            : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm'
                                        }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 text-indigo-600 flex items-center justify-center shadow-sm">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        </div>
                                        <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm">
                                            <div className="flex gap-1">
                                                <div className="w-1.5 h-1.5 bg-indigo-200 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                                <div className="w-1.5 h-1.5 bg-indigo-200 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                <div className="w-1.5 h-1.5 bg-indigo-200 rounded-full animate-bounce" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100">
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Chiedimi qualcosa..."
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-6 pr-14 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-600/5 transition-all text-slate-700"
                                />
                                <button 
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="absolute right-2 p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:scale-95 active:scale-90"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
                    isOpen ? 'bg-white text-indigo-600 rotate-90' : 'bg-indigo-600 text-white'
                }`}
            >
                {isOpen ? <X className="w-8 h-8" /> : <MessageSquare className="w-8 h-8" />}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 border-2 border-white rounded-full' animated-pulse" />
                )}
            </motion.button>
        </div>
    );
};

export default AIAssistant;
