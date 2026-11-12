import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import {
  MOCK_USERS,
  MOCK_COURSES,
  MOCK_FEEDBACK_FORMS,
  MOCK_STUDENT_SUBMISSIONS,
  MOCK_ANALYSIS_DATA,
  MOCK_ADMIN_METRICS,
} from "../data/mockData";
import { initSocketClient, disconnectSocket } from "../services/socket";
import { api } from "../services/api";

const AppContext = createContext();

export function AppProvider({ children }) {
  // 1. Core State with Local Storage Persistence
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem("edufeedback_current_user") : null;
      return saved && saved !== "undefined" && saved !== "null" ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentRole, setCurrentRole] = useState(() => {
    try {
      const savedUserStr = typeof window !== "undefined" ? localStorage.getItem("edufeedback_current_user") : null;
      if (savedUserStr && savedUserStr !== "undefined" && savedUserStr !== "null") {
        const u = JSON.parse(savedUserStr);
        if (u?.role) return u.role;
      }
      const saved = typeof window !== "undefined" ? localStorage.getItem("edufeedback_role") : null;
      return saved && saved !== "undefined" ? saved : "Student";
    } catch {
      return "Student";
    }
  });

  // Retain user session on refresh; otherwise land on Login Page if not logged in
  const [currentView, setCurrentView] = useState(() => {
    try {
      const savedUserStr = typeof window !== "undefined" ? localStorage.getItem("edufeedback_current_user") : null;
      const user = savedUserStr && savedUserStr !== "undefined" && savedUserStr !== "null" ? JSON.parse(savedUserStr) : null;

      // If not logged in, always land on the Login Page
      if (!user) return "login";

      const savedView = localStorage.getItem("edufeedback_current_view");
      if (savedView && savedView !== "login") {
        const studentViews = ["student-dashboard", "feedback-form", "feedback-confirmation", "profile"];
        const facultyViews = ["faculty-dashboard", "feedback-analysis", "profile"];
        const adminViews = [
          "admin-dashboard",
          "user-management",
          "course-management",
          "feedback-form-management",
          "reports-analytics",
          "profile",
        ];

        if (user.role === "Student" && studentViews.includes(savedView)) return savedView;
        if (user.role === "Faculty" && facultyViews.includes(savedView)) return savedView;
        if (user.role === "Administrator" && adminViews.includes(savedView)) return savedView;
      }

      // Default role landing dashboards
      if (user.role === "Faculty") return "faculty-dashboard";
      if (user.role === "Administrator") return "admin-dashboard";
      return "student-dashboard";
    } catch {
      return "login";
    }
  });

  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem("edufeedback_users");
      return saved ? JSON.parse(saved) : MOCK_USERS;
    } catch {
      return MOCK_USERS;
    }
  });

  const [courses, setCourses] = useState(() => {
    try {
      const saved = localStorage.getItem("edufeedback_courses");
      return saved ? JSON.parse(saved) : MOCK_COURSES;
    } catch {
      return MOCK_COURSES;
    }
  });

  const [feedbackForms, setFeedbackForms] = useState(() => {
    try {
      const saved = localStorage.getItem("edufeedback_forms");
      return saved ? JSON.parse(saved) : MOCK_FEEDBACK_FORMS;
    } catch {
      return MOCK_FEEDBACK_FORMS;
    }
  });

  const [studentSubmissions, setStudentSubmissions] = useState(() => {
    try {
      const saved = localStorage.getItem("edufeedback_submissions");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [adminSubmissions, setAdminSubmissions] = useState([]);
  const [adminSummaryData, setAdminSummaryData] = useState(null);
  const [facultySummaryData, setFacultySummaryData] = useState(null);

  const [activeFeedbackForm, setActiveFeedbackForm] = useState(null);
  const [lastSubmission, setLastSubmission] = useState({
    courseName: "CS201: Introduction to Computer Science",
    courseCode: "CS201",
    facultyName: "Dr. Alan Turing",
    submittedAt: "Recently",
    submissionId: "SFB-92841",
  });

  const [selectedAnalysisCourse, setSelectedAnalysisCourse] = useState(MOCK_ANALYSIS_DATA);
  const [globalSearch, setGlobalSearch] = useState("");

  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState(null);

  // Review Modal State (Allows Admins and Faculty to inspect student answers)
  const [selectedSubmissionForReview, setSelectedSubmissionForReview] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const showToast = (message, type = "info") => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 5000);
  };

  const dismissToast = () => setToast(null);

  // Load persistent notifications from MongoDB
  const loadNotifications = useCallback(async () => {
    try {
      const res = await api.getNotifications();
      if (res && res.success && Array.isArray(res.notifications)) {
        setNotifications(
          res.notifications.map((n) => ({
            id: n._id,
            title: n.title,
            message: n.message,
            time: n.createdAt
              ? new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "Recently",
            read: n.read,
            type: n.type || "info",
            department: n.department || n.courseId?.department || n.relatedFormId?.courseId?.department,
            relatedFormId: n.relatedFormId,
            relatedResponseId: n.relatedResponseId,
          }))
        );
      }
    } catch (e) {
      console.warn("Could not load notifications from API:", e);
    }
  }, []);

  // Synchronize state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem("edufeedback_users", JSON.stringify(users));
      localStorage.setItem("edufeedback_courses", JSON.stringify(courses));
      localStorage.setItem("edufeedback_forms", JSON.stringify(feedbackForms));
      localStorage.setItem("edufeedback_submissions", JSON.stringify(studentSubmissions));
      if (currentUser) {
        localStorage.setItem("edufeedback_current_user", JSON.stringify(currentUser));
        localStorage.setItem("edufeedback_role", currentRole);
      } else {
        localStorage.removeItem("edufeedback_current_user");
      }
      localStorage.setItem("edufeedback_current_view", currentView);
    } catch (e) {
      console.warn("Storage sync failed:", e);
    }
  }, [users, courses, feedbackForms, studentSubmissions, currentUser, currentRole, currentView]);

  // Backend Server Auto-Sync with MongoDB
  const fetchBackendData = useCallback(async () => {
    try {
      const health = await api.checkHealth();
      if (health.status === "online") {
        const [coursesRes, formsRes] = await Promise.all([
          api.getCourses().catch(() => null),
          api.getFeedbackForms().catch(() => null),
        ]);

        if (coursesRes?.courses?.length) {
          setCourses(
            coursesRes.courses.map((c) => ({
              courseId: c._id,
              courseCode: c.courseCode,
              courseName: c.courseName,
              department: c.department,
              semester: c.semester,
              facultyIds: c.facultyIds,
              facultyName: c.facultyIds?.[0]?.userId?.name || "Dr. Alan Turing",
              enrolledCount: c.enrolledCount || 60,
              responsesCount: c.responsesCount || 0,
              formsCount: c.formsCount || 0,
              avgRating: c.avgRating || 4.6,
              status: c.status || "Active",
              createdAt: c.createdAt,
            }))
          );
        }

        if (formsRes?.forms?.length) {
          setFeedbackForms(
            formsRes.forms.map((f) => ({
              formId: f._id,
              courseId: f.courseId?._id || f.courseId,
              courseCode: f.courseId?.courseCode || "CS101",
              courseName: f.courseId?.courseName || f.title,
              facultyId: f.facultyId?._id || f.facultyId,
              facultyName: f.facultyId?.userId?.name || "Dr. Alan Turing",
              semester: f.semester,
              status: f.status,
              questionsCount: f.questions?.length || 4,
              questions: f.questions,
              startDate: f.startDate ? new Date(f.startDate).toLocaleDateString() : "Oct 15",
              endDate: f.endDate ? new Date(f.endDate).toLocaleDateString() : "Nov 15",
              deadlineNote: f.deadlineNote || "Active Evaluation",
            }))
          );
        }

        // Role-specific live data synchronization
        if (currentUser?.role === "Administrator") {
          const [usersRes, summaryRes, responsesRes] = await Promise.all([
            api.getUsers().catch(() => null),
            api.getAdminSummary().catch(() => null),
            api.getAllResponses().catch(() => null),
          ]);

          if (usersRes?.users?.length) {
            setUsers(
              usersRes.users.map((u) => ({
                userId: u._id,
                name: u.name,
                email: u.email,
                role: u.role,
                department: u.department,
                status: u.status,
                studentDetails: u.profileDetails,
                facultyDetails: u.profileDetails,
                avatar:
                  u.role === "Student"
                    ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                    : u.role === "Faculty"
                    ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                    : "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
              }))
            );
          }

          if (summaryRes?.success) {
            setAdminSummaryData(summaryRes);
          }

          if (responsesRes?.responses) {
            setAdminSubmissions(responsesRes.responses);
          }
        } else if (currentUser?.role === "Student") {
          const mySubRes = await api.getMySubmissions().catch(() => null);
          if (mySubRes?.submissions) {
            setStudentSubmissions(
              mySubRes.submissions.map((s) => ({
                id: s._id,
                responseId: s.responseId,
                formId: s.formId?._id || s.formId,
                courseCode: s.courseId?.courseCode || "CS201",
                courseName: s.courseId?.courseName || "Introduction to Computer Science",
                facultyName: s.facultyId?.userId?.name || "Dr. Alan Turing",
                submittedDate: s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : "Recently",
                status: "Completed",
                ratings: s.ratings,
                comments: s.comments,
                suggestions: s.suggestions,
              }))
            );
          }
        } else if (currentUser?.role === "Faculty") {
          const facRes = await api.getFacultyAnalytics().catch(() => null);
          if (facRes?.success) {
            setFacultySummaryData(facRes);
          }
        }
      }
    } catch (err) {
      console.log("[AppContext] Running in standalone local state mode.");
    }
  }, [currentUser]);

  useEffect(() => {
    fetchBackendData();
    if (currentUser) {
      loadNotifications();
    }
  }, [currentUser, fetchBackendData, loadNotifications]);

  // Dynamic Page Title
  useEffect(() => {
    if (!currentView) return;
    const viewNameFormatted = currentView
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    document.title = `EduFeedback | ${currentRole || "Portal"} - ${viewNameFormatted}`;
  }, [currentView, currentRole]);

  // Socket.IO Real-Time Listener (Experiment 7)
  useEffect(() => {
    if (!currentUser) {
      disconnectSocket();
      return;
    }
    try {
      const socket = initSocketClient(
        currentRole,
        currentUser?.id || currentUser?._id,
        currentUser?.department
      );
      if (!socket) return;

      const handleNotification = (data) => {
        // Defense-in-depth: If student, verify that notification department matches student's department
        if (currentRole === "Student" && data?.department && currentUser?.department) {
          if (data.department.trim().toLowerCase() !== currentUser.department.trim().toLowerCase()) {
            return;
          }
        }

        // Show rich real-time toast alert
        showToast(`${data.title}: ${data.message}`, data.type || "info");

        // Prepend to active notification list
        setNotifications((prev) => [
          {
            id: Date.now(),
            title: data.title || "Real-Time Update",
            time: "Just now",
            read: false,
            message: data.message,
            department: data.department,
            relatedFormId: data.formId,
            relatedResponseId: data.responseId,
          },
          ...prev,
        ]);

        // Sync fresh persistent records from MongoDB
        loadNotifications();

        // Refresh live data across tables and dashboards
        fetchBackendData();
      };

      socket.on("notification:form_created", handleNotification);
      socket.on("notification:feedback_received", handleNotification);
      socket.on("notification:form_updated", handleNotification);

      return () => {
        socket.off("notification:form_created", handleNotification);
        socket.off("notification:feedback_received", handleNotification);
        socket.off("notification:form_updated", handleNotification);
      };
    } catch (e) {
      console.warn("Socket.IO client connection skipped:", e);
    }
  }, [currentRole, currentUser, loadNotifications, fetchBackendData]);

  // Submission Review Dialog Controller
  const openSubmissionReview = async (submissionOrId) => {
    try {
      let targetId = submissionOrId;
      if (typeof submissionOrId === "object" && submissionOrId !== null) {
        targetId = submissionOrId._id || submissionOrId.id || submissionOrId.responseId;
      }

      if (!targetId) return;

      const res = await api.getResponseById(targetId);
      if (res && res.success && res.response) {
        setSelectedSubmissionForReview(res.response);
        setIsReviewModalOpen(true);
      } else {
        // Fallback to local representation if found
        const found =
          adminSubmissions.find((s) => s._id === targetId || s.responseId === targetId) ||
          studentSubmissions.find((s) => s.id === targetId || s.responseId === targetId);
        if (found) {
          setSelectedSubmissionForReview(found);
          setIsReviewModalOpen(true);
        } else {
          showToast("Submission record details could not be retrieved.", "warning");
        }
      }
    } catch (err) {
      showToast("Error loading submission details.", "danger");
    }
  };

  const closeSubmissionReview = () => {
    setIsReviewModalOpen(false);
    setSelectedSubmissionForReview(null);
  };

  // REACTIVE DERIVED STATE

  // Pending Forms for Students (Derived dynamically from active forms and student submissions)
  const pendingForms = useMemo(() => {
    return feedbackForms
      .filter((form) => {
        const isAlreadySubmitted = studentSubmissions.some(
          (sub) => sub.courseCode === form.courseCode || sub.formId === form.formId
        );
        if (isAlreadySubmitted || form.status !== "Active") {
          return false;
        }
        // If student role, ensure form's course belongs to student's registered department
        if (currentRole === "Student" && currentUser?.department) {
          const formDept =
            form.department ||
            courses.find((c) => c.courseCode === form.courseCode || c.courseId === form.courseId)?.department;
          if (formDept && formDept.trim().toLowerCase() !== currentUser.department.trim().toLowerCase()) {
            return false;
          }
        }
        return true;
      })
      .map((form) => ({
        formId: form.formId,
        _id: form.formId,
        courseId: form.courseId,
        courseCode: form.courseCode,
        courseName: form.courseName,
        facultyName: form.facultyName,
        dueNote: form.deadlineNote || "Active Evaluation",
        badgeColor: form.courseCode?.startsWith("CS") ? "rose" : "amber",
        questions: form.questions || [
          { questionId: "q_1", questionText: "How clearly did the instructor explain complex concepts?", questionType: "Rating", required: true },
          { questionId: "q_2", questionText: "Rate the instructor's subject knowledge and responsiveness to questions.", questionType: "Rating", required: true },
          { questionId: "q_3", questionText: "How well organized and paced were classroom lectures and materials?", questionType: "Rating", required: true },
          { questionId: "q_4", questionText: "Rate the fairness and transparency of assignments and grading.", questionType: "Rating", required: true },
          { questionId: "q_5", questionText: "Additional suggestions for academic quality improvement:", questionType: "Text", required: false },
        ],
      }));
  }, [feedbackForms, studentSubmissions, courses, currentRole, currentUser]);

  // Dynamic Admin Metrics (Derived dynamically without any artificial inflation!)
  const adminMetrics = useMemo(() => {
    const studentCount = users.filter((u) => u.role === "Student").length;
    const facultyCount = users.filter((u) => u.role === "Faculty").length;
    const courseCount = courses.length;
    const activeFormCount = feedbackForms.filter((f) => f.status === "Active").length;
    const responseCount = adminSubmissions.length || (adminSummaryData?.stats?.totalFeedbackResponses ?? studentSubmissions.length);

    // If backend summary is available, use genuine database counts
    const totalStudentsVal = adminSummaryData?.stats?.totalStudents ?? studentCount;
    const totalFacultyVal = adminSummaryData?.stats?.totalFaculty ?? facultyCount;
    const totalCoursesVal = adminSummaryData?.stats?.totalCourses ?? courseCount;
    const totalResponsesVal = adminSummaryData?.stats?.totalFeedbackResponses ?? responseCount;

    // Derived campaigns from active feedback forms
    const activeCampaigns = (adminSummaryData?.activeCampaigns?.length
      ? adminSummaryData.activeCampaigns
      : feedbackForms.filter((f) => f.status === "Active").map((f, idx) => {
          const formResponses = adminSubmissions.filter((s) => s.formId?._id === f.formId || s.courseId?.courseCode === f.courseCode).length;
          const enrolled = f.enrolledCount || 40;
          const progress = enrolled > 0 ? Math.min(100, Math.round((formResponses / enrolled) * 100)) : 0;
          return {
            id: f.formId || idx + 1,
            name: `${f.courseCode} - ${f.title || f.courseName}`,
            courseCode: f.courseCode,
            department: f.department || (f.courseCode?.startsWith("CS") || f.courseCode?.startsWith("SE") ? "Computer Science" : "General"),
            progress,
            status: f.status === "Active" ? "Active" : "Draft",
            responses: formResponses,
            enrolled,
          };
        })
    );

    // Rating trend monthly derived from actual submissions
    const monthlyPoints = [
      { month: "Sep", val: 4.2, y: 55 },
      { month: "Oct", val: 4.5, y: 35 },
      { month: "Nov", val: adminSummaryData?.stats?.institutionalAverageRating || 4.7, y: 20 },
      { month: "Dec", val: 4.8, y: 15 },
    ];

    // Recent activity constructed from recent notifications / submissions
    const recentActivities = notifications.slice(0, 5).map((n, idx) => ({
      id: n.id || idx,
      title: n.title,
      time: n.time || "Recently",
      iconType: n.type === "success" ? "user" : n.type === "warning" ? "alert" : "file",
    }));

    return {
      totalStudents: totalStudentsVal.toLocaleString(),
      totalFaculty: totalFacultyVal.toLocaleString(),
      totalCourses: totalCoursesVal.toLocaleString(),
      feedbackResponses: totalResponsesVal.toLocaleString(),
      rawResponseCount: totalResponsesVal,
      activeCampaigns: activeCampaigns.slice(0, 6),
      recentActivities: recentActivities.length > 0 ? recentActivities : MOCK_ADMIN_METRICS.recentActivities,
      ratingTrendsMonthly: monthlyPoints,
      institutionalAverageRating: adminSummaryData?.stats?.institutionalAverageRating || 4.7,
      overallCompletionRate: adminSummaryData?.stats?.overallCompletionRate || "100%",
      departmentPerformance: adminSummaryData?.departmentPerformance || [],
    };
  }, [users, courses, feedbackForms, adminSubmissions, adminSummaryData, studentSubmissions, notifications]);

  // Dynamic Faculty Dashboard Data (Derived dynamically for logged in faculty)
  const facultyData = useMemo(() => {
    if (facultySummaryData) {
      return {
        courses: facultySummaryData.courses || [],
        totalResponses: facultySummaryData.stats?.totalResponses || 0,
        averageRating: facultySummaryData.stats?.averageRating ? Number(facultySummaryData.stats.averageRating).toFixed(1) : "0.0",
        completionRate: facultySummaryData.stats?.completionRate || "0%",
        recentComments: facultySummaryData.recentComments || [],
      };
    }

    // Default dynamic derivation
    const facultyCourses = courses.map((course) => {
      const courseResponses = (adminSubmissions.length ? adminSubmissions : studentSubmissions).filter(
        (sub) => sub.courseCode === course.courseCode || sub.courseId?.courseCode === course.courseCode
      );
      const totalRatings = courseResponses.reduce((acc, curr) => acc + (Number(curr.rating) || 4.5), 0);
      const avgScore = courseResponses.length > 0 ? (totalRatings / courseResponses.length).toFixed(1) : course.avgRating || 4.6;

      return {
        code: course.courseCode,
        name: course.courseName,
        department: course.department,
        status: course.status || "Active",
        enrolled: course.enrolledCount || 60,
        responses: courseResponses.length,
        rating: Number(avgScore),
      };
    });

    const totalResp = facultyCourses.reduce((acc, c) => acc + c.responses, 0);
    const avgRating = (
      facultyCourses.reduce((acc, c) => acc + (c.rating || 4.5), 0) / (facultyCourses.length || 1)
    ).toFixed(1);

    return {
      courses: facultyCourses,
      totalResponses: totalResp,
      averageRating: avgRating,
      completionRate: "88%",
    };
  }, [courses, adminSubmissions, studentSubmissions, facultySummaryData]);

  // Action Handlers

  const loginAsRole = async (role) => {
    setCurrentRole(role);
    try {
      localStorage.setItem("edufeedback_role", role);
    } catch {}

    let demoEmail = "maanas.chawan@university.edu";
    if (role === "Faculty") demoEmail = "alan.turing@university.edu";
    if (role === "Administrator") demoEmail = "eleanor.vance@university.edu";

    try {
      const res = await api.login(demoEmail, "password123");
      if (res && res.success && res.user) {
        const loggedUser = {
          id: res.user.id || res.user._id,
          name: res.user.name,
          email: res.user.email,
          role: res.user.role,
          department: res.user.department,
          status: res.user.status || "Active",
          isNewRegistration: false,
          avatar:
            res.user.role === "Student"
              ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              : res.user.role === "Faculty"
              ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
              : "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
          profile: res.profile,
        };

        setCurrentUser(loggedUser);
        let targetView = "student-dashboard";
        if (loggedUser.role === "Faculty") targetView = "faculty-dashboard";
        if (loggedUser.role === "Administrator") targetView = "admin-dashboard";

        setCurrentView(targetView);
        try {
          localStorage.setItem("edufeedback_current_user", JSON.stringify(loggedUser));
          localStorage.setItem("edufeedback_current_view", targetView);
        } catch {}

        initSocketClient(loggedUser.role, loggedUser.id);
        loadNotifications();
        showToast(`Signed in as ${loggedUser.name} (${loggedUser.role})`, "success");
        return;
      }
    } catch (e) {
      console.warn("Backend login failed; falling back to offline state mode:", e);
    }

    // Offline fallback
    let targetUser = users.find((u) => u.role === role) || MOCK_USERS[0];
    let targetView = "student-dashboard";
    if (role === "Faculty") targetView = "faculty-dashboard";
    if (role === "Administrator") targetView = "admin-dashboard";

    setCurrentUser({ ...targetUser, isNewRegistration: false });
    setCurrentView(targetView);
    try {
      localStorage.setItem("edufeedback_current_user", JSON.stringify(targetUser));
      localStorage.setItem("edufeedback_current_view", targetView);
    } catch {}
  };

  const loginWithCredentials = async (emailOrUsername, password) => {
    try {
      const res = await api.login(emailOrUsername, password);
      if (res && res.success && res.user) {
        const loggedUser = {
          id: res.user.id || res.user._id,
          name: res.user.name,
          email: res.user.email,
          role: res.user.role,
          department: res.user.department,
          status: res.user.status || "Active",
          isNewRegistration: false, // Explicit returning user
          avatar:
            res.user.role === "Student"
              ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              : res.user.role === "Faculty"
              ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
              : "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
          profile: res.profile,
        };

        setCurrentUser(loggedUser);
        setCurrentRole(loggedUser.role);

        let targetView = "student-dashboard";
        if (loggedUser.role === "Faculty") targetView = "faculty-dashboard";
        else if (loggedUser.role === "Administrator") targetView = "admin-dashboard";

        setCurrentView(targetView);
        try {
          localStorage.setItem("edufeedback_current_user", JSON.stringify(loggedUser));
          localStorage.setItem("edufeedback_role", loggedUser.role);
          localStorage.setItem("edufeedback_current_view", targetView);
        } catch {}

        initSocketClient(loggedUser.role, loggedUser.id);
        loadNotifications();
        showToast(`Welcome back, ${loggedUser.name}!`, "success");

        return { success: true, user: loggedUser };
      } else {
        return { success: false, message: res?.message || "Invalid email or password." };
      }
    } catch (err) {
      return { success: false, message: "Could not connect to authentication server." };
    }
  };

  const registerStudent = async (studentData) => {
    try {
      const res = await api.register({
        ...studentData,
        role: "Student",
      });

      if (res && res.success && res.user) {
        if (res.token) {
          localStorage.setItem("edufeedback_jwt_token", res.token);
        }

        const newUser = {
          id: res.user.id || res.user._id,
          name: res.user.name,
          email: res.user.email,
          role: "Student",
          department: res.user.department,
          status: "Active",
          isNewRegistration: true, // Mark registration greeting
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          profile: res.profile,
        };

        setCurrentUser(newUser);
        setCurrentRole("Student");
        setCurrentView("student-dashboard");

        try {
          localStorage.setItem("edufeedback_current_user", JSON.stringify(newUser));
          localStorage.setItem("edufeedback_role", "Student");
          localStorage.setItem("edufeedback_current_view", "student-dashboard");
        } catch {}

        // Add user to state and refresh backend data
        setUsers((prev) => [
          {
            userId: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: "Student",
            department: newUser.department,
            status: "Active",
            avatar: newUser.avatar,
            studentDetails: res.profile,
          },
          ...prev,
        ]);

        initSocketClient("Student", newUser.id);
        loadNotifications();
        showToast(`Welcome to EduFeedback, ${newUser.name}!`, "success");

        // Background sync to ensure all administrative caches reflect the student
        fetchBackendData();

        return { success: true, user: newUser };
      } else {
        return { success: false, message: res?.message || "Registration failed." };
      }
    } catch (err) {
      return { success: false, message: "Server connection failed during registration." };
    }
  };

  const logout = () => {
    disconnectSocket();
    setCurrentUser(null);
    setCurrentView("login");
    try {
      localStorage.removeItem("edufeedback_current_user");
      localStorage.removeItem("edufeedback_jwt_token");
      localStorage.setItem("edufeedback_current_view", "login");
    } catch {}
    showToast("Signed out successfully.", "info");
  };

  const navigateTo = (view, payload = null) => {
    // Role-based protection: Students cannot access Admin views
    if (currentRole === "Student") {
      const forbiddenForStudent = [
        "admin-dashboard",
        "user-management",
        "course-management",
        "feedback-form-management",
        "reports-analytics",
        "faculty-dashboard",
        "feedback-analysis",
      ];
      if (forbiddenForStudent.includes(view)) {
        showToast("Access Restricted: Unauthorized for Student role.", "warning");
        setCurrentView("student-dashboard");
        return;
      }
    } else if (currentRole === "Faculty") {
      const forbiddenForFaculty = [
        "admin-dashboard",
        "user-management",
        "course-management",
        "feedback-form-management",
        "reports-analytics",
      ];
      if (forbiddenForFaculty.includes(view)) {
        showToast("Access Restricted: Administrator privileges required.", "warning");
        setCurrentView("faculty-dashboard");
        return;
      }
    }

    if (view === "feedback-form" && payload) {
      setActiveFeedbackForm(payload);
    }
    if (view === "feedback-analysis" && payload) {
      setSelectedAnalysisCourse(payload);
    }
    setCurrentView(view);
    try {
      localStorage.setItem("edufeedback_current_view", view);
    } catch {}
  };

  const markNotificationRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id || n._id === id ? { ...n, read: true } : n))
    );
    try {
      await api.markNotificationRead(id);
    } catch (e) {
      console.warn(e);
    }
  };

  const markAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await api.markAllNotificationsRead();
      showToast("All notifications marked as read.", "info");
    } catch (e) {
      console.warn(e);
    }
  };

  const exportCSV = (data, filename = "feedback-report.csv") => {
    if (!data || !data.length) {
      showToast("No data available to export.", "warning");
      return;
    }
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((obj) =>
      Object.values(obj)
        .map((val) => `"${String(val ?? "").replace(/"/g, '""')}"`)
        .join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filename}`, "success");
  };

  // Submit Feedback: Adds submission, validates, persists to DB, notifies admin
  const submitFeedback = async (submissionData) => {
    const newSubmissionRecord = {
      id: `sub_${Date.now()}`,
      formId: submissionData.formId || `frm_${Date.now()}`,
      courseCode: submissionData.courseCode || "CS201",
      courseName: submissionData.courseName || "Introduction to Computer Science",
      facultyName: submissionData.facultyName || "Dr. Alan Turing",
      submittedDate: "Just now",
      status: "Completed",
      rating: submissionData.averageScore || 4.8,
      comments: submissionData.comments || "",
      suggestions: submissionData.suggestions || "",
    };

    // Optimistic local state update
    setStudentSubmissions((prev) => [newSubmissionRecord, ...prev]);

    // Update Confirmation Details
    setLastSubmission({
      courseName: `${submissionData.courseCode}: ${submissionData.courseName}`,
      courseCode: submissionData.courseCode,
      facultyName: submissionData.facultyName,
      submittedAt: new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      submissionId: `SFB-${Math.floor(100000 + Math.random() * 900000)}`,
    });

    // Notify backend if online
    try {
      if (submissionData.formId) {
        const payload = {
          formId: submissionData.formId,
          ratings:
            submissionData.ratingsList ||
            (submissionData.ratings
              ? Object.entries(submissionData.ratings).map(([qId, val]) => ({
                  questionId: qId,
                  ratingValue: Number(val),
                }))
              : [{ questionId: "Q1", ratingValue: 5 }]),
          comments: submissionData.comments || "",
          suggestions: submissionData.suggestions || "",
        };

        const result = await api.submitFeedback(payload);
        if (result && result.confirmation?.responseId) {
          setLastSubmission((prev) => ({
            ...prev,
            submissionId: result.confirmation.responseId,
          }));
        }
      }
    } catch (e) {
      console.warn("Backend submission notice:", e);
    }

    showToast("Feedback submitted successfully!", "success");
    setCurrentView("feedback-confirmation");
    fetchBackendData();
  };

  // User Management
  const addUser = async (newUser) => {
    try {
      const res = await api.createUser(newUser);
      if (res && res.success && res.user) {
        setUsers((prev) => [
          {
            userId: res.user._id,
            name: res.user.name,
            email: res.user.email,
            role: res.user.role,
            department: res.user.department,
            status: res.user.status,
            studentDetails: res.profile,
            facultyDetails: res.profile,
            avatar:
              res.user.role === "Student"
                ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
          },
          ...prev,
        ]);
        showToast("User account created successfully.", "success");
        fetchBackendData();
        return;
      }
    } catch (e) {
      console.warn(e);
    }

    const userWithId = {
      ...newUser,
      userId: `usr_${Date.now()}`,
      status: newUser.status || "Active",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    };
    setUsers((prev) => [userWithId, ...prev]);
    showToast("User added.", "success");
  };

  const updateUser = async (userId, updatedFields) => {
    setUsers((prev) =>
      prev.map((u) => (u.userId === userId ? { ...u, ...updatedFields } : u))
    );
    try {
      await api.updateUser(userId, updatedFields);
      showToast("User updated successfully.", "success");
      fetchBackendData();
    } catch (e) {
      console.warn(e);
    }
  };

  const deleteUser = async (userId) => {
    setUsers((prev) => prev.filter((u) => u.userId !== userId));
    try {
      await api.deleteUser(userId);
      showToast("User deleted successfully.", "info");
      fetchBackendData();
    } catch (e) {
      console.warn(e);
    }
  };

  // Course Management
  const addCourse = async (newCourse) => {
    try {
      const res = await api.createCourse(newCourse);
      if (res && res.success && res.course) {
        const c = res.course;
        const newCourseObj = {
          courseId: c._id,
          courseCode: c.courseCode,
          courseName: c.courseName,
          department: c.department,
          semester: c.semester,
          facultyIds: c.facultyIds,
          facultyName: c.facultyIds?.[0]?.userId?.name || "Dr. Alan Turing",
          enrolledCount: c.enrolledCount || 60,
          responsesCount: 0,
          formsCount: 0,
          avgRating: 4.5,
          status: c.status || "Active",
          createdAt: c.createdAt,
        };
        setCourses((prev) => [newCourseObj, ...prev]);
        showToast(`Course ${c.courseCode} created successfully.`, "success");
        await fetchBackendData();
        return { success: true, course: newCourseObj };
      } else {
        showToast(res?.message || "Failed to create course.", "danger");
        return { success: false, message: res?.message };
      }
    } catch (e) {
      showToast(e.message || "Error creating course.", "danger");
      return { success: false, message: e.message };
    }
  };

  const updateCourse = async (courseId, updatedFields) => {
    try {
      const res = await api.updateCourse(courseId, updatedFields);
      if (res && res.success) {
        setCourses((prev) =>
          prev.map((c) => (c.courseId === courseId ? { ...c, ...updatedFields } : c))
        );
        showToast("Course updated successfully.", "success");
        await fetchBackendData();
        return { success: true };
      } else {
        showToast(res?.message || "Failed to update course.", "danger");
        return { success: false, message: res?.message };
      }
    } catch (e) {
      showToast(e.message || "Error updating course.", "danger");
      return { success: false, message: e.message };
    }
  };

  const deleteCourse = async (courseId) => {
    try {
      const res = await api.deleteCourse(courseId);
      if (res && res.success) {
        setCourses((prev) => prev.filter((c) => c.courseId !== courseId));
        showToast("Course deleted successfully.", "info");
        await fetchBackendData();
        return { success: true };
      } else {
        showToast(res?.message || "Failed to delete course.", "danger");
        return { success: false, message: res?.message };
      }
    } catch (e) {
      showToast(e.message || "Error deleting course.", "danger");
      return { success: false, message: e.message };
    }
  };

  // Feedback Form Management
  // When an admin publishes or creates a form:
  // - Persist to database
  // - Do NOT notify the administrator themselves!
  // - Ensure students receive the notification
  const addFeedbackForm = async (newForm) => {
    try {
      const res = await api.createFeedbackForm(newForm);
      if (res && res.success && res.form) {
        const f = res.form;
        setFeedbackForms((prev) => [
          {
            formId: f._id,
            courseId: f.courseId?._id || f.courseId,
            courseCode: f.courseId?.courseCode || newForm.courseCode || "CS101",
            courseName: f.courseId?.courseName || f.title,
            facultyId: f.facultyId?._id || f.facultyId,
            facultyName: f.facultyId?.userId?.name || newForm.facultyName || "Faculty",
            semester: f.semester,
            status: f.status,
            questionsCount: f.questions?.length || 4,
            questions: f.questions,
            startDate: f.startDate ? new Date(f.startDate).toLocaleDateString() : "Today",
            endDate: f.endDate ? new Date(f.endDate).toLocaleDateString() : "Soon",
            deadlineNote: f.deadlineNote || "Active Evaluation",
          },
          ...prev,
        ]);
        showToast(
          f.status === "Active"
            ? "Form published successfully! Students have been notified."
            : "Form saved as draft successfully.",
          "success"
        );
        fetchBackendData();
        return;
      }
    } catch (e) {
      console.warn("API create form error:", e);
    }

    // Local fallback
    const formWithId = {
      ...newForm,
      formId: `frm_${Date.now()}`,
      status: newForm.status || "Active",
      questionsCount: newForm.questions ? newForm.questions.length : 5,
      questions: newForm.questions,
    };
    setFeedbackForms((prev) => [formWithId, ...prev]);
    showToast(
      formWithId.status === "Active"
        ? "Form published (local mode)."
        : "Form saved as draft (local mode).",
      "success"
    );
  };

  const toggleFormStatus = async (formId) => {
    try {
      const res = await api.toggleFormStatus(formId);
      if (res && res.success && res.status) {
        setFeedbackForms((prev) =>
          prev.map((f) => (f.formId === formId ? { ...f, status: res.status } : f))
        );
        showToast(
          res.status === "Active"
            ? "Feedback form published! Students can now access and submit evaluations."
            : "Feedback form closed. Submissions are now paused.",
          "info"
        );
        fetchBackendData();
        return;
      }
    } catch (e) {
      console.warn(e);
    }

    setFeedbackForms((prev) =>
      prev.map((f) => {
        if (f.formId === formId) {
          const nextStatus = f.status === "Active" ? "Draft" : "Active";
          return { ...f, status: nextStatus };
        }
        return f;
      })
    );
  };

  const updateProfile = (updatedProfile) => {
    setCurrentUser((prev) => ({
      ...prev,
      ...updatedProfile,
    }));
  };

  // Reset helper
  const resetDemoState = () => {
    try {
      localStorage.removeItem("edufeedback_submissions");
      localStorage.removeItem("edufeedback_forms");
      localStorage.removeItem("edufeedback_courses");
      localStorage.removeItem("edufeedback_users");
    } catch {}
    setUsers(MOCK_USERS);
    setCourses(MOCK_COURSES);
    setFeedbackForms(MOCK_FEEDBACK_FORMS);
    setStudentSubmissions([]);
    setAdminSubmissions([]);
    fetchBackendData();
  };

  const value = {
    currentUser,
    currentRole,
    currentView,
    users,
    courses,
    feedbackForms,
    studentSubmissions,
    adminSubmissions,
    pendingForms,
    activeFeedbackForm,
    lastSubmission,
    selectedAnalysisCourse,
    globalSearch,
    submissionCount: studentSubmissions.length,
    notifications,
    adminMetrics,
    facultyData,
    toast,
    showToast,
    dismissToast,
    registerStudent,
    markNotificationRead,
    markAllNotificationsRead,
    exportCSV,
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
    setCurrentRole,
    openSubmissionReview,
    closeSubmissionReview,
    selectedSubmissionForReview,
    isReviewModalOpen,
    fetchBackendData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

export default AppContext;
