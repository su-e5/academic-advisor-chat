// src/components/Layout/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FaCommentDots } from 'react-icons/fa'
import { FaHome, FaRobot, FaUser, FaUsers, FaBook, FaChartLine, FaTimes, FaGavel , FaFileUpload } from 'react-icons/fa';

const Sidebar = ({ onClose }) => {
  const { user } = useAuth();

  const menuItems = React.useMemo(() => {
    switch (user?.role?.toLowerCase()) {
      case 'admin':
        return [
          { path: '/admin', label: 'Dashboard', icon: FaHome },
          { path: '/admin/users', label: 'Users', icon: FaUsers },
          { path: '/admin/regulations', label: 'Regulations', icon: FaBook },
        ];
      case 'advisor':
        return [
          { path: '/advisor', label: 'My Students', icon: FaUsers },
          { path: '/advisor/analytics', label: 'Analytics', icon: FaChartLine },
        ];
      case 'student':
        return [
          { path: '/chat', label: 'AI Assistant', icon: FaRobot },
              { path: '/registration', label: 'Registration', icon: FaFileUpload },
          { path: '/regulations', label: 'Regulations', icon: FaGavel },  // ✅ أضيفي Regulations للطالب
          { path: '/profile', label: 'Profile', icon: FaUser },
          { path: '/advisor-chat', label: 'Advisor Chat', icon: FaCommentDots },
        ];
      default:
        return [
          { path: '/profile', label: 'Profile', icon: FaUser },
        ];
    }
  }, [user?.role]);

  if (!user) return null;

  return (
    <aside className="w-64 bg-white shadow-md flex-shrink-0 flex flex-col min-h-screen relative z-10">
      {onClose && (
        <div className="p-4 border-b border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
          >
            <FaTimes size={18} />
          </button>
        </div>
      )}

      
<div className="bg-blue-50 rounded-lg p-3">
  <p className="text-sm text-blue-800 font-semibold">Welcome, {user?.fullName}</p>
  <p className="text-xs text-blue-600 mt-1">
    {user?.role === 'Student' ? 'Student' : user?.role === 'Advisor' ? 'Academic Advisor' : 'System Admin'}
  </p>
  {/* ✅ عرض المستوى الدراسي للطالب */}
  {user?.role === 'Student' && user?.academicLevel && (
    <p className="text-xs text-blue-600 mt-1">
      Level: {user.academicLevel} - {
        user.academicLevel === 1 ? 'First Year' :
        user.academicLevel === 2 ? 'Second Year' :
        user.academicLevel === 3 ? 'Third Year' : 'Fourth Year'
      }
    </p>
  )}
</div>
      
      <nav className="mt-4 flex-1 px-3">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            end={item.path === '/admin' || item.path === '/advisor'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 my-1 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-primary-50 text-primary-500' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-primary-500'
              }`
            }
          >
            <item.icon size={18} />
            <span className="text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-200 text-center mt-auto">
        <p className="text-xs text-gray-400">AI Academic Advisor</p>
      </div>
    </aside>
  );
};

export default Sidebar;