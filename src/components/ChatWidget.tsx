import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { useAppStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';

interface ChatWidgetProps {
  sender: 'buyer' | 'admin';
  title: string;
}

export function ChatWidget({ sender, title }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const { messages, sendMessage } = useAppStore();

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      sendMessage(text, sender);
      setText('');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-16 right-0 w-[300px] sm:w-[350px] bg-white rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-brand-100 flex flex-col overflow-hidden"
            style={{ height: '400px' }}
          >
            {/* Header */}
            <div className="bg-brand-500 px-4 py-3 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-medium text-sm">{title}</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-3">
              {messages.length === 0 ? (
                <div className="m-auto text-center text-sm text-gray-400 max-w-[200px]">
                  Mulai percakapan...
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.sender === sender;
                  return (
                    <div key={msg.id} className={`flex flex-col max-w-[80%] ${isMine ? 'self-end items-end' : 'self-start items-start'}`}>
                      <div className={`px-3 py-2 rounded-2xl text-sm shadow-sm ${
                        isMine ? 'bg-brand-100 text-brand-900 rounded-br-sm' : 'bg-white border text-gray-800 rounded-bl-sm'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.timestamp}</span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t flex items-center gap-2">
              <input 
                type="text" 
                placeholder="Tulis pesan..." 
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              <button 
                type="submit"
                disabled={!text.trim()}
                className="w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center disabled:opacity-50 disabled:bg-gray-300"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-brand-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-brand-500/30 hover:bg-brand-600 transition-colors"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>
    </div>
  );
}
