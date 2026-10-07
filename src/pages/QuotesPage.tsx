import React, { useState, useMemo } from 'react';
import { Sparkles, Heart, RefreshCw, Copy, Check, BookOpen, Star, Target, Brain } from 'lucide-react';
import { quotes, getRandomQuote, Quote } from '../data/quotes';
import { Card, SearchBar, Badge, Tabs } from '../components/UI';
import { useApp } from '../contexts/AppContext';

export default function QuotesPage() {
  const { addToast } = useApp();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [currentDaily, setCurrentDaily] = useState<Quote>(getRandomQuote());

  const categories = [
    { id: 'all', label: 'All', icon: <BookOpen size={14} />, count: quotes.length },
    { id: 'student', label: 'Students', icon: <Star size={14} />, count: quotes.filter(q => q.category === 'student').length },
    { id: 'teacher', label: 'Teachers', icon: <Target size={14} />, count: quotes.filter(q => q.category === 'teacher').length },
    { id: 'success', label: 'Success', icon: <Sparkles size={14} />, count: quotes.filter(q => q.category === 'success').length },
    { id: 'perseverance', label: 'Perseverance', icon: <Target size={14} />, count: quotes.filter(q => q.category === 'perseverance').length },
    { id: 'wisdom', label: 'Wisdom', icon: <Brain size={14} />, count: quotes.filter(q => q.category === 'wisdom').length },
    { id: 'general', label: 'General', icon: <Heart size={14} />, count: quotes.filter(q => q.category === 'general').length },
  ];

  const filteredQuotes = useMemo(() => {
    let filtered = quotes;
    if (activeTab !== 'all') filtered = filtered.filter(q => q.category === activeTab);
    if (searchQuery) filtered = filtered.filter(q => q.text.toLowerCase().includes(searchQuery.toLowerCase()));
    return filtered;
  }, [activeTab, searchQuery]);

  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      addToast('Quote copied to clipboard!', 'success');
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {
      addToast('Could not copy. Try selecting the text manually.', 'error');
    });
  };

  const refreshDaily = () => {
    setCurrentDaily(getRandomQuote());
    addToast('New quote loaded!', 'info');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="animate-slide-up">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Daily Inspiration</h1>
        <p className="text-[var(--text-muted)] mt-1">{quotes.length}+ motivational quotes for students, teachers, and everyone</p>
      </div>

      {/* Daily Quote Card */}
      <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-forest via-pine to-moss text-white overflow-hidden">
          <div className="absolute top-4 left-4 text-7xl opacity-10 font-serif">"</div>
          <div className="absolute bottom-4 right-4 text-7xl opacity-10 font-serif rotate-180">"</div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-sage" />
              <span className="text-xs font-medium text-sage uppercase tracking-wider">Quote of the Moment</span>
            </div>
            <p className="text-xl sm:text-2xl font-medium leading-relaxed mb-4">{currentDaily.text}</p>
            <div className="flex items-center justify-between">
              <Badge variant="default">
                <span className="capitalize">{currentDaily.category}</span>
              </Badge>
              <div className="flex gap-2">
                <button onClick={() => handleCopy(currentDaily.text, currentDaily.id)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors" aria-label="Copy quote">
                  {copiedId === currentDaily.id ? <Check size={16} /> : <Copy size={16} />}
                </button>
                <button onClick={refreshDaily} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors" aria-label="New quote">
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex-1">
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search quotes..." />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="animate-slide-up" style={{ animationDelay: '0.25s' }}>
        <div className="flex gap-1 p-1 bg-[var(--bg-primary)] rounded-xl overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === cat.id
                  ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
              <span className="text-[10px] opacity-60">({cat.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quotes Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
        {filteredQuotes.slice(0, 60).map((quote, i) => (
          <Card key={quote.id} hover className="relative group">
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleCopy(quote.text, quote.id)}
                className="p-1.5 rounded-lg bg-[var(--bg-primary)] hover:bg-moss/10 transition-colors"
                aria-label="Copy quote"
              >
                {copiedId === quote.id ? <Check size={12} className="text-moss" /> : <Copy size={12} />}
              </button>
            </div>
            <div className="text-2xl opacity-10 absolute top-2 left-3 font-serif">"</div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-4 pr-8">{quote.text}</p>
            <div className="mt-3 pt-3 border-t border-[var(--border-color)]">
              <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-medium">{quote.category}</span>
            </div>
          </Card>
        ))}
      </div>

      {filteredQuotes.length > 60 && (
        <div className="text-center py-4">
          <p className="text-sm text-[var(--text-muted)]">Showing 60 of {filteredQuotes.length} quotes. Use search to find specific ones.</p>
        </div>
      )}

      {filteredQuotes.length === 0 && (
        <div className="text-center py-12 text-[var(--text-muted)]">
          <BookOpen size={40} className="mx-auto mb-3 opacity-50" />
          <p>No quotes found matching your search.</p>
        </div>
      )}
    </div>
  );
}
