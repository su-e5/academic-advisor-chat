// src/components/Admin/UsersManagement.jsx
import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../services/api';
import { FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaSearch , FaPhone, FaTelegram, FaGraduationCap, FaChartLine } from 'react-icons/fa';
import toast from 'react-hot-toast';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      const response = await adminAPI.getUsers();
      console.log('Users fetched:', response.data);
      setUsers(response.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ استخدام async function داخل useEffect
  useEffect(() => {
    let isMounted = true;
    
    const initialize = async () => {
      if (!isMounted) return;
      await fetchUsers();
    };
    
    initialize();
    
    return () => {
      isMounted = false;
    };
  }, [fetchUsers]);

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await adminAPI.toggleUserStatus(userId);
      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      await fetchUsers();
    } catch (err) {
      console.error('Error toggling user status:', err);
      toast.error('Failed to update user status');
    }
  };

  const deleteUserHandler = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
      try {
        await adminAPI.deleteUser(userId);
        toast.success('User deleted successfully');
        await fetchUsers();
      } catch (err) {
        console.error('Error deleting user:', err);
        toast.error('Failed to delete user');
      }
    }
  };

  const handleChangeRole = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  const updateUserRole = async () => {
    if (!selectedUser || !newRole) return;
    
    try {
      await adminAPI.updateUserRole(selectedUser.id, newRole);
      toast.success(`User role updated to ${newRole}`);
      await fetchUsers();
      setShowRoleModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Error updating role:', err);
      toast.error('Failed to update user role');
    }
  };

  const filteredUsers = users.filter(user =>
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'bg-red-100 text-red-700';
      case 'advisor': return 'bg-green-100 text-green-700';
      case 'student': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-100 flex-shrink-0">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Table Container with Scroll */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-[800px]">
          {/* Mobile Cards View */}
          <div className="block lg:hidden divide-y divide-gray-100">
            {filteredUsers.map((user) => (
              <div key={user.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-800">{user.fullName}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-gray-50">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <FaGraduationCap size={12} />
                    <span>Level {user.academicLevel || 1}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <FaChartLine size={12} />
                    <span>GPA: {user.gpa || 'N/A'}</span>
                  </div>
                  {user.phoneNumber && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 col-span-2">
                      <FaPhone size={12} />
                      <span>{user.phoneNumber}</span>
                    </div>
                  )}
                  {user.telegramUsername && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 col-span-2">
                      <FaTelegram size={12} />
                      <span>{user.telegramUsername}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-50">
                  <button
                    onClick={() => toggleUserStatus(user.id, user.isActive)}
                    className="flex items-center gap-2 text-sm"
                  >
                    {user.isActive ? (
                      <FaToggleOn className="text-green-500 text-xl" />
                    ) : (
                      <FaToggleOff className="text-gray-400 text-xl" />
                    )}
                    <span className="text-xs text-gray-500">{user.isActive ? 'Active' : 'Inactive'}</span>
                  </button>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleChangeRole(user)} 
                      className="text-purple-500 hover:text-purple-700"
                      title="Change role"
                    >
                      <FaEdit size={16} />
                    </button>
                    <button 
                      onClick={() => deleteUserHandler(user.id, user.fullName)} 
                      className="text-red-500 hover:text-red-700"
                      title="Delete user"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">GPA</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telegram</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">Level {user.academicLevel || 1}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">{user.gpa || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">{user.phoneNumber || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">{user.telegramUsername || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button onClick={() => toggleUserStatus(user.id, user.isActive)}>
                        {user.isActive ? (
                          <FaToggleOn className="text-green-500 text-xl" />
                        ) : (
                          <FaToggleOff className="text-gray-400 text-xl" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleChangeRole(user)} 
                          className="text-purple-500 hover:text-purple-700"
                          title="Change role"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button 
                          onClick={() => deleteUserHandler(user.id, user.fullName)} 
                          className="text-red-500 hover:text-red-700"
                          title="Delete user"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12 text-gray-500 flex-shrink-0">
          No users found
        </div>
      )}

      {/* Change Role Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Change User Role</h2>
            <p className="text-sm text-gray-600 mb-4">
              User: <span className="font-semibold">{selectedUser.fullName}</span>
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">New Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Student">Student</option>
                <option value="Advisor">Advisor</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowRoleModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={updateUserRole}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Update Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;