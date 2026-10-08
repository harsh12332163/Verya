import React, { useState } from 'react';
import { Camera, Edit3, Save, X, Mail, Phone, BookOpen, Calendar, Award, MapPin } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Card, Badge, Tabs, Modal } from '../components/UI';
import AcademicsPage from './AcademicsPage';
import { calculateCgpa, calculateSgpa, getAccessibleScore } from '../utils/academicMetrics';

export default function ProfilePage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { user, updateUser, addToast, studentScores } = useApp();
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    department: user?.department || '',
  });
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const [emailNotifications, setEmailNotifications] = useState(
    () => localStorage.getItem(`verya_email_notifications_${user?.id}`) !== 'false'
  );
  const [pushNotifications, setPushNotifications] = useState(
    () => localStorage.getItem(`verya_push_notifications_${user?.id}`) !== 'false'
  );

  if (!user) return null;

  const storedScore = studentScores[user.id];
  const myScore = storedScore ? getAccessibleScore(user, storedScore) : undefined;

  const handleSave = () => {
    updateUser(editData);
    setEditing(false);
    addToast('Profile updated successfully!', 'success');
  };

  const handleCancel = () => {
    setEditData({ name: user.name || '', phone: user.phone || '', bio: user.bio || '', department: user.department || '' });
    setEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Profile Header */}
      <Card className="overflow-hidden p-0 animate-slide-up">
        <div className="h-32 sm:h-40 bg-gradient-to-r from-forest via-pine to-moss relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
        </div>
        <div className="px-4 sm:px-6 pb-6 relative">
          <div className="flex items-end justify-between gap-4 -mt-12 sm:-mt-16">
            <div className="relative group flex-shrink-0">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-forest to-moss flex items-center justify-center text-white font-bold text-3xl sm:text-4xl border-4 border-[var(--bg-card)] shadow-lg">
                {user.name.charAt(0)}
              </div>
              <button
                onClick={() => setShowPhotoModal(true)}
                className="absolute bottom-1 right-1 flex items-center justify-center rounded-full bg-forest text-white p-2 shadow-md hover:bg-pine transition-colors"
                aria-label="Change photo"
              >
                <Camera size={16} />
              </button>
            </div>
            <div className="flex flex-wrap justify-end gap-2 pb-1">
              {editing ? (
                <>
                  <button onClick={handleSave} className="btn-primary text-sm flex items-center gap-1"><Save size={14} /> Save</button>
                  <button onClick={handleCancel} className="btn-secondary text-sm flex items-center gap-1"><X size={14} /> Cancel</button>
                </>
              ) : (
                <button onClick={() => setEditing(true)} className="btn-secondary text-sm flex items-center gap-1"><Edit3 size={14} /> Edit Profile</button>
              )}
            </div>
          </div>
          <div className="mt-4 min-w-0">
            {editing ? (
              <input
                type="text"
                value={editData.name}
                onChange={e => setEditData({ ...editData, name: e.target.value })}
                className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] bg-transparent border-b-2 border-moss focus:outline-none w-full max-w-full"
              />
            ) : (
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] break-words">{user.name}</h1>
            )}
            <p className="text-sm font-medium text-[var(--text-secondary)] mt-1 break-all">@{user.email.split('@')[0]}</p>
            <p className="text-[var(--text-muted)] text-sm mt-0.5 break-all">{user.email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge variant={user.role === 'admin' ? 'error' : user.role === 'teacher' ? 'info' : 'success'}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
              {user.department && <span className="text-xs text-[var(--text-muted)]">{user.department}</span>}
              {user.studentId && <span className="text-xs text-[var(--text-muted)]">ID: {user.studentId}</span>}
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'about', label: 'About' },
          { id: 'academic', label: 'Academic' },
          { id: 'settings', label: 'Settings' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab Content */}
      {activeTab === 'about' && (
        <div className="grid sm:grid-cols-2 gap-4 animate-slide-up">
          <Card>
            <h3 className="font-bold text-[var(--text-primary)] mb-4">Personal Details</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-[var(--text-muted)]" />
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Email</p>
                  <p className="text-sm text-[var(--text-primary)]">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-[var(--text-muted)]" />
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Phone</p>
                  {editing ? (
                    <input type="tel" value={editData.phone} onChange={e => setEditData({ ...editData, phone: e.target.value })} className="text-sm text-[var(--text-primary)] bg-transparent border-b border-moss focus:outline-none" />
                  ) : (
                    <p className="text-sm text-[var(--text-primary)]">{user.phone || 'Not set'}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-[var(--text-muted)]" />
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Department</p>
                  {editing ? (
                    <input type="text" value={editData.department} onChange={e => setEditData({ ...editData, department: e.target.value })} className="text-sm text-[var(--text-primary)] bg-transparent border-b border-moss focus:outline-none" />
                  ) : (
                    <p className="text-sm text-[var(--text-primary)]">{user.department || 'Not set'}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-[var(--text-muted)]" />
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Joined</p>
                  <p className="text-sm text-[var(--text-primary)]">{user.joinDate || 'Recently'}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-bold text-[var(--text-primary)] mb-4">Bio</h3>
            {editing ? (
              <textarea
                value={editData.bio}
                onChange={e => setEditData({ ...editData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={4}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm resize-none focus:border-moss focus:ring-2 focus:ring-moss/20"
              />
            ) : (
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {user.bio || 'No bio yet. Click "Edit Profile" to add one.'}
              </p>
            )}
            {user.role === 'student' && (
              <div className="mt-6 p-4 rounded-xl bg-[var(--bg-primary)]">
                <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">Quick Stats</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 rounded-lg bg-[var(--bg-card)]">
                    <p className="text-lg font-bold text-forest">{myScore ? calculateCgpa(user, myScore).toFixed(2) : 'N/A'}</p>
                    <p className="text-xs text-[var(--text-muted)]">CGPA</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-[var(--bg-card)]">
                    <p className="text-lg font-bold text-forest">{myScore ? calculateSgpa(myScore).toFixed(2) : 'N/A'}</p>
                    <p className="text-xs text-[var(--text-muted)]">SGPA</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-[var(--bg-card)]">
                    <p className="text-lg font-bold text-forest">{user.semester || 'N/A'}</p>
                    <p className="text-xs text-[var(--text-muted)]">Semester</p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'academic' && <AcademicsPage onNavigate={onNavigate} />}

      {activeTab === 'settings' && (
        <div className="space-y-4 animate-slide-up">
          <Card>
            <h3 className="font-bold text-[var(--text-primary)] mb-4">Account Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-primary)]">
                <div>
                  <p className="font-medium text-sm text-[var(--text-primary)]">Email Notifications</p>
                  <p className="text-xs text-[var(--text-muted)]">Receive email updates about your account</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={event => {
                      setEmailNotifications(event.target.checked);
                      localStorage.setItem(`verya_email_notifications_${user.id}`, String(event.target.checked));
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-moss/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-moss"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-primary)]">
                <div>
                  <p className="font-medium text-sm text-[var(--text-primary)]">Push Notifications</p>
                  <p className="text-xs text-[var(--text-muted)]">Get notified about messages and updates</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pushNotifications}
                    onChange={event => {
                      setPushNotifications(event.target.checked);
                      localStorage.setItem(`verya_push_notifications_${user.id}`, String(event.target.checked));
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-moss/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-moss"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-primary)]">
                <div>
                  <p className="font-medium text-sm text-[var(--text-primary)]">Request Profile Photo Change</p>
                  <p className="text-xs text-[var(--text-muted)]">Submit a request to admin to update your photo</p>
                </div>
                <button onClick={() => setShowPhotoModal(true)} className="btn-secondary text-xs py-1.5 px-3">Request</button>
              </div>
            </div>
          </Card>
          <Card>
            <h3 className="font-bold text-[var(--text-primary)] mb-4">Security</h3>
            <div className="space-y-3">
              <div className="w-full flex items-center justify-between p-4 rounded-xl bg-[var(--bg-primary)]">
                <span className="text-sm font-medium text-[var(--text-primary)]">Change Password</span>
                <span className="text-xs text-[var(--text-muted)]">Managed by your administrator</span>
              </div>
              <div className="w-full flex items-center justify-between p-4 rounded-xl bg-[var(--bg-primary)]">
                <span className="text-sm font-medium text-[var(--text-primary)]">Two-Factor Authentication</span>
                <Badge>Not configured</Badge>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Photo Change Modal */}
      <Modal isOpen={showPhotoModal} onClose={() => setShowPhotoModal(false)} title="Change Profile Photo" size="sm">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-forest to-moss flex items-center justify-center text-white font-bold text-3xl">
            {user.name.charAt(0)}
          </div>
          <p className="text-sm text-[var(--text-muted)]">Profile photo changes require admin approval.</p>
          <div className="flex gap-3">
            <button onClick={() => { setShowPhotoModal(false); addToast('Photo change request submitted for approval!', 'success'); }} className="btn-primary flex-1 text-sm">Request Change</button>
            <button onClick={() => setShowPhotoModal(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
