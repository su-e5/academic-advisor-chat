// src/components/Student/ChooseAdvisor.jsx
import { useState, useEffect } from 'react';
import { getAvailableAdvisors, chooseAdvisor } from '../../services/api';
import { FaUserTie, FaUsers, FaCheckCircle, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ChooseAdvisor = () => {
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdvisorId, setSelectedAdvisorId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdvisors = async () => {
      try {
        const response = await getAvailableAdvisors();
        setAdvisors(response.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching advisors:', err);
        
        // معالجة الخطأ 403 (Forbidden)
        if (err.response?.status === 403) {
          setError('You do not have permission to view advisors. Please contact your academic advisor directly.');
          toast.error('Permission denied. Please contact your academic advisor.');
        } else {
          setError('Failed to load advisors. Please try again later.');
          toast.error('Failed to load advisors');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAdvisors();
  }, []);

  const handleSelectAdvisor = (advisorId) => {
    setSelectedAdvisorId(advisorId);
  };

  const handleSubmit = async () => {
    if (!selectedAdvisorId) {
      toast.error('Please select an advisor');
      return;
    }

    setSubmitting(true);
    try {
      await chooseAdvisor(selectedAdvisorId);
      toast.success('Advisor selected successfully!');
      setTimeout(() => {
        window.location.href = '/chat';
      }, 1500);
    } catch (err) {
      console.error('Error choosing advisor:', err);
      
      if (err.response?.status === 403) {
        toast.error('You do not have permission to choose an advisor');
      } else if (err.response?.status === 400) {
        toast.error(err.response?.data || 'This advisor has reached their student limit');
      } else {
        toast.error(err.response?.data || 'Failed to choose advisor');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <FaSpinner className="animate-spin text-purple-500 text-4xl" />
      </div>
    );
  }

  // عرض رسالة الخطأ إذا كان هناك مشكلة في الصلاحيات
  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <FaExclamationTriangle className="text-5xl text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Coming Soon</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            You can still communicate with your academic advisor through the{' '}
            <a href="/advisor-chat" className="text-purple-600 hover:underline">Advisor Chat</a> feature.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Choose Your Academic Advisor</h1>
        <p className="text-gray-500">Select an advisor to guide you through your academic journey</p>
      </div>

      {advisors.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
          <FaUserTie className="text-5xl mx-auto mb-3 opacity-30" />
          <p>No advisors available at the moment</p>
          <p className="text-sm mt-2">Please check back later or contact the administration.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {advisors.map((advisor) => (
              <div
                key={advisor.id}
                onClick={() => handleSelectAdvisor(advisor.id)}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  selectedAdvisorId === advisor.id
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                      {advisor.fullName?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg">{advisor.fullName}</h3>
                      <p className="text-sm text-gray-500">{advisor.department || 'Academic Department'}</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <FaUsers size={14} />
                      <span>{advisor.currentStudents || 0} / {advisor.maxStudents || 50} students</span>
                    </div>
                    {advisor.hasCapacity !== false ? (
                      <span className="text-xs text-green-600 mt-1 inline-block bg-green-50 px-2 py-0.5 rounded-full">
                        ✅ Available
                      </span>
                    ) : (
                      <span className="text-xs text-red-600 mt-1 inline-block bg-red-50 px-2 py-0.5 rounded-full">
                        ❌ Full
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={!selectedAdvisorId || submitting}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:from-purple-700 hover:to-violet-700 transition-all duration-200 flex items-center gap-2"
            >
              {submitting ? <FaSpinner className="animate-spin" size={18} /> : <FaCheckCircle size={18} />}
              {submitting ? 'Confirming...' : 'Confirm Selection'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChooseAdvisor;