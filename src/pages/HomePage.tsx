import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Sparkles, Users, MessageSquare, BookOpen, Shield, BarChart3, Bell, ChevronRight, Play, Star, Zap, Target, GraduationCap } from 'lucide-react';
import { getRandomQuote } from '../data/quotes';

export default function HomePage({ onNavigate, isAuthenticated }: { onNavigate: (page: string) => void; isAuthenticated: boolean }) {
  const [scrollY, setScrollY] = useState(0);
  const [featureDetail, setFeatureDetail] = useState<string | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { id: 'scores', icon: <BarChart3 size={24} />, title: 'Academic Scores', desc: 'Track subject marks, assignments, labs, and overall performance in real-time.', detail: 'View detailed breakdowns of every subject, track assignment submissions, monitor lab performance, and see your academic trend over semesters. Teachers can update scores and students get instant notifications.' },
    { id: 'messages', icon: <MessageSquare size={24} />, title: 'Direct Messaging', desc: 'Connect with faculty and peers through secure messaging.', detail: 'Send messages to your teachers, receive guidance, ask questions about assignments, and collaborate with classmates. All messages are stored securely and organized by conversation.' },
    { id: 'quotes', icon: <BookOpen size={24} />, title: 'Daily Inspiration', desc: '500+ motivational quotes for students and teachers.', detail: 'Get inspired every day with curated motivational quotes categorized for students, teachers, and everyone. From perseverance to wisdom, find the perfect words to fuel your journey.' },
    { id: 'insights', icon: <Target size={24} />, title: 'Smart Insights', desc: 'AI-powered analytics and risk signals for student success.', detail: 'Our intelligent system analyzes attendance, scores, and engagement to identify students who may need support. Get actionable insights and recommended interventions.' },
    { id: 'notifications', icon: <Bell size={24} />, title: 'Smart Notifications', desc: 'Stay updated with real-time alerts and reminders.', detail: 'Never miss a deadline, assignment, or important announcement. Customizable notifications keep you informed about grades, messages, attendance, and upcoming events.' },
    { id: 'security', icon: <Shield size={24} />, title: 'Role-Based Security', desc: 'Admin, teacher, and student access controls.', detail: 'Each role has appropriate access levels. Admins manage the system, teachers update scores and communicate with students, and students view their own data and edit personal details.' },
  ];

  const stats = [
    { value: '500+', label: 'Motivational Quotes', icon: <Sparkles size={20} /> },
    { value: '100%', label: 'Responsive Design', icon: <Zap size={20} /> },
    { value: 'Real-time', label: 'Data Updates', icon: <BarChart3 size={20} /> },
    { value: 'Secure', label: 'Role-Based Access', icon: <Shield size={20} /> },
  ];

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section with Bubbles */}
      <section ref={heroRef} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Animated Bubbles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="bubble"
              style={{
                width: `${60 + Math.random() * 120}px`,
                height: `${60 + Math.random() * 120}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${6 + Math.random() * 6}s`,
                transform: `translateY(${scrollY * (0.1 + i * 0.02)}px)`,
                opacity: 0.3 + Math.random() * 0.3,
              }}
            />
          ))}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-forest/5 via-transparent to-mist dark:from-forest/20 dark:to-[var(--bg-primary)]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-moss/10 text-moss text-sm font-medium mb-6">
              <Sparkles size={14} /> Empowering Student Success
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-tight mb-6">
              <span className="gradient-text">Turn Campus</span>
              <br />
              <span className="text-[var(--text-primary)]">Into a Garden of</span>
              <br />
              <span className="bg-gradient-to-r from-moss via-forest to-pine bg-clip-text text-transparent animate-pulse-soft">Growth & Achievement</span>
            </h1>
            <p className="text-lg sm:text-xl text-[var(--text-muted)] max-w-2xl mx-auto mb-8 leading-relaxed">
              A comprehensive platform for tracking academic progress, fostering communication, and inspiring excellence across your institution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <button onClick={() => onNavigate('login')} className="btn-primary text-base px-8 py-3 flex items-center justify-center gap-2">
                    Get Started <ArrowRight size={18} />
                  </button>
                  <button onClick={() => onNavigate('request-access')} className="btn-secondary text-base px-8 py-3">
                    Request Access
                  </button>
                </>
              ) : (
                <button onClick={() => onNavigate('dashboard')} className="btn-primary text-base px-8 py-3 flex items-center justify-center gap-2">
                  Go to Dashboard <ArrowRight size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-[var(--text-muted)] rounded-full flex justify-center">
              <div className="w-1.5 h-3 bg-[var(--text-muted)] rounded-full mt-2 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="text-center p-6 rounded-2xl glass-card animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="inline-flex p-3 rounded-xl bg-moss/10 text-moss mb-3">{stat.icon}</div>
              <p className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">{stat.value}</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4">Everything You Need</h2>
            <p className="text-[var(--text-muted)] max-w-xl mx-auto">Powerful features designed to enhance the academic experience for students, teachers, and administrators.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={feature.id}
                className="group p-6 rounded-2xl glass-card card-hover cursor-pointer animate-slide-up"
                style={{ animationDelay: `${i * 0.1}s` }}
                onClick={() => setFeatureDetail(feature.id)}
              >
                <div className="p-3 rounded-xl bg-gradient-to-br from-forest/10 to-moss/10 text-forest dark:text-sage w-fit mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{feature.desc}</p>
                <div className="flex items-center gap-1 mt-3 text-moss text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Click for details <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-forest to-pine text-white relative overflow-hidden">
            <div className="absolute top-4 left-4 text-6xl opacity-20">"</div>
            <p className="text-xl sm:text-2xl font-medium leading-relaxed mb-4 relative z-10">
              {getRandomQuote().text}
            </p>
            <p className="text-sage text-sm">— Daily Inspiration</p>
            <button onClick={() => onNavigate('quotes')} className="mt-6 px-6 py-2 bg-white/20 rounded-full text-sm font-medium hover:bg-white/30 transition-colors">
              View All Quotes →
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4">Ready to Transform Your Campus?</h2>
          <p className="text-[var(--text-muted)] mb-8 max-w-xl mx-auto">Join thousands of students and educators who are already using Verdant to achieve academic excellence.</p>
          {!isAuthenticated && (
            <button onClick={() => onNavigate('login')} className="btn-primary text-lg px-10 py-4">
              Start Your Journey
            </button>
          )}
        </div>
      </section>

      {/* Feature Detail Modal */}
      {featureDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setFeatureDetail(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-[var(--bg-card)] rounded-2xl p-8 max-w-md w-full shadow-2xl animate-scale-in border border-[var(--border-color)]" onClick={e => e.stopPropagation()}>
            {(() => {
              const f = features.find(feat => feat.id === featureDetail);
              if (!f) return null;
              return (
                <>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-forest/10 to-moss/10 text-forest dark:text-sage w-fit mb-4">{f.icon}</div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">{f.title}</h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">{f.detail}</p>
                  <button onClick={() => setFeatureDetail(null)} className="mt-6 btn-primary w-full text-center">Got it!</button>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
