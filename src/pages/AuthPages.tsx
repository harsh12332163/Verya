import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Shield, HelpCircle, ArrowLeft, GraduationCap } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Modal } from '../components/UI';

export function LoginPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { login, addToast } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { addToast('Please fill in all fields', 'warning'); return; }
    setLoading(true);
    const success = await login(email, password, role);
    setLoading(false);
    if (success) {
      addToast('Welcome back! Signed in successfully.', 'success');
      onNavigate('dashboard');
    } else {
      addToast('Invalid credentials. Try any email with password "demo123"', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-slide-up">
          <div className="text-4xl mb-3">🌿</div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Welcome Back</h1>
          <p className="text-[var(--text-muted)]">Sign in to your Verdant account</p>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 sm:p-8 shadow-xl animate-slide-up">
          {/* Role Tabs */}
          <div className="flex gap-1 p-1 bg-[var(--bg-primary)] rounded-xl mb-6">
            {['student', 'teacher', 'admin'].map(r => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  role === r ? 'bg-[var(--bg-card)] text-forest dark:text-sage shadow-sm' : 'text-[var(--text-muted)]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:border-moss focus:ring-2 focus:ring-moss/20 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:border-moss focus:ring-2 focus:ring-moss/20 transition-all"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-center disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Sign In</>}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm">
            <button onClick={() => setShowHelp(true)} className="flex items-center gap-1 text-moss hover:text-forest transition-colors">
              <HelpCircle size={14} /> Need help?
            </button>
            <button onClick={() => onNavigate('signup')} className="text-moss hover:text-forest transition-colors font-medium">
              Create account
            </button>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-moss/5 border border-moss/20">
            <p className="text-xs text-[var(--text-muted)]">
              <strong>Demo:</strong> Use any email with password <code className="bg-[var(--bg-primary)] px-1.5 py-0.5 rounded text-moss">demo123</code>
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <button onClick={() => onNavigate('home')} className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center justify-center gap-1 mx-auto">
            <ArrowLeft size={14} /> Back to home
          </button>
        </div>
      </div>

      {/* Help Modal */}
      <Modal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Need Help?" size="sm">
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[var(--bg-primary)]">
            <h4 className="font-medium text-[var(--text-primary)] mb-2">How to Sign In</h4>
            <ol className="text-sm text-[var(--text-secondary)] space-y-1 list-decimal list-inside">
              <li>Select your role (Student, Teacher, or Admin)</li>
              <li>Enter your registered email address</li>
              <li>Enter your password</li>
              <li>Click "Sign In"</li>
            </ol>
          </div>
          <div className="p-4 rounded-xl bg-moss/5 border border-moss/20">
            <h4 className="font-medium text-[var(--text-primary)] mb-2">Demo Access</h4>
            <p className="text-sm text-[var(--text-secondary)]">
              For demo purposes, use any email with the password <code className="bg-[var(--bg-card)] px-1.5 py-0.5 rounded text-moss font-mono">demo123</code>
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[var(--bg-primary)]">
            <h4 className="font-medium text-[var(--text-primary)] mb-2">Forgot Password?</h4>
            <p className="text-sm text-[var(--text-secondary)]">
              Contact your administrator to reset your password. They can manage accounts from the admin panel.
            </p>
          </div>
          <button onClick={() => setShowHelp(false)} className="w-full btn-primary text-center">Got it!</button>
        </div>
      </Modal>
    </div>
  );
}

export function SignupPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { signup, addToast } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) { addToast('Please fill in all fields', 'warning'); return; }
    if (password !== confirmPassword) { addToast('Passwords do not match', 'error'); return; }
    if (password.length < 6) { addToast('Password must be at least 6 characters', 'warning'); return; }
    setLoading(true);
    const success = await signup(name, email, password, role);
    setLoading(false);
    if (success) {
      addToast('Account created successfully! Welcome to Verdant.', 'success');
      onNavigate('dashboard');
    } else {
      addToast('An account with this email already exists.', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-slide-up">
          <div className="text-4xl mb-3">🌿</div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Create Account</h1>
          <p className="text-[var(--text-muted)]">Join the Verdant community</p>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 sm:p-8 shadow-xl animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:border-moss focus:ring-2 focus:ring-moss/20 transition-all" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@university.edu" className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:border-moss focus:ring-2 focus:ring-moss/20 transition-all" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Role</label>
              <div className="flex gap-1 p-1 bg-[var(--bg-primary)] rounded-xl">
                {['student', 'teacher', 'admin'].map(r => (
                  <button key={r} type="button" onClick={() => setRole(r)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize ${role === r ? 'bg-[var(--bg-card)] text-forest dark:text-sage shadow-sm' : 'text-[var(--text-muted)]'}`}>{r}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" className="w-full pl-10 pr-12 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:border-moss focus:ring-2 focus:ring-moss/20 transition-all" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm your password" className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:border-moss focus:ring-2 focus:ring-moss/20 transition-all" required />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-3 text-center disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-[var(--text-muted)] mt-4">
            Already have an account? <button onClick={() => onNavigate('login')} className="text-moss font-medium hover:text-forest">Sign in</button>
          </p>
        </div>
        <div className="text-center mt-6">
          <button onClick={() => onNavigate('home')} className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center justify-center gap-1 mx-auto">
            <ArrowLeft size={14} /> Back to home
          </button>
        </div>
      </div>
    </div>
  );
}

export function RequestAccessPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { addToast } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('student');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !reason) { addToast('Please fill in all fields', 'warning'); return; }
    setSubmitted(true);
    addToast('Access request submitted! We\'ll review it shortly.', 'success');
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md animate-scale-in">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Request Submitted!</h2>
          <p className="text-[var(--text-muted)] mb-6">Your access request has been received. Our admin team will review it and get back to you within 24-48 hours.</p>
          <button onClick={() => onNavigate('home')} className="btn-primary">Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-slide-up">
          <div className="text-4xl mb-3">🔑</div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Request Access</h1>
          <p className="text-[var(--text-muted)]">Apply for an account to Verdant Student Success</p>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 sm:p-8 shadow-xl animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:border-moss focus:ring-2 focus:ring-moss/20 transition-all" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@university.edu" className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:border-moss focus:ring-2 focus:ring-moss/20 transition-all" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">I am a...</label>
              <select value={role} onChange={e => setRole(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:border-moss focus:ring-2 focus:ring-moss/20 transition-all">
                <option value="student">Student</option>
                <option value="teacher">Teacher / Faculty</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Why do you need access?</label>
              <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Briefly describe your reason..." rows={3} className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:border-moss focus:ring-2 focus:ring-moss/20 transition-all resize-none" required />
            </div>
            <button type="submit" className="w-full btn-primary py-3 text-center">Submit Request</button>
          </form>
        </div>
        <div className="text-center mt-6">
          <button onClick={() => onNavigate('login')} className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center justify-center gap-1 mx-auto">
            <ArrowLeft size={14} /> Already have an account? Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
