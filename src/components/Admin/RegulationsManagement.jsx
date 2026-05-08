// src/components/Admin/RegulationsManagement.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { adminAPI } from '../../services/api';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaTimes, FaFilePdf, FaFileImage, FaLink, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

const RegulationsManagement = () => {
  const [regulations, setRegulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRegulation, setEditingRegulation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'Courses',
    keywords: '',
    source: ''
  });

  const categories = ['Courses', 'Registration', 'Grades', 'Dates', 'Rules', 'General'];

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // ✅ استخدام useCallback لمنع إعادة تعريف الدالة
  const fetchRegulations = useCallback(async () => {
    try {
      const response = await adminAPI.getRegulations();
      if (isMounted.current) setRegulations(response.data);
    } catch (err) {
      console.error('Error fetching regulations:', err);
      if (isMounted.current) toast.error('Failed to fetch regulations');
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, []);

  // ✅ التحميل الأولي - استخدام async function داخل useEffect
  useEffect(() => {
    let isActive = true;
    
    const initialize = async () => {
      if (!isActive) return;
      await fetchRegulations();
    };
    
    initialize();
    
    return () => {
      isActive = false;
    };
  }, [fetchRegulations]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (attachmentFile) {
        const formDataWithFile = new FormData();
        formDataWithFile.append('Category', formData.category);
        formDataWithFile.append('Keywords', formData.keywords);
        formDataWithFile.append('Question', formData.question);
        formDataWithFile.append('Answer', formData.answer);
        formDataWithFile.append('Source', formData.source || '');
        formDataWithFile.append('Attachment', attachmentFile);
        
        if (editingRegulation) {
          toast.error('Update with file not supported yet');
        } else {
          await adminAPI.createRegulationWithFile(formDataWithFile);
          toast.success('Regulation created with attachment');
        }
      } else {
        const apiData = {
          question: formData.question,
          answer: formData.answer,
          category: formData.category,
          keywords: formData.keywords || '',
          source: formData.source || ''
        };
        
        if (editingRegulation) {
          await adminAPI.updateRegulation(editingRegulation.id, apiData);
          toast.success('Regulation updated');
        } else {
          await adminAPI.createRegulation(apiData);
          toast.success('Regulation created');
        }
      }
      
      await fetchRegulations();
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error('Error saving regulation:', err);
      toast.error(err.response?.data?.error || 'Failed to save regulation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteRegulation = async (id) => {
    if (window.confirm('Delete this regulation?')) {
      try {
        await adminAPI.deleteRegulation(id);
        await fetchRegulations();
        toast.success('Regulation deleted');
      } catch (err) {
        console.error('Error deleting regulation:', err);
        toast.error('Failed to delete regulation');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      category: 'Courses',
      keywords: '',
      source: ''
    });
    setAttachmentFile(null);
    setEditingRegulation(null);
  };

  const openModal = (regulation = null) => {
    if (regulation) {
      setEditingRegulation(regulation);
      setFormData({
        question: regulation.question,
        answer: regulation.answer,
        category: regulation.category,
        keywords: regulation.keywords || '',
        source: regulation.source || ''
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const getCategoryColor = (category) => {
    const colors = {
      Courses: 'bg-blue-100 text-blue-700',
      Registration: 'bg-green-100 text-green-700',
      Grades: 'bg-yellow-100 text-yellow-700',
      Dates: 'bg-purple-100 text-purple-700',
      Rules: 'bg-red-100 text-red-700',
      General: 'bg-gray-100 text-gray-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const getFileIcon = (attachmentUrl) => {
    if (!attachmentUrl) return null;
    if (attachmentUrl.endsWith('.pdf')) return <FaFilePdf className="text-red-500" />;
    if (attachmentUrl.match(/\.(jpg|jpeg|png|gif)$/i)) return <FaFileImage className="text-green-500" />;
    return <FaLink className="text-blue-500" />;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <FaSpinner className="animate-spin text-purple-500 text-4xl" />
      </div>
    );
  }

  const filteredRegulations = regulations.filter(reg => 
    reg.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.answer?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-72">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search regulations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <button
          onClick={() => openModal()}
          disabled={isSubmitting}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all text-sm font-medium disabled:opacity-50"
        >
          <FaPlus size={14} /> Add Regulation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRegulations.map((reg) => (
          <div key={reg.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 border border-gray-100">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-800 text-base">{reg.question}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(reg.category)}`}>
                    {reg.category}
                  </span>
                  {reg.attachmentUrl && (
                    <a href={reg.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-500">
                      {getFileIcon(reg.attachmentUrl)}
                    </a>
                  )}
                </div>
              </div>
              <div className="flex gap-2 ml-2">
                <button onClick={() => openModal(reg)} className="p-1.5 text-gray-400 hover:text-blue-500"><FaEdit size={14} /></button>
                <button onClick={() => deleteRegulation(reg.id)} className="p-1.5 text-gray-400 hover:text-red-500"><FaTrash size={14} /></button>
              </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{reg.answer}</p>
            {reg.keywords && <p className="text-xs text-gray-400 mt-2">🔑 {reg.keywords}</p>}
          </div>
        ))}
      </div>

      {filteredRegulations.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No regulations found
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex justify-between items-center">
              <h2 className="text-lg font-bold">{editingRegulation ? 'Edit Regulation' : 'Add Regulation'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-600"><FaTimes size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question / Title</label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  disabled={isSubmitting}
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keywords (comma separated)</label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="registration, deadlines"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Answer / Content</label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source (optional)</label>
                <input
                  type="text"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  placeholder="Reference source"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attachment (PDF, Image)</label>
                <input
                  type="file"
                  onChange={(e) => setAttachmentFile(e.target.files[0])}
                  accept=".pdf,.jpg,.jpeg,.png,.gif"
                  className="w-full text-sm"
                  disabled={isSubmitting}
                />
                {attachmentFile && <p className="text-xs text-green-600 mt-1">Selected: {attachmentFile.name}</p>}
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50" disabled={isSubmitting}>Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegulationsManagement;