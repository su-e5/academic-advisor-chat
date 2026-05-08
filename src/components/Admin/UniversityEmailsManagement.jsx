// src/components/Admin/UniversityEmailsManagement.jsx
import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../services/api';
import { FaPlus, FaTrash, FaUpload, FaTimes, FaEnvelope, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

const UniversityEmailsManagement = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [bulkEmails, setBulkEmails] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ استخدام useCallback لمنع إعادة تعريف الدالة
  const fetchEmails = useCallback(async () => {
    try {
      const response = await adminAPI.getUniversityEmails();
      setEmails(response.data || []);
    } catch (err) {
      console.error('Error fetching emails:', err);
      toast.error('Failed to load university emails');
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ التحميل الأولي - استخدام async function داخل useEffect
  useEffect(() => {
    let isMounted = true;
    
    const initialize = async () => {
      if (!isMounted) return;
      await fetchEmails();
    };
    
    initialize();
    
    return () => {
      isMounted = false;
    };
  }, [fetchEmails]);

  const handleAddEmail = async () => {
    if (!newEmail.trim() || !newEmail.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }

    setIsSubmitting(true);
    try {
      await adminAPI.addUniversityEmail(newEmail);
      toast.success('Email added successfully');
      setNewEmail('');
      await fetchEmails();
    } catch (err) {
      console.error('Error adding email:', err);
      toast.error(err.response?.data?.error || 'Failed to add email');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddBulkEmails = async () => {
    const emailList = bulkEmails.split(/\r?\n/).filter(e => e.trim() && e.includes('@'));
    if (emailList.length === 0) {
      toast.error('Please enter at least one valid email');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await adminAPI.addMultipleUniversityEmails(emailList);
      toast.success(response.data.message || `Added ${response.data.addedCount} emails`);
      setBulkEmails('');
      setShowBulkModal(false);
      await fetchEmails();
    } catch (err) {
      console.error('Error adding bulk emails:', err);
      toast.error('Failed to add emails');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEmail = async (id, email) => {
    if (window.confirm(`Delete ${email}?`)) {
      try {
        await adminAPI.deleteUniversityEmail(id);
        toast.success('Email deleted');
        await fetchEmails();
      } catch (err) {
        console.error('Error deleting email:', err);
        toast.error('Failed to delete email');
      }
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm('Delete ALL university emails? This cannot be undone.')) {
      try {
        await adminAPI.deleteAllUniversityEmails();
        toast.success('All emails deleted');
        await fetchEmails();
      } catch (err) {
        console.error('Error deleting all emails:', err);
        toast.error('Failed to delete emails');
      }
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
      <h1 className="text-2xl font-bold text-gray-800 mb-2">University Email Domains</h1>
      <p className="text-gray-500 mb-6">Manage allowed university email addresses for student registration</p>

      {/* Add Email Section */}
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
            disabled={isSubmitting}
          />
          <button
            onClick={handleAddEmail}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            <FaPlus size={14} /> Add
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

      {/* Emails List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-gray-800">Allowed Emails ({emails.length})</h2>
        </div>
        {emails.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FaEnvelope className="text-5xl mx-auto mb-3 opacity-30" />
            <p>No university emails added yet</p>
            <p className="text-sm">Add email domains to allow student registration</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {emails.map((email) => (
              <div key={email.id} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50">
                <div>
                  <span className="font-medium text-gray-800">{email.email}</span>
                  <span className="text-xs text-gray-400 ml-3">Added: {new Date(email.addedAt).toLocaleDateString()}</span>
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

      {/* Bulk Add Modal */}
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
              placeholder="student1@university.edu&#10;student2@university.edu&#10;student3@university.edu"
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
                Add All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversityEmailsManagement;