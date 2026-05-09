import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaPlus, FaTrash, FaUpload, FaTimes, FaEnvelope, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

// Fixed axios config for the available backend
const API_BASE = 'https://siraj.runasp.net/api';
const validateEmailAPI = (email) => axios.post(`${API_BASE}/public/validate-university-email`, { email });

const UniversityEmailsManagement = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [bulkEmails, setBulkEmails] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validating, setValidating] = useState(false);

  // Load emails from localStorage
  const fetchEmails = useCallback(async () => {
    try {
      const stored = localStorage.getItem('university_emails');
      const parsed = stored ? JSON.parse(stored) : [];
      setEmails(parsed);
    } catch (err) {
      console.error('Error loading from localStorage:', err);
      setEmails([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save emails to localStorage
  const saveEmails = (newList) => {
    localStorage.setItem('university_emails', JSON.stringify(newList));
    setEmails(newList);
  };

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  // Validate email using the real API
  const validateUniversityEmail = async (email) => {
    try {
      setValidating(true);
      const response = await validateEmailAPI(email);
      return response.data.valid === true;
    } catch (error) {
      console.error('Validation error:', error);
      toast.error('Email validation service is currently unavailable');
      return false;
    } finally {
      setValidating(false);
    }
  };

  // Add a single email with validation
  const handleAddEmail = async () => {
    const email = newEmail.trim();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Check for duplicates locally
    if (emails.some(e => e.email === email)) {
      toast.error('This email already exists');
      return;
    }

    setIsSubmitting(true);
    try {
      const isValid = await validateUniversityEmail(email);
      if (!isValid) {
        toast.error('Email is not approved by the university');
        return;
      }

      const newEntry = {
        id: Date.now(),
        email: email,
        addedAt: new Date().toISOString()
      };
      saveEmails([...emails, newEntry]);
      toast.success('Email successfully validated and added');
      setNewEmail('');
    } catch (err) {
      toast.error('An error occurred while adding the email');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add multiple emails, each validated individually
  const handleAddBulkEmails = async () => {
    const emailList = bulkEmails.split(/\r?\n/).filter(e => e.trim() && e.includes('@'));
    if (emailList.length === 0) {
      toast.error('Please enter at least one valid email');
      return;
    }

    setIsSubmitting(true);
    let addedCount = 0;
    const newEmailsList = [...emails];

    for (const email of emailList) {
      if (newEmailsList.some(e => e.email === email)) {
        toast.error(`Skipped duplicate: ${email}`);
        continue;
      }
      try {
        const isValid = await validateUniversityEmail(email);
        if (isValid) {
          newEmailsList.push({ id: Date.now() + addedCount, email, addedAt: new Date().toISOString() });
          addedCount++;
        } else {
          toast.error(`Email not approved: ${email}`);
        }
      } catch (err) {
        toast.error(`Validation failed for: ${email}`);
      }
    }

    if (addedCount > 0) {
      saveEmails(newEmailsList);
      toast.success(`Added ${addedCount} out of ${emailList.length} emails`);
    } else {
      toast.error('No valid emails were added');
    }
    setBulkEmails('');
    setShowBulkModal(false);
    setIsSubmitting(false);
  };

  const handleDeleteEmail = (id, email) => {
    if (window.confirm(`Delete ${email}?`)) {
      const newList = emails.filter(e => e.id !== id);
      saveEmails(newList);
      toast.success('Deleted successfully');
    }
  };

  const handleDeleteAll = () => {
    if (window.confirm('Delete ALL university emails? This cannot be undone.')) {
      saveEmails([]);
      toast.success('All emails deleted');
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
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Allowed University Emails</h1>
      <p className="text-gray-500 mb-6">Manage emails allowed for registration (validated via university API)</p>

      {/* Add single email */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Add New Email</h2>
        <div className="flex gap-3">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="student@university.edu"
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
            disabled={isSubmitting || validating}
          />
          <button
            onClick={handleAddEmail}
            disabled={isSubmitting || validating}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {validating ? <FaSpinner className="animate-spin" /> : <FaPlus size={14} />}
            {validating ? 'Validating...' : 'Add'}
          </button>
          <button
            onClick={() => setShowBulkModal(true)}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <FaUpload size={14} /> Bulk Add
          </button>
          {emails.length > 0 && (
            <button
              onClick={handleDeleteAll}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              <FaTrash size={14} /> Delete All
            </button>
          )}
        </div>
      </div>

      {/* Emails list */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-gray-800">Allowed Emails ({emails.length})</h2>
        </div>
        {emails.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FaEnvelope className="text-5xl mx-auto mb-3 opacity-30" />
            <p>No university emails added yet</p>
            <p className="text-sm">Add single or multiple emails – each will be validated automatically</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {emails.map((email) => (
              <div key={email.id} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50">
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500 text-sm" />
                  <span className="font-medium text-gray-800">{email.email}</span>
                  <span className="text-xs text-gray-400 ml-3">
                    Added: {new Date(email.addedAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteEmail(email.id, email.email)}
                  className="text-red-500 hover:text-red-700"
                  disabled={isSubmitting}
                >
                  <FaTrash size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bulk add modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Bulk Add Emails</h2>
              <button onClick={() => setShowBulkModal(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-2">Enter one email per line</p>
            <textarea
              value={bulkEmails}
              onChange={(e) => setBulkEmails(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="student1@university.edu&#10;student2@university.edu"
              disabled={isSubmitting}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowBulkModal(false)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddBulkEmails}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Validating...' : 'Add All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversityEmailsManagement;