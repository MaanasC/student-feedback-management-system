import React, { createContext, useContext, useState, useEffect } from "react";
import {
  MOCK_USERS,
  MOCK_COURSES,
  MOCK_FEEDBACK_FORMS,
  MOCK_STUDENT_SUBMISSIONS,
  MOCK_ANALYSIS_DATA,
  MOCK_ADMIN_METRICS,
} from "../data/mockData";

// [Concept: createContext() - State Management using Context API]
const AppContext = createContext();

export function AppProvider({ children }) {
  // [Concept: useState() - Managing shared application state with safe localStorage fallback]
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem("edufeedback_current_user") : null;
      return saved && saved !== "undefined" && saved !== "null" ? JSON.parse(saved) : MOCK_USERS[0];
    } catch {
      return MOCK_USERS[0];
    }
  });

  const [currentRole, setCurrentRole] = useState(() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem("edufeedback_role") : null;
      return saved && saved !== "undefined" ? saved : "Student";
    } catch {
      return "Student";
    }
  });

  const [currentView, setCurrentView] = useState("student-dashboard");

  const [users, setUsers] = useState(MOCK_USERS);
  const [courses, setCourses] = useState(MOCK_COURSES);
  const [feedbackForms, setFeedbackForms] = useState(MOCK_FEEDBACK_FORMS);

  const [studentSubmissions, setStudentSubmissions] = useState(() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem("edufeedback_submissions") : null;
      return saved && saved !== "undefined" && saved !== "null" ? JSON.parse(saved) : MOCK_STUDENT_SUBMISSIONS;
    } catch {
      return MOCK_STUDENT_SUBMISSIONS;
    }
  });

  const [pendingForms, setPendingForms] = useState(() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem("edufeedback_pending_forms") : null;
      if (saved && saved !== "undefined" && saved !== "null") {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return [
      {
        formId: "frm_001",
        courseCode: "CS301",
        courseName: "Data Structures & Algorithms",
        facultyName: "Prof. Alan Turing",
        dueNote: "Due in 2 days",
        badgeColor: "rose"
      },
      {
        formId: "frm_002",
        courseCode: "SE401",
        courseName: "Web Development Frameworks",
        facultyName: "Prof. Grace Hopper",
        dueNote: "Due in 5 days",
        badgeColor: "amber"
      }
    ];
  });

  const [activeFeedbackForm, setActiveFeedbackForm] = useState(MOCK_FEEDBACK_FORMS[0]);

  const [lastSubmission, setLastSubmission] = useState({
    courseName: "CS201: Introduction to Computer Science",
    courseCode: "CS201",
    facultyName: "Dr. Alan Turing",
    submittedAt: "October 24, 2026",
    submissionId: "SFB-92841"
  });

  const [selectedAnalysisCourse, setSelectedAnalysisCourse] = useState(MOCK_ANALYSIS_DATA);
  const [globalSearch, setGlobalSearch] = useState("");
  const [submissionCount, setSubmissionCount] = useState(studentSubmissions.length);

  // Notifications state
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Evaluation cycle started", time: "10m ago", read: false },
    { id: 2, title: "Reminder: Submit CS301 feedback", time: "1h ago", read: false },
    { id: 3, title: "Faculty ratings published", time: "1d ago", read: true }
  ]);

  // [Concept: useEffect() - Side Effect 1: Synchronizing state changes with localStorage safely]
  useEffect(() => {
    try {
      localStorage.setItem("edufeedback_submissions", JSON.stringify(studentSubmissions));
      localStorage.setItem("edufeedback_pending_forms", JSON.stringify(pendingForms));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
    setSubmissionCount(studentSubmissions.length);
  }, [studentSubmissions, pendingForms]);

  // [Concept: useEffect() - Side Effect 2: Dynamic Document Title side effect]
  useEffect(() => {
    if (!currentView) return;
    const viewNameFormatted = currentView
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    document.title = `EduFeedback | ${currentRole || "Portal"} - ${viewNameFormatted}`;
  }, [currentView, currentRole]);

  // [Concept: State update function - Switching role and updating user profile]
  const loginAsRole = (role) => {
    setCurrentRole(role);
    try {
      localStorage.setItem("edufeedback_role", role);
    } catch {}

    if (role === "Student") {
      const u = users.find((u) => u.role === "Student") || MOCK_USERS[0];
      setCurrentUser(u);
      setCurrentView("student-dashboard");
    } else if (role === "Faculty") {
      const u = users.find((u) => u.role === "Faculty") || MOCK_USERS[1];
      setCurrentUser(u);
      setCurrentView("faculty-dashboard");
    } else if (role === "Administrator") {
      const u = users.find((u) => u.role === "Administrator") || MOCK_USERS[3];
      setCurrentUser(u);
      setCurrentView("admin-dashboard");
    }
  };

  const loginWithCredentials = (emailOrUsername, password, roleChoice) => {
    const role = roleChoice || "Student";
    const found = users.find(
      (u) =>
        u.email.toLowerCase() === emailOrUsername.toLowerCase() ||
        u.name.toLowerCase().includes(emailOrUsername.toLowerCase())
    );
    const targetUser = found || users.find((u) => u.role === role) || MOCK_USERS[0];
    setCurrentUser(targetUser);
    setCurrentRole(targetUser.role);
    try {
      localStorage.setItem("edufeedback_role", targetUser.role);
    } catch {}

    if (targetUser.role === "Student") setCurrentView("student-dashboard");
    else if (targetUser.role === "Faculty") setCurrentView("faculty-dashboard");
    else setCurrentView("admin-dashboard");
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentView("login");
  };

  const navigateTo = (view, payload = null) => {
    if (view === "feedback-form" && payload) {
      setActiveFeedbackForm(payload);
    }
    if (view === "feedback-analysis" && payload) {
      setSelectedAnalysisCourse(payload);
    }
    setCurrentView(view);
  };

  // [Concept: State Update Function & Feedback Submission (Equivalent to Event Registration)]
  const submitFeedback = (submissionData) => {
    const newSubmissionRecord = {
      id: `sub_${Date.now()}`,
      courseCode: submissionData.courseCode || "CS201",
      courseName: submissionData.courseName || "Introduction to Computer Science",
      facultyName: submissionData.facultyName || "Dr. Alan Turing",
      submittedDate: "Just now",
      status: "Completed",
      rating: submissionData.averageScore || 4.8
    };

    setStudentSubmissions((prev) => [newSubmissionRecord, ...prev]);
    setPendingForms((prev) =>
      prev.filter((item) => item.courseCode !== submissionData.courseCode)
    );

    const submissionConfirmation = {
      courseName: `${submissionData.courseCode}: ${submissionData.courseName}`,
      courseCode: submissionData.courseCode,
      facultyName: submissionData.facultyName,
      submittedAt: new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      }),
      submissionId: `SFB-${Math.floor(100000 + Math.random() * 900000)}`
    };

    setLastSubmission(submissionConfirmation);
    setCurrentView("feedback-confirmation");
  };

  // Admin user management functions
  const addUser = (newUser) => {
    const userWithId = {
      ...newUser,
      userId: `usr_${Date.now()}`,
      status: newUser.status || "Active",
      avatar: newUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    };
    setUsers((prev) => [userWithId, ...prev]);
  };

  const updateUser = (userId, updatedFields) => {
    setUsers((prev) =>
      prev.map((u) => (u.userId === userId ? { ...u, ...updatedFields } : u))
    );
  };

  const deleteUser = (userId) => {
    setUsers((prev) => prev.filter((u) => u.userId !== userId));
  };

  const addCourse = (newCourse) => {
    const courseWithId = {
      ...newCourse,
      courseId: `crs_${Date.now()}`,
      enrolledCount: newCourse.enrolledCount || 60,
      responsesCount: 0,
      avgRating: null,
      status: newCourse.status || "Active"
    };
    setCourses((prev) => [courseWithId, ...prev]);
  };

  const updateCourse = (courseId, updatedFields) => {
    setCourses((prev) =>
      prev.map((c) => (c.courseId === courseId ? { ...c, ...updatedFields } : c))
    );
  };

  const deleteCourse = (courseId) => {
    setCourses((prev) => prev.filter((c) => c.courseId !== courseId));
  };

  const addFeedbackForm = (newForm) => {
    const formWithId = {
      ...newForm,
      formId: `frm_${Date.now()}`,
      status: newForm.status || "Active",
      questionsCount: newForm.questions ? newForm.questions.length : 4
    };
    setFeedbackForms((prev) => [formWithId, ...prev]);
  };

  const toggleFormStatus = (formId) => {
    setFeedbackForms((prev) =>
      prev.map((f) => {
        if (f.formId === formId) {
          const nextStatus = f.status === "Active" ? "Inactive" : "Active";
          return { ...f, status: nextStatus };
        }
        return f;
      })
    );
  };

  const updateProfile = (updatedProfile) => {
    setCurrentUser((prev) => ({
      ...prev,
      ...updatedProfile
    }));
  };

  // Reset demo data helper
  const resetDemoState = () => {
    try {
      localStorage.removeItem("edufeedback_submissions");
      localStorage.removeItem("edufeedback_pending_forms");
      localStorage.removeItem("edufeedback_current_user");
    } catch {}
    setStudentSubmissions(MOCK_STUDENT_SUBMISSIONS);
    setPendingForms([
      {
        formId: "frm_001",
        courseCode: "CS301",
        courseName: "Data Structures & Algorithms",
        facultyName: "Prof. Alan Turing",
        dueNote: "Due in 2 days",
        badgeColor: "rose"
      },
      {
        formId: "frm_002",
        courseCode: "SE401",
        courseName: "Web Development Frameworks",
        facultyName: "Prof. Grace Hopper",
        dueNote: "Due in 5 days",
        badgeColor: "amber"
      }
    ]);
  };

  const value = {
    currentUser,
    currentRole,
    currentView,
    users,
    courses,
    feedbackForms,
    studentSubmissions,
    pendingForms,
    activeFeedbackForm,
    lastSubmission,
    selectedAnalysisCourse,
    globalSearch,
    submissionCount,
    notifications,
    adminMetrics: MOCK_ADMIN_METRICS,
    setGlobalSearch,
    setNotifications,
    loginAsRole,
    loginWithCredentials,
    logout,
    navigateTo,
    submitFeedback,
    addUser,
    updateUser,
    deleteUser,
    addCourse,
    updateCourse,
    deleteCourse,
    addFeedbackForm,
    toggleFormStatus,
    updateProfile,
    resetDemoState,
    setCurrentRole
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// [Concept: useContext() - Custom hook for accessing context]
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
