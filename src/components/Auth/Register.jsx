// src/components/Auth/Register.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaUser, FaGraduationCap, FaArrowRight, FaRobot, FaUniversity, FaBook, FaPhone, FaTelegram, FaChartLine } from "react-icons/fa";
import toast from "react-hot-toast";
import { register, getUniversityEmails } from "../../services/api";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [universityEmails, setUniversityEmails] = useState([]);
  const [customEmail, setCustomEmail] = useState('');
  const [showCustomEmail, setShowCustomEmail] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    universityEmail: "",
    password: "",
    confirmPassword: "",
    role: "student",
    department: "",
    academicLevel: 1,
    gpa: 0,
    phoneNumber: "",
    telegramUsername: "",
  });

  const academicLevels = [
    { value: 1, label: "First Year - Level 1" },
    { value: 2, label: "Second Year - Level 2" },
    { value: 3, label: "Third Year - Level 3" },
    { value: 4, label: "Fourth Year - Level 4" },
  ];

  const departments = [
    "Computer Science",
    "Information Technology",
    "Information Systems",
    "Artificial Intelligence",
    "Cybersecurity",
    "BioInformatics",
  ];

  // جلب الإيميلات الجامعية المسموحة
  useEffect(() => {
    const fetchUniversityEmails = async () => {
      try {
        const response = await getUniversityEmails();
        setUniversityEmails(response.data || []);
      } catch (err) {
        console.error('Error fetching university emails:', err);
      }
    };
    fetchUniversityEmails();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEmailSelect = (email) => {
    setFormData({ ...formData, universityEmail: email });
    setShowCustomEmail(false);
    setCustomEmail('');
  };

  const handleCustomEmail = () => {
    if (customEmail && customEmail.includes('@')) {
      setFormData({ ...formData, universityEmail: customEmail });
      setShowCustomEmail(false);
    } else {
      toast.error('Please enter a valid email');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    if (!formData.universityEmail) {
      toast.error("University email is required");
      return;
    }
    
    setLoading(true);
    
    try {
      const registerResponse = await register({
        fullName: formData.fullName,
        email: formData.email,
        universityEmail: formData.universityEmail,
        password: formData.password,
        role: "Student",
        department: formData.department,
        academicLevel: formData.academicLevel,
        gpa: formData.gpa,
        phoneNumber: formData.phoneNumber,
        telegramUsername: formData.telegramUsername,
      });
      
      console.log("Registration response:", registerResponse);
      
      if (registerResponse.status === 200 || registerResponse.status === 201) {
        toast.success("Registration successful! Please login.");
        navigate("/login");
      } else {
        toast.error(registerResponse.data?.error || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      toast.error(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 overflow-hidden">
      <div className="bg-white/30 backdrop-blur-xl p-5 sm:p-6 rounded-2xl shadow-2xl w-full max-w-md border border-white/40">
        <div className="text-center mb-5">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-600 flex items-center justify-center shadow-lg">
            <FaRobot className="text-white text-2xl" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 via-purple-500 to-violet-600 bg-clip-text text-transparent">
            Create Account
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">Join UniGuide as a student</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
            <div className="relative group">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2 text-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/50"
                placeholder="Ahmed Ali"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Personal Email</label>
            <div className="relative group">
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2 text-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/50"
                placeholder="student@gmail.com"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">University Email</label>
            <div className="relative group">
              <FaUniversity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              {!showCustomEmail ? (
                <select
                  value={formData.universityEmail}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setShowCustomEmail(true);
                    } else {
                      handleEmailSelect(e.target.value);
                    }
                  }}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/50 appearance-none"
                  disabled={loading}
                >
                  <option value="">Select university email</option>
                  {universityEmails.map((email) => (
                    <option key={email.id} value={email.email}>{email.email}</option>
                  ))}
                  <option value="__custom__">+ Add custom email</option>
                </select>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="Enter your university email"
                    className="flex-1 pl-9 pr-3 py-2 text-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/50"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={handleCustomEmail}
                    className="px-2 py-1 bg-purple-600 text-white rounded-xl text-xs"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomEmail(false);
                      setCustomEmail('');
                    }}
                    className="px-2 py-1 bg-gray-500 text-white rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
            <div className="relative group">
              <FaBook className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2 text-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/50 appearance-none"
                required
                disabled={loading}
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Academic Level</label>
            <div className="relative group">
              <FaGraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <select
                name="academicLevel"
                value={formData.academicLevel}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2 text-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/50 appearance-none"
                required
                disabled={loading}
              >
                {academicLevels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">GPA (0.0 - 4.0)</label>
            <div className="relative group">
              <FaChartLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="number"
                name="gpa"
                step="0.01"
                min="0"
                max="4"
                value={formData.gpa}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2 text-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/50"
                placeholder="3.5"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number (WhatsApp)</label>
            <div className="relative group">
              <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2 text-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/50"
                placeholder="+20123456789"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Telegram Username</label>
            <div className="relative group">
              <FaTelegram className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                name="telegramUsername"
                value={formData.telegramUsername}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2 text-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/50"
                placeholder="@username"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
            <div className="relative group">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-9 pr-9 py-2 text-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/50"
                placeholder="••••••••"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-500 text-sm"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative group">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2 text-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/50"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full py-2.5 bg-gradient-to-r from-purple-600 via-purple-500 to-violet-600 text-white rounded-xl font-semibold overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-0.5 disabled:opacity-50 text-sm"
          >
            <span className="relative flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Sign Up</span>
                  <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </span>
          </button>
        </form>

        <p className="text-center mt-4 text-gray-500 text-xs">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-500 hover:text-purple-600 font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;