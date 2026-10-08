import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { quotes } from '../data/quotes';

const SIX_HOURS = 6 * 60 * 60 * 1000;

function getCurrentQuote() {
  const period = Math.floor(Date.now() / SIX_HOURS);
  return quotes[period % quotes.length];
}

export default function DailyThought() {
  const [quote, setQuote] = useState(getCurrentQuote);

  useEffect(() => {
    const untilNextPeriod = SIX_HOURS - (Date.now() % SIX_HOURS);
    const timeout = window.setTimeout(() => setQuote(getCurrentQuote()), untilNextPeriod);
    return () => window.clearTimeout(timeout);
  }, [quote.id]);

  return (
    <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-6">
      <div className="flex items-center gap-2 text-moss mb-3">
        <Sparkles size={16} />
        <h2 className="text-sm font-semibold uppercase tracking-wide">Thought for the next 6 hours</h2>
      </div>
      <blockquote className="text-lg sm:text-xl font-medium leading-relaxed text-[var(--text-primary)]">
        “{quote.text}”
      </blockquote>
      <p className="mt-3 text-xs text-[var(--text-muted)] capitalize">{quote.category}</p>
    </section>
  );
}
