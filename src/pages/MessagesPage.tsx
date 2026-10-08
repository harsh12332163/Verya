import React, { useState, useRef, useEffect } from 'react';
import { Send, Search, ArrowLeft, User, Users } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Card, SearchBar, Badge } from '../components/UI';

export default function MessagesPage() {
  const { user, messages, sendMessage, students, addToast } = useApp();
  const [selectedChat, setSelectedChat] = useState<string | null>(() => {
    const contact = localStorage.getItem('verya_message_contact');
    localStorage.removeItem('verya_message_contact');
    return contact;
  });
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get unique chat partners
  const chatPartners = React.useMemo(() => {
    const partnerIds = new Set<string>();
    messages.forEach(m => {
      if (m.from === user?.id) partnerIds.add(m.to);
      if (m.to === user?.id) partnerIds.add(m.from);
    });
    return Array.from(partnerIds);
  }, [messages, user]);

  // All possible contacts
  const allContacts = React.useMemo(() => {
    if (!user) return [];
    if (user.role === 'student') {
      // Students can message teachers/admins (create some demo contacts)
      return [
        { id: 'TCH001', name: 'Prof. Kumar', role: 'teacher', department: 'Computer Science' },
        { id: 'TCH002', name: 'Dr. Sharma', role: 'teacher', department: 'Mathematics' },
        { id: 'TCH003', name: 'Prof. Patel', role: 'teacher', department: 'Physics' },
        { id: 'ADM001', name: 'Admin Office', role: 'admin', department: 'Administration' },
        ...students.filter(s => s.id !== user.id).map(s => ({ id: s.id, name: s.name, role: 'student', department: s.department }))
      ];
    } else {
      // Teachers/admins can message students
      const visibleStudents = user.role === 'teacher'
        ? students.filter(student => student.courses?.some(course => user.courses?.includes(course)))
        : students;
      return visibleStudents.map(s => ({ id: s.id, name: s.name, role: 'student', department: s.department }));
    }
  }, [user, students]);

  const filteredContacts = allContacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get messages for selected chat
  const chatMessages = React.useMemo(() => {
    if (!selectedChat || !user) return [];
    return messages
      .filter(m => (m.from === user.id && m.to === selectedChat) || (m.from === selectedChat && m.to === user.id))
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [messages, selectedChat, user]);

  const selectedContact = allContacts.find(c => c.id === selectedChat);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = () => {
    if (!messageText.trim() || !selectedChat) return;
    sendMessage(selectedChat, messageText.trim());
    setMessageText('');
    addToast('Message sent!', 'success');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="animate-slide-up">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-1">Messages</h1>
        <p className="text-[var(--text-muted)]">Connect with faculty and peers</p>
      </div>

      <div className="mt-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm animate-slide-up" style={{ animationDelay: '0.1s', height: 'calc(100vh - 220px)', minHeight: '500px' }}>
        <div className="flex h-full">
          {/* Contacts Sidebar */}
          <div className={`w-full md:w-80 border-r border-[var(--border-color)] flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-[var(--border-color)]">
              <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search contacts..." />
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredContacts.map(contact => {
                const lastMsg = messages
                  .filter(m => (m.from === user?.id && m.to === contact.id) || (m.from === contact.id && m.to === user?.id))
                  .sort((a, b) => b.timestamp - a.timestamp)[0];
                const isActive = selectedChat === contact.id;
                return (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedChat(contact.id)}
                    className={`w-full flex items-center gap-3 p-4 text-left hover:bg-[var(--bg-primary)] transition-colors border-b border-[var(--border-color)] ${isActive ? 'bg-moss/5' : ''}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-forest to-moss flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {contact.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm text-[var(--text-primary)] truncate">{contact.name}</p>
                        <Badge variant={contact.role === 'teacher' ? 'info' : contact.role === 'admin' ? 'warning' : 'default'}>
                          {contact.role}
                        </Badge>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] truncate">
                        {lastMsg ? lastMsg.text : 'No messages yet'}
                      </p>
                    </div>
                    {lastMsg && (
                      <span className="text-xs text-[var(--text-muted)] flex-shrink-0">{formatTime(lastMsg.timestamp)}</span>
                    )}
                  </button>
                );
              })}
              {filteredContacts.length === 0 && (
                <div className="p-8 text-center text-[var(--text-muted)] text-sm">
                  <Users size={24} className="mx-auto mb-2 opacity-50" />
                  No contacts found
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
            {selectedChat && selectedContact ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-[var(--border-color)] flex items-center gap-3">
                  <button onClick={() => setSelectedChat(null)} className="md:hidden p-1 rounded-lg hover:bg-[var(--bg-primary)]">
                    <ArrowLeft size={18} />
                  </button>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-forest to-moss flex items-center justify-center text-white font-bold text-sm">
                    {selectedContact.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[var(--text-primary)]">{selectedContact.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{selectedContact.department}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatMessages.length === 0 && (
                    <div className="text-center py-12 text-[var(--text-muted)]">
                      <Send size={32} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Start a conversation with {selectedContact.name}</p>
                    </div>
                  )}
                  {chatMessages.map(msg => {
                    const isMe = msg.from === user?.id;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                          isMe
                            ? 'bg-forest text-white rounded-br-sm'
                            : 'bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-bl-sm'
                        }`}>
                          <p>{msg.text}</p>
                          <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-[var(--text-muted)]'}`}>{formatTime(msg.timestamp)}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-[var(--border-color)]">
                  <div className="flex gap-2">
                    <textarea
                      value={messageText}
                      onChange={e => setMessageText(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Type a message..."
                      rows={1}
                      className="flex-1 px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] resize-none focus:border-moss focus:ring-2 focus:ring-moss/20 transition-all"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!messageText.trim()}
                      className="btn-primary px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      aria-label="Send message"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Select a conversation</h3>
                  <p className="text-sm text-[var(--text-muted)]">Choose a contact from the list to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
