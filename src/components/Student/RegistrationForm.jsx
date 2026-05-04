// src/components/Student/RegistrationForm.jsx
import { useState } from 'react';
import { submitRegistration, getMyRegistrations } from '../../services/api';
import { FaFileUpload, FaPaperPlane, FaSpinner, FaCheckCircle, FaTimesCircle, FaClock, FaDownload } from 'react-icons/fa';
import toast from 'react-hot-toast';

const RegistrationForm = () => {
  const [academicLevel, setAcademicLevel] = useState(1);
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const academicLevels = [
    { value: 1, label: 'First Year - Level 1' },
    { value: 2, label: 'Second Year - Level 2' },
    { value: 3, label: 'Third Year - Level 3' },
    { value: 4, label: 'Fourth Year - Level 4' },
  ];

  const fetchMyRegistrations = async () => {
    try {
      const response = await getMyRegistrations();
      setMyRegistrations(response.data || []);
    } catch (err) {
      console.error('Error fetching registrations:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('AcademicLevel', academicLevel);
    formData.append('Notes', notes);
    formData.append('File', file);

    setLoading(true);

    try {
      const response = await submitRegistration(formData);
      if (response.data.success) {
        toast.success('Registration submitted successfully!');
        setFile(null);
        setNotes('');
        setAcademicLevel(1);
        fetchMyRegistrations();
        setShowHistory(true);
      }
    } catch (err) {
      console.error('Error submitting registration:', err);
      toast.error(err.response?.data?.error || 'Failed to submit registration');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Academic Registration</h1>
      <p className="text-gray-500 mb-6">Submit your registration form for advisor review</p>

      {/* Registration Form */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Submit New Registration</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Level</label>
            <select
              value={academicLevel}
              onChange={(e) => setAcademicLevel(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              {academicLevels.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              placeholder="Any additional information you'd like to share..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Document</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-all">
                <FaFileUpload />
                <span>Choose File</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files[0])}
                  accept=".pdf,.doc,.docx,.jpg,.png"
                />
              </label>
              {file && <span className="text-sm text-gray-600">{file.name}</span>}
            </div>
            <p className="text-xs text-gray-400 mt-1">Accepted files: PDF, DOC, DOCX, JPG, PNG (Max 10MB)</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg hover:from-purple-700 hover:to-violet-700 transition-all disabled:opacity-50"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
            Submit Registration
          </button>
        </form>
      </div>

      {/* My Registrations History */}
      <div>
        <button
          onClick={() => {
            setShowHistory(!showHistory);
            if (!showHistory) fetchMyRegistrations();
          }}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium mb-4"
        >
          {showHistory ? 'Hide' : 'Show'} My Registrations
        </button>

        {showHistory && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-semibold text-gray-800">My Registrations</h2>
            </div>
            {myRegistrations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No registrations found
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {myRegistrations.map((reg) => (
                  <div key={reg.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-medium text-gray-800">Level {reg.academicLevel}</span>
                          {getStatusBadge(reg.status)}
                        </div>
                        <p className="text-sm text-gray-500">Submitted: {new Date(reg.submittedAt).toLocaleDateString()}</p>
                        {reg.notes && <p className="text-sm text-gray-600 mt-1">{reg.notes}</p>}
                        {reg.advisorResponse && (
                          <p className="text-sm text-blue-600 mt-1">Response: {reg.advisorResponse}</p>
                        )}
                      </div>
                      <a
                        href={reg.fileUrl}
                        download
                        className="flex items-center gap-1 text-purple-600 hover:text-purple-700 text-sm"
                      >
                        <FaDownload size={12} />
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationForm;