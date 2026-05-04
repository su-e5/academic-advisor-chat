// src/App.jsx
import { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./hooks/useAuth";
import { AuthProvider } from "./components/Auth/AuthProvider";
import ProtectedRoute from "./components/Common/ProtectedRoute";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import AIChatAssistant from "./components/Chat/AIChatAssistant";
import AdminDashboard from "./components/Admin/AdminDashboard";
import StudentsList from "./components/Advisor/StudentsList";
import StudentChatView from "./components/Advisor/StudentChatView";
import Profile from "./components/User/Profile";
import Header from "./components/Layout/Header";
import Sidebar from "./components/Layout/Sidebar";
import AdvisorAnalytics from "./components/Advisor/AdvisorAnalytics";
import RegulationsView from "./components/Student/RegulationsView";
import AdvisorMessages from "./components/Student/AdvisorMessages";
import RegistrationForm from "./components/Student/RegistrationForm";
import StudentRegistrations from "./components/Advisor/StudentRegistrations";

import { FaBars } from "react-icons/fa";

const AppContent = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const noSidebarPages = ["/chat"];
  const showSidebar = user && !noSidebarPages.includes(location.pathname);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const role = user?.role?.toLowerCase();

  if (location.pathname === "/chat") {
    return (
      <div className="min-h-screen bg-gray-50">
        {user && <Header />}
        <AIChatAssistant />
        <Toaster position="top-right" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50 flex flex-col"
      style={{ height: "100%" }}
    >
      {user && <Header />}

      <div className="flex flex-1" style={{ minHeight: 0 }}>
        {showSidebar && (
          <>
            {/* Mobile Menu Button - لون غامق عشان يبان */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden fixed bottom-6 right-6 z-50 p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-900 transition-all duration-200 hover:scale-110"
            >
              <FaBars size={20} />
            </button>

            {/* Mobile Sidebar Overlay - نفس الشيء */}
            <div
              className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${mobileSidebarOpen ? "visible" : "invisible"}`}
            >
              <div
                className={`absolute inset-0 bg-black transition-opacity duration-300 ${mobileSidebarOpen ? "opacity-50" : "opacity-0"}`}
                onClick={() => setMobileSidebarOpen(false)}
              />
              <div
                className={`absolute left-0 top-0 bottom-0 w-64 transform transition-transform duration-300 ease-out ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
              >
                <Sidebar onClose={() => setMobileSidebarOpen(false)} />
              </div>
            </div>

            {/* Desktop Sidebar - يظهر على lg فأكبر (أكبر من 1024px) */}
            <div
              className="hidden lg:block flex-shrink-0"
              style={{ height: "100%" }}
            >
              <Sidebar />
            </div>
          </>
        )}

        {/* Main Content - takes full height */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    {role === "admin" ? (
                      <Navigate to="/admin" replace />
                    ) : role === "advisor" ? (
                      <Navigate to="/advisor" replace />
                    ) : (
                      <Navigate to="/chat" replace />
                    )}
                  </ProtectedRoute>
                }
              />
              <Route
                path="/advisor/registrations"
                element={
                  <ProtectedRoute allowedRoles={["advisor", "admin"]}>
                    <StudentRegistrations />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/registration"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <RegistrationForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/advisor-chat"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <AdvisorMessages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/regulations"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/advisor"
                element={
                  <ProtectedRoute allowedRoles={["advisor"]}>
                    <StudentsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/advisor/chat/:studentId"
                element={
                  <ProtectedRoute allowedRoles={["advisor"]}>
                    <StudentChatView />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/regulations"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <RegulationsView />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/advisor/analytics"
                element={
                  <ProtectedRoute allowedRoles={["advisor"]}>
                    <AdvisorAnalytics />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </main>
      </div>

      <Toaster position="top-right" />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
