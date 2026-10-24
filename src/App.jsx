import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import AppLayout from "./components/layout/AppLayout";

// 12 PDF Views
import LoginPage from "./pages/LoginPage";
import StudentDashboard from "./pages/student/StudentDashboard";
import FeedbackFormPage from "./pages/student/FeedbackFormPage";
import FeedbackConfirmationPage from "./pages/student/FeedbackConfirmationPage";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import FeedbackAnalysisPage from "./pages/faculty/FeedbackAnalysisPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagementPage from "./pages/admin/UserManagementPage";
import CourseManagementPage from "./pages/admin/CourseManagementPage";
import FeedbackFormManagementPage from "./pages/admin/FeedbackFormManagementPage";
import ReportsAnalyticsPage from "./pages/admin/ReportsAnalyticsPage";
import ProfilePage from "./pages/common/ProfilePage";

function AppContent() {
  const { currentView } = useApp();

  const renderCurrentView = () => {
    switch (currentView) {
      case "login":
        return <LoginPage />;
      case "student-dashboard":
        return <StudentDashboard />;
      case "feedback-form":
        return <FeedbackFormPage />;
      case "feedback-confirmation":
        return <FeedbackConfirmationPage />;
      case "faculty-dashboard":
        return <FacultyDashboard />;
      case "feedback-analysis":
        return <FeedbackAnalysisPage />;
      case "admin-dashboard":
        return <AdminDashboard />;
      case "user-management":
        return <UserManagementPage />;
      case "course-management":
        return <CourseManagementPage />;
      case "feedback-form-management":
        return <FeedbackFormManagementPage />;
      case "reports-analytics":
        return <ReportsAnalyticsPage />;
      case "profile":
        return <ProfilePage />;
      default:
        return <StudentDashboard />;
    }
  };

  return <AppLayout>{renderCurrentView()}</AppLayout>;
}

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;