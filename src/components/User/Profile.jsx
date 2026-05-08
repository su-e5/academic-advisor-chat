// src/components/User/Profile.jsx
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { FaUser, FaEnvelope, FaPhone, FaKey, FaSave, FaEdit, FaTimes, FaUserCircle, FaUniversity, FaChartLine, FaTelegram } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const academicLevels = [
    { value: 1, label: "First Year - Level 1" },
    { value: 2, label: "Second Year - Level 2" },
    { value: 3, label: "Third Year - Level 3" },
    { value: 4, label: "Fourth Year - Level 4" },
  ];

  const [formData, setFormData] = useState({
    fullName: user?.fullName || user?.name || '',
    email: user?.email || '',
    department: user?.department || '',
    academicLevel: user?.academicLevel || 1,
    phoneNumber: user?.phoneNumber || '',
    gpa: user?.gpa || 0,
    telegramUsername: user?.telegramUsername || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await updateProfile(formData);
    if (success) {
      setIsEditing(false);
    }
    setLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangingPassword(false);
    } catch {
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Administrator</span>;
      case 'advisor':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Academic Advisor</span>;
      case 'student':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">Student</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">{role}</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 flex items-center justify-center">
            <FaUser className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">My Profile</h1>
            <p className="text-gray-500 text-sm mt-0.5">Manage your personal information</p>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-violet-600 px-5 py-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <FaUserCircle className="text-white text-3xl" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white">{formData.fullName || user?.fullName || user?.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                {getRoleBadge(user?.role)}
                {user?.role === 'student' && user?.academicLevel && (
                  <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                    Level {user.academicLevel}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="p-5">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-base font-semibold text-gray-800">Personal Information</h3>
              <p className="text-gray-500 text-xs">Update your personal details</p>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-all text-sm"
              >
                <FaEdit size={14} />
                Edit
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-3 py-1.5 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-sm"
              >
                <FaTimes size={14} />
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleProfileUpdate}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm ${!isEditing ? 'bg-gray-50 text-gray-500' : ''}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={true}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 text-sm cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <div className="relative">
                  <FaUniversity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm ${!isEditing ? 'bg-gray-50 text-gray-500' : ''}`}
                  />
                </div>
              </div>

              {user?.role === 'student' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Academic Level</label>
                    <div className="relative">
                      <FaUniversity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                      <select
                        value={formData.academicLevel}
                        onChange={(e) => setFormData({ ...formData, academicLevel: parseInt(e.target.value) })}
                        disabled={!isEditing}
                        className={`w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm ${!isEditing ? 'bg-gray-50 text-gray-500' : ''}`}
                      >
                        {academicLevels.map(level => (
                          <option key={level.value} value={level.value}>{level.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GPA (0.0 - 4.0)</label>
                    <div className="relative">
                      <FaChartLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="4"
                        value={formData.gpa}
                        onChange={(e) => setFormData({ ...formData, gpa: parseFloat(e.target.value) })}
                        disabled={!isEditing}
                        className={`w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm ${!isEditing ? 'bg-gray-50 text-gray-500' : ''}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (WhatsApp)</label>
                    <div className="relative">
                      <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        disabled={!isEditing}
                        placeholder="+20123456789"
                        className={`w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm ${!isEditing ? 'bg-gray-50 text-gray-500' : ''}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telegram Username</label>
                    <div className="relative">
                      <FaTelegram className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                      <input
                        type="text"
                        value={formData.telegramUsername}
                        onChange={(e) => setFormData({ ...formData, telegramUsername: e.target.value })}
                        disabled={!isEditing}
                        placeholder="@username"
                        className={`w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm ${!isEditing ? 'bg-gray-50 text-gray-500' : ''}`}
                      />
                    </div>
                  </div>
                </>
              )}

              {isEditing && (
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg hover:from-purple-700 hover:to-violet-700 transition-all flex items-center gap-2 disabled:opacity-50 text-sm"
                  >
                    <FaSave size={14} />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100"></div>

        {/* Change Password Section */}
        <div className="p-5">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-base font-semibold text-gray-800">Security</h3>
              <p className="text-gray-500 text-xs">Update your password</p>
            </div>
            {!isChangingPassword ? (
              <button
                onClick={() => setIsChangingPassword(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-all text-sm"
              >
                <FaKey size={14} />
                Change Password
              </button>
            ) : (
              <button
                onClick={() => setIsChangingPassword(false)}
                className="flex items-center gap-2 px-3 py-1.5 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-sm"
              >
                <FaTimes size={14} />
                Cancel
              </button>
            )}
          </div>

          {isChangingPassword && (
            <form onSubmit={handlePasswordChange}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <div className="relative">
                    <FaKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <div className="relative">
                    <FaKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <FaKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg hover:from-purple-700 hover:to-violet-700 transition-all flex items-center gap-2 disabled:opacity-50 text-sm"
                  >
                    <FaSave size={14} />
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Account Info */}
      <div className="mt-4 bg-gray-50 rounded-lg p-3 text-center">
        <p className="text-xs text-gray-500">
          Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear()} • Academic Advisor System
        </p>
      </div>
    </div>
  );
};

export default Profile;