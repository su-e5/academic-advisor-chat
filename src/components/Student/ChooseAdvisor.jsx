// src/components/Student/ChooseAdvisor.jsx
import { useState, useEffect } from 'react';
import { getAvailableAdvisors, chooseAdvisor } from '../../services/api';
import { FaUserTie, FaUsers, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ChooseAdvisor = () => {
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdvisorId, setSelectedAdvisorId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAdvisors = async () => {
      try {
        const response = await getAvailableAdvisors();
        setAdvisors(response.data || []);
      } catch (err) {
        console.error('Error fetching advisors:', err);
        toast.error('Failed to load advisors');
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
      // تحديث الصفحة أو إعادة توجيه
      setTimeout(() => {
        window.location.href = '/chat';
      }, 1500);
    } catch (err) {
      console.error('Error choosing advisor:', err);
      toast.error(err.response?.data || 'Failed to choose advisor');
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

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Choose Your Academic Advisor</h1>
        <p className="text-gray-500">Select an advisor to guide you through your academic journey</p>
      </div>

      <div className="grid gap-4">
        {advisors.map((advisor) => (
          <div
            key={advisor.id}
            onClick={() => handleSelectAdvisor(advisor.id)}
            className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
              selectedAdvisorId === advisor.id
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 flex items-center justify-center text-white text-xl font-bold">
                  {advisor.fullName?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{advisor.fullName}</h3>
                  <p className="text-sm text-gray-500">{advisor.department}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <FaUsers size={14} />
                  <span>{advisor.currentStudents} / {advisor.maxStudents} students</span>
                </div>
                {advisor.hasCapacity ? (
                  <span className="text-xs text-green-600 mt-1 inline-block">✅ Available</span>
                ) : (
                  <span className="text-xs text-red-600 mt-1 inline-block">❌ Full</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {advisors.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FaUserTie className="text-5xl mx-auto mb-3 opacity-30" />
          <p>No advisors available at the moment</p>
        </div>
      )}

      {advisors.length > 0 && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={!selectedAdvisorId || submitting}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl font-semibold disabled:opacity-50 hover:shadow-lg transition-all"
          >
            {submitting ? <FaSpinner className="animate-spin inline mr-2" /> : <FaCheckCircle className="inline mr-2" />}
            Confirm Selection
          </button>
        </div>
      )}
    </div>
  );
};

export default ChooseAdvisor;