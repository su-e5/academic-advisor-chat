// src/components/Advisor/StudentRegistrations.jsx
import { useState, useEffect, useCallback } from 'react';
import { getStudentsWithSubmittedForms } from '../../services/api';
import { FaDownload, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const StudentRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // ✅ استخدام useCallback لمنع إعادة تعريف الدالة
  const fetchRegistrations = useCallback(async () => {
    try {
      const response = await getStudentsWithSubmittedForms();
      setRegistrations(response.data || []);
    } catch (err) {
      console.error('Error fetching registrations:', err);
      toast.error('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ استخدام async function داخل useEffect
  useEffect(() => {
    const loadData = async () => {
      await fetchRegistrations();
    };
    loadData();
  }, [fetchRegistrations]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700"><FaClock size={10} /> {status}</span>;
      case 'Approved':
        return <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-100 text-green-700"><FaCheckCircle size={10} /> {status}</span>;
      case 'Rejected':
        return <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-red-100 text-red-700"><FaTimesCircle size={10} /> {status}</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  const filteredRegistrations = filter === 'all' 
    ? registrations 
    : registrations.filter(r => r.status === filter);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Student Registrations</h1>
      <p className="text-gray-500 mb-6">Review and manage student registration forms</p>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {['all', 'Pending', 'Approved', 'Rejected'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
              filter === status
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status === 'all' ? 'All' : status}
          </button>
        ))}
      </div>

      {/* Registrations Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Document</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRegistrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{reg.studentName}</div>
                      <div className="text-sm text-gray-500">{reg.studentEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{reg.studentDepartment || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                      Level {reg.academicLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(reg.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(reg.status)}</td>
                  <td className="px-6 py-4">
                    <a
                      href={reg.fileUrl}
                      download
                      className="flex items-center gap-1 text-purple-600 hover:text-purple-700"
                    >
                      <FaDownload size={14} />
                      <span className="text-sm">Download</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredRegistrations.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No registrations found
        </div>
      )}
    </div>
  );
};

export default StudentRegistrations;