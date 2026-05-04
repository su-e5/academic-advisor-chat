// ============================================
// 2. src/components/Student/RegulationsView.jsx (كامل - للطالب)
// ============================================

import { useState, useEffect } from 'react';
import { getRegulations } from '../../services/api';
import { FaSearch, FaBook, FaGraduationCap, FaCalendarAlt, FaGavel, FaQuestionCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const RegulationsView = () => {
  const [regulations, setRegulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchRegulations = async () => {
      try {
        // ✅ الطالب يستخدم /api/Chat/regulations (من Chat Controller)
        const response = await getRegulations();
        console.log('Regulations fetched:', response.data);
        setRegulations(response.data || []);
      } catch (err) {
        console.error('Error fetching regulations:', err);
        if (err.response?.status === 403) {
          toast.error('You do not have permission to view regulations');
        } else {
          toast.error('Failed to load regulations');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRegulations();
  }, []);

  // استخراج الفئات الفريدة
  const categories = ['All', ...new Set(regulations.map(reg => reg.category))];

  // تصفية اللوائح
  const filteredRegulations = regulations.filter(reg => {
    const matchesSearch = (reg.question || reg.title || '')
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
      (reg.answer || reg.content || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || reg.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Courses':
        return <FaBook className="text-blue-500" />;
      case 'Registration':
        return <FaCalendarAlt className="text-green-500" />;
      case 'Grades':
        return <FaGraduationCap className="text-yellow-500" />;
      case 'Rules':
        return <FaGavel className="text-red-500" />;
      default:
        return <FaQuestionCircle className="text-gray-500" />;
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      Courses: 'bg-blue-100 text-blue-700',
      Registration: 'bg-green-100 text-green-700',
      Grades: 'bg-yellow-100 text-yellow-700',
      Rules: 'bg-red-100 text-red-700',
      General: 'bg-gray-100 text-gray-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Academic Regulations</h1>
        <p className="text-gray-500">Official academic policies, rules, and guidelines</p>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search regulations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1.5 text-sm rounded-full transition-all duration-200 ${
              selectedCategory === category
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Regulations List */}
      {filteredRegulations.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl">
          <FaBook className="mx-auto text-3xl mb-2 opacity-30" />
          <p>No regulations found</p>
          <p className="text-xs mt-1">Check back later for academic policies</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRegulations.map((reg) => (
            <div key={reg.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-5 border border-gray-100">
              <div className="flex items-start gap-3 mb-3">
                <div className="mt-1">
                  {getCategoryIcon(reg.category)}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-800 text-base">
                      {reg.question || reg.title}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(reg.category)}`}>
                      {reg.category}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {reg.answer || reg.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RegulationsView;