// src/components/Admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { 
  FaUsers, FaUserGraduate, FaUserTie, FaComments, 
  FaSpinner, FaTimes, FaComment, FaRegClock, FaArrowRight,
  FaSearch
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ title: '', items: [], type: '' });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalSearchTerm, setModalSearchTerm] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await adminAPI.getDashboard();
        setStats(response.data);
      } catch (err) {
        console.error('Error fetching dashboard:', err);
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // دالة عرض التفاصيل عند الضغط على أي مربع
  const handleCardClick = async (type, title) => {
    setModalLoading(true);
    setShowModal(true);
    setModalSearchTerm('');
    
    try {
      let data = [];
      
      switch (type) {
        case 'users': {
          const response = await adminAPI.getUsers();
          data = response.data || [];
          break;
        }
        case 'students': {
          const response = await adminAPI.getUsers();
          data = (response.data || []).filter(u => u.role === 'Student' || u.role === 'student');
          break;
        }
        case 'advisors': {
          const response = await adminAPI.getUsers();
          data = (response.data || []).filter(u => u.role === 'Advisor' || u.role === 'advisor');
          break;
        }
        case 'conversations': {
          data = stats?.recentMessages || [];
          break;
        }
        default: {
          data = [];
          break;
        }
      }
      
      setModalData({ title, items: data, type });
    } catch (err) {
      console.error(`Error fetching ${type}:`, err);
      toast.error(`Failed to load ${title}`);
      setModalData({ title, items: [], type });
    } finally {
      setModalLoading(false);
    }
  };

  // فلترة العناصر داخل المودال
  const filteredModalItems = modalData.items.filter(item => {
    const searchTerm = modalSearchTerm.toLowerCase();
    return (
      (item.fullName?.toLowerCase().includes(searchTerm)) ||
      (item.name?.toLowerCase().includes(searchTerm)) ||
      (item.email?.toLowerCase().includes(searchTerm)) ||
      (item.userName?.toLowerCase().includes(searchTerm)) ||
      (item.content?.toLowerCase().includes(searchTerm))
    );
  });

  // تجهيز بيانات الـ Recent Activity
  const getRecentActivities = () => {
    const activities = [];
    
    if (stats?.recentMessages && stats.recentMessages.length > 0) {
      stats.recentMessages.forEach(msg => {
        activities.push({
          id: msg.id,
          type: 'message',
          title: 'New Message',
          description: `${msg.userName || 'User'} sent: "${msg.content?.substring(0, 50)}${msg.content?.length > 50 ? '...' : ''}"`,
          time: msg.timestamp,
          icon: <FaComment className="text-blue-500" />
        });
      });
    }
    
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    return activities.slice(0, 10);
  };

  const activities = getRecentActivities();

  // كروت Dashboard
  const cards = [
    {
      id: 'users',
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: <FaUsers className="text-white text-2xl" />,
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 'students',
      title: 'Students',
      value: stats?.totalStudents || 0,
      icon: <FaUserGraduate className="text-white text-2xl" />,
      color: 'from-green-500 to-green-600',
    },
    {
      id: 'advisors',
      title: 'Advisors',
      value: stats?.totalAdvisors || 0,
      icon: <FaUserTie className="text-white text-2xl" />,
      color: 'from-purple-500 to-purple-600',
    },
    {
      id: 'conversations',
      title: 'Conversations',
      value: stats?.totalConversations || 0,
      icon: <FaComments className="text-white text-2xl" />,
      color: 'from-orange-500 to-orange-600',
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <FaSpinner className="animate-spin text-purple-500 text-4xl" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your platform.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleCardClick(card.id, card.title)}
            className={`bg-gradient-to-r ${card.color} rounded-xl p-5 text-white shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/80 text-sm mb-1">{card.title}</p>
                <p className="text-3xl font-bold">{card.value}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                {card.icon}
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-white/70 text-xs">
              <span>Click to view details</span>
              <FaArrowRight size={10} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <FaUsers className="text-purple-600" />
            </div>
            <h2 className="font-semibold text-gray-800">Users by Role</h2>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Students</span>
                <span className="font-semibold">{stats?.totalStudents || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${((stats?.totalStudents || 0) / (stats?.totalUsers || 1)) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Advisors</span>
                <span className="font-semibold">{stats?.totalAdvisors || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${((stats?.totalAdvisors || 0) / (stats?.totalUsers || 1)) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Admins</span>
                <span className="font-semibold">{stats?.totalAdmins || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${((stats?.totalAdmins || 0) / (stats?.totalUsers || 1)) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <FaComments className="text-orange-600" />
            </div>
            <h2 className="font-semibold text-gray-800">Messages Overview</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-800">{stats?.totalMessages || 0}</p>
              <p className="text-xs text-gray-500">Total Messages</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-800">{Math.round((stats?.totalMessages || 0) / (stats?.totalConversations || 1))}</p>
              <p className="text-xs text-gray-500">Avg per Conversation</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-800">{stats?.pendingRegistrations || 0}</p>
              <p className="text-xs text-gray-500">Pending Registrations</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-800">{stats?.totalRegulations || 0}</p>
              <p className="text-xs text-gray-500">Total Regulations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <FaRegClock className="text-purple-600" />
            </div>
            <h2 className="font-semibold text-gray-800">Recent Activity</h2>
          </div>
        </div>
        
        <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
          {activities.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FaRegClock className="text-5xl mx-auto mb-3 opacity-30" />
              <p>No recent activity to display</p>
              <p className="text-sm mt-1">Activity will appear here</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div>
                        <p className="font-medium text-gray-800">{activity.title}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{activity.description}</p>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(activity.time).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal for Details - مع سكرول داخلي */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center rounded-t-xl flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-800">{modalData.title}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>
            
            {/* Search Bar داخل المودال */}
            {modalData.items.length > 0 && (
              <div className="px-4 pt-4 pb-2 flex-shrink-0">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    placeholder={`Search in ${modalData.title}...`}
                    value={modalSearchTerm}
                    onChange={(e) => setModalSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                </div>
              </div>
            )}
            
            {/* Body - مع سكرول داخلي */}
            <div className="flex-1 overflow-y-auto p-4">
              {modalLoading ? (
                <div className="flex justify-center py-8">
                  <FaSpinner className="animate-spin text-purple-500 text-3xl" />
                </div>
              ) : filteredModalItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No data available</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredModalItems.map((item, index) => (
                    <div key={item.id || index} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{item.fullName || item.userName || item.name || `Item ${index + 1}`}</p>
                          <p className="text-sm text-gray-500 break-words">{item.email || item.content?.substring(0, 100)}</p>
                          {item.department && (
                            <p className="text-xs text-gray-400 mt-1">{item.department}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {item.role && (
                            <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                              item.role === 'Admin' ? 'bg-red-100 text-red-700' :
                              item.role === 'Advisor' ? 'bg-green-100 text-green-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {item.role}
                            </span>
                          )}
                          {item.timestamp && (
                            <span className="text-xs text-gray-400 whitespace-nowrap">
                              {new Date(item.timestamp).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer مع عدد العناصر */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-3 rounded-b-xl flex-shrink-0">
              <p className="text-xs text-gray-500">
                Showing {filteredModalItems.length} of {modalData.items.length} items
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;  