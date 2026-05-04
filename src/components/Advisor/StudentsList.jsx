// src/components/Advisor/StudentsList.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaComments, FaBell, FaUserGraduate, FaEnvelope, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

const StudentsList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState({});
  const navigate = useNavigate();

  // ✅ جلب عدد الرسائل الجديدة لكل طالب
  const fetchUnreadCounts = useCallback(async (studentsList) => {
    const token = localStorage.getItem('token');
    const counts = {};
    
    for (const student of studentsList) {
      try {
        const convRes = await fetch(`/api/Advisor/students/${student.id}/conversations`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (convRes.ok) {
          const conversations = await convRes.json();
          let totalStudentMessages = 0;
          
          for (const conv of conversations) {
            const convDetailRes = await fetch(`/api/Advisor/conversations/${conv.id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (convDetailRes.ok) {
              const convDetail = await convDetailRes.json();
              const studentMsgCount = convDetail.messages?.filter(m => 
                (m.sender === 'Student' || m.senderId === 'student')
              ).length || 0;
              totalStudentMessages += studentMsgCount;
            }
          }
          
          const savedCount = localStorage.getItem(`student_messages_${student.id}`);
          const prevCount = savedCount ? parseInt(savedCount) : 0;
          const newCount = Math.max(0, totalStudentMessages - prevCount);
          counts[student.id] = newCount;
        }
      } catch (err) {
        console.error(`Error fetching for student ${student.id}:`, err);
        counts[student.id] = 0;
      }
    }
    
    return counts;
  }, []);

  // جلب الطلاب
  const fetchStudents = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/Advisor/students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
        
        const counts = await fetchUnreadCounts(data);
        setUnreadCounts(counts);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [fetchUnreadCounts]);

  // تحديث عدد الرسائل كل 5 ثواني
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (!isMounted) return;
      await fetchStudents();
    };
    
    loadData();
    
    const interval = setInterval(async () => {
      if (isMounted && students.length > 0) {
        const newCounts = await fetchUnreadCounts(students);
        setUnreadCounts(newCounts);
      }
    }, 5000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [fetchStudents, fetchUnreadCounts, students.length]);

  // ✅ عند الضغط على Chat، نحدد الرسائل كمقروءة
  const handleChatClick = (studentId) => {
    // حفظ العدد الحالي للرسائل في localStorage
    const currentUnread = unreadCounts[studentId] || 0;
    if (currentUnread > 0) {
      // تحديث العداد محلياً
      setUnreadCounts(prev => ({ ...prev, [studentId]: 0 }));
    }
    navigate(`/advisor/chat/${studentId}`);
  };

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);
  const activeStudents = students.filter(s => s.isActive).length;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <FaSpinner className="animate-spin text-green-500 text-4xl" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">My Students</h1>
      <p className="text-gray-500 mb-6">Manage and communicate with your students</p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Total Students</p>
              <p className="text-2xl font-bold">{students.length}</p>
            </div>
            <FaUserGraduate size={32} className="opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Active Students</p>
              <p className="text-2xl font-bold">{activeStudents}</p>
            </div>
            <FaUserGraduate size={32} className="opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Unread Messages</p>
              <p className="text-2xl font-bold">{totalUnread}</p>
            </div>
            <FaBell size={32} className="opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Total Students</p>
              <p className="text-2xl font-bold">{students.length}</p>
            </div>
            <FaUserGraduate size={32} className="opacity-50" />
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">New Messages</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => {
                const unread = unreadCounts[student.id] || 0;
                return (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center text-white font-bold">
                          {student.fullName?.charAt(0) || 'S'}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{student.fullName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <FaEnvelope size={12} />
                        {student.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{student.department || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                        Level {student.academicLevel || 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${student.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {student.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {unread > 0 ? (
                        <div className="flex items-center gap-1">
                          <div className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {unread}
                          </div>
                          <span className="text-xs text-red-500">new</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">0</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleChatClick(student.id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all text-sm"
                      >
                        <FaComments size={14} />
                        Chat
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {students.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FaUserGraduate className="text-5xl mx-auto mb-3 opacity-30" />
          <p>No students assigned to you yet.</p>
        </div>
      )}
    </div>
  );
};

export default StudentsList;