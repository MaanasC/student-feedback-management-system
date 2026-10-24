// Mock data conforming to Section 9 (Database Design & Schemas) of the project documentation

export const MOCK_USERS = [
  {
    userId: "usr_001",
    name: "Maanas Chawan",
    email: "maanas.chawan@university.edu",
    role: "Student",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    studentDetails: {
      studentId: "stu_001",
      rollNo: "D15A-08",
      department: "Computer Science",
      semester: "5th Semester",
      academicYear: "2024-2025"
    }
  },
  {
    userId: "usr_002",
    name: "Dr. Alan Turing",
    email: "alan.turing@university.edu",
    role: "Faculty",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    facultyDetails: {
      facultyId: "fac_001",
      department: "Computer Science",
      designation: "Professor & Senior Researcher",
      coursesHandled: ["crs_cs101", "crs_cs201", "crs_cs301"]
    }
  },
  {
    userId: "usr_003",
    name: "Prof. Grace Hopper",
    email: "grace.hopper@university.edu",
    role: "Faculty",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    facultyDetails: {
      facultyId: "fac_002",
      department: "Computer Science",
      designation: "Associate Professor",
      coursesHandled: ["crs_se401", "crs_cs401"]
    }
  },
  {
    userId: "usr_004",
    name: "Dr. Eleanor Vance",
    email: "eleanor.vance@university.edu",
    role: "Administrator",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    adminDetails: {
      department: "Academic Affairs",
      designation: "Dean of Academic Quality"
    }
  },
  {
    userId: "usr_005",
    name: "Dr. Sarah Jenkins",
    email: "s.jenkins@university.edu",
    role: "Faculty",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    facultyDetails: {
      facultyId: "fac_003",
      department: "Computer Science",
      designation: "Assistant Professor",
      coursesHandled: ["crs_cs220"]
    }
  },
  {
    userId: "usr_006",
    name: "Marcus Rodriguez",
    email: "m.rodriguez@university.edu",
    role: "Administrator",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    adminDetails: {
      department: "IT Services",
      designation: "System Administrator"
    }
  },
  {
    userId: "usr_007",
    name: "Elena Rostova",
    email: "erostova24@student.edu",
    role: "Student",
    status: "Pending",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    studentDetails: {
      studentId: "stu_002",
      rollNo: "D15A-19",
      department: "Engineering",
      semester: "3rd Semester",
      academicYear: "2024-2025"
    }
  },
  {
    userId: "usr_008",
    name: "Prof. David Chen",
    email: "d.chen@university.edu",
    role: "Faculty",
    status: "Inactive",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    facultyDetails: {
      facultyId: "fac_004",
      department: "Mathematics",
      designation: "Lecturer",
      coursesHandled: ["crs_mth202"]
    }
  }
];

export const MOCK_COURSES = [
  {
    courseId: "crs_cs101",
    courseCode: "CS101",
    courseName: "Introduction to Computer Science",
    department: "Computer Science",
    semester: "Fall 2024",
    facultyIds: ["fac_001"],
    facultyNames: ["Dr. Alan Turing"],
    enrolledCount: 160,
    responsesCount: 142,
    avgRating: 4.6,
    status: "Active"
  },
  {
    courseId: "crs_cs201",
    courseCode: "CS201",
    courseName: "Introduction to Computer Science II",
    department: "Computer Science",
    semester: "Fall 2024",
    facultyIds: ["fac_001"],
    facultyNames: ["Dr. Alan Turing"],
    enrolledCount: 110,
    responsesCount: 94,
    avgRating: 4.7,
    status: "Active"
  },
  {
    courseId: "crs_cs301",
    courseCode: "CS301",
    courseName: "Data Structures & Algorithms",
    department: "Computer Science",
    semester: "Fall 2024",
    facultyIds: ["fac_001"],
    facultyNames: ["Dr. Alan Turing"],
    enrolledCount: 140,
    responsesCount: 88,
    avgRating: 4.5,
    status: "Active"
  },
  {
    courseId: "crs_se401",
    courseCode: "SE401",
    courseName: "Web Development Frameworks",
    department: "Computer Science",
    semester: "Fall 2024",
    facultyIds: ["fac_002"],
    facultyNames: ["Prof. Grace Hopper"],
    enrolledCount: 95,
    responsesCount: 72,
    avgRating: 4.8,
    status: "Active"
  },
  {
    courseId: "crs_cs401",
    courseCode: "CS401",
    courseName: "Advanced Software Engineering",
    department: "Computer Science",
    semester: "Fall 2024",
    facultyIds: ["fac_002"],
    facultyNames: ["Prof. Grace Hopper"],
    enrolledCount: 45,
    responsesCount: 38,
    avgRating: 4.8,
    status: "Active"
  },
  {
    courseId: "crs_cs220",
    courseCode: "CS220",
    courseName: "Data Structures & Algorithms Laboratory",
    department: "Computer Science",
    semester: "Fall 2024",
    facultyIds: ["fac_003"],
    facultyNames: ["Dr. Sarah Jenkins"],
    enrolledCount: 120,
    responsesCount: 86,
    avgRating: 4.5,
    status: "Active"
  },
  {
    courseId: "crs_cs550",
    courseCode: "CS550",
    courseName: "Machine Learning Ethics",
    department: "Computer Science",
    semester: "Fall 2024",
    facultyIds: ["fac_001"],
    facultyNames: ["Dr. Alan Turing"],
    enrolledCount: 30,
    responsesCount: 0,
    avgRating: null,
    status: "Pending"
  },
  {
    courseId: "crs_eng205",
    courseCode: "ENG205",
    courseName: "Modern Literature & Technical Writing",
    department: "Arts & Humanities",
    semester: "Spring 2024",
    facultyIds: ["fac_004"],
    facultyNames: ["Prof. Alan Smith"],
    enrolledCount: 75,
    responsesCount: 65,
    avgRating: 4.3,
    status: "Active"
  },
  {
    courseId: "crs_mkt301",
    courseCode: "MKT301",
    courseName: "Digital Marketing Strategy",
    department: "Business",
    semester: "Fall 2023",
    facultyIds: ["fac_005"],
    facultyNames: ["Dr. Maria Jones"],
    enrolledCount: 85,
    responsesCount: 80,
    avgRating: 4.2,
    status: "Active"
  },
  {
    courseId: "crs_mth202",
    courseCode: "MATH202",
    courseName: "Linear Algebra & Matrices",
    department: "Mathematics",
    semester: "Fall 2024",
    facultyIds: ["fac_004"],
    facultyNames: ["Prof. Emmy Noether"],
    enrolledCount: 130,
    responsesCount: 110,
    avgRating: 4.4,
    status: "Draft"
  },
  {
    courseId: "crs_phy301",
    courseCode: "PHY301",
    courseName: "Quantum Mechanics & Physics",
    department: "Physics",
    semester: "Fall 2024",
    facultyIds: ["fac_006"],
    facultyNames: ["Dr. Richard Feynman"],
    enrolledCount: 60,
    responsesCount: 58,
    avgRating: 4.9,
    status: "Completed"
  }
];

export const MOCK_FEEDBACK_FORMS = [
  {
    formId: "frm_001",
    courseId: "crs_cs201",
    courseCode: "CS201",
    courseName: "Introduction to Computer Science",
    facultyId: "fac_001",
    facultyName: "Dr. Alan Turing",
    title: "Mid-Term Evaluation: Introduction to Computer Science",
    semester: "Fall 2024",
    status: "Active",
    startDate: "2024-10-15",
    endDate: "2024-11-01",
    deadlineNote: "Due in 2 days",
    questionsCount: 4,
    questions: [
      {
        questionId: "q_1",
        questionText: "How clearly did the instructor explain complex concepts?",
        questionType: "Rating",
        required: true,
        category: "Clarity & Delivery"
      },
      {
        questionId: "q_2",
        questionText: "Rate the instructor's subject knowledge and responsiveness to questions.",
        questionType: "Rating",
        required: true,
        category: "Subject Knowledge"
      },
      {
        questionId: "q_3",
        questionText: "How well structured and organized were the classroom lectures and syllabus pacing?",
        questionType: "Rating",
        required: true,
        category: "Course Structure"
      },
      {
        questionId: "q_4",
        questionText: "Rate the fairness and transparency of grading, assignments, and exam feedback.",
        questionType: "Rating",
        required: true,
        category: "Assessment & Feedback"
      }
    ]
  },
  {
    formId: "frm_002",
    courseId: "crs_se401",
    courseCode: "SE401",
    courseName: "Web Development Frameworks",
    facultyId: "fac_002",
    facultyName: "Prof. Grace Hopper",
    title: "Semester Survey: Web Development Frameworks",
    semester: "Fall 2024",
    status: "Active",
    startDate: "2024-10-18",
    endDate: "2024-11-05",
    deadlineNote: "Due in 5 days",
    questionsCount: 4,
    questions: [
      {
        questionId: "q_201",
        questionText: "How practical and relevant were the hands-on coding exercises and lab sessions?",
        questionType: "Rating",
        required: true
      },
      {
        questionId: "q_202",
        questionText: "Rate the instructor's approachability during office hours and doubt-clearing sessions.",
        questionType: "Rating",
        required: true
      },
      {
        questionId: "q_203",
        questionText: "Did the course content align with current modern web engineering industry standards?",
        questionType: "Rating",
        required: true
      }
    ]
  },
  {
    formId: "frm_003",
    courseId: "crs_mth202",
    courseCode: "MATH202",
    courseName: "Linear Algebra & Matrices",
    facultyId: "fac_004",
    facultyName: "Prof. Emmy Noether",
    title: "Faculty Feedback: Linear Algebra",
    semester: "Fall 2024",
    status: "Draft",
    startDate: "2024-11-10",
    endDate: "2024-11-25",
    deadlineNote: "Opens Nov 10",
    questionsCount: 12,
    questions: []
  },
  {
    formId: "frm_004",
    courseId: "crs_phy301",
    courseCode: "PHY301",
    courseName: "Quantum Mechanics & Physics",
    facultyId: "fac_006",
    facultyName: "Dr. Richard Feynman",
    title: "Cycle 1 Feedback: Quantum Mechanics",
    semester: "Fall 2024",
    status: "Completed",
    startDate: "2024-09-01",
    endDate: "2024-09-15",
    deadlineNote: "Ended on Sep 15",
    questionsCount: 20,
    questions: []
  }
];

export const MOCK_STUDENT_SUBMISSIONS = [
  {
    id: "sub_01",
    courseCode: "CS204",
    courseName: "Database Management Systems",
    facultyName: "Dr. Edgar Codd",
    submittedDate: "Oct 12, 2024",
    status: "Completed",
    rating: 4.8
  },
  {
    id: "sub_02",
    courseCode: "CS302",
    courseName: "Operating Systems Principles",
    facultyName: "Dr. Andrew Tanenbaum",
    submittedDate: "Oct 10, 2024",
    status: "Completed",
    rating: 4.5
  },
  {
    id: "sub_03",
    courseCode: "CS304",
    courseName: "Computer Networks & Protocols",
    facultyName: "Prof. Leonard Kleinrock",
    submittedDate: "Oct 03, 2024",
    status: "Completed",
    rating: 4.7
  }
];

export const MOCK_ANALYSIS_DATA = {
  courseCode: "CS101",
  courseName: "Intro to Computer Science",
  facultyName: "Dr. Alan Turing",
  term: "Fall 2023",
  cycle: "Mid-Term Cycle",
  overallRating: 4.6,
  totalResponses: 142,
  responseRate: "85%",
  changeFromLastCycle: "+0.2",
  keyIndicators: {
    highestRated: {
      parameter: "Subject Knowledge",
      score: 4.8
    },
    areaForFocus: {
      parameter: "Assignment Clarity",
      score: 3.8
    }
  },
  questionStats: [
    {
      id: "qs_1",
      question: "Explanation of complex concepts and algorithms",
      avgScore: 4.7,
      distribution: { 5: 68, 4: 22, 3: 7, 2: 2, 1: 1 }
    },
    {
      id: "qs_2",
      question: "Instructor responsiveness and subject expertise",
      avgScore: 4.8,
      distribution: { 5: 75, 4: 18, 3: 5, 2: 1, 1: 1 }
    },
    {
      id: "qs_3",
      question: "Course lecture pace and syllabus coverage",
      avgScore: 4.4,
      distribution: { 5: 55, 4: 30, 3: 10, 2: 3, 1: 2 }
    },
    {
      id: "qs_4",
      question: "Assignment clarity, rubric guidance and assessment deadlines",
      avgScore: 3.8,
      distribution: { 5: 35, 4: 30, 3: 20, 2: 10, 1: 5 }
    }
  ],
  comments: [
    {
      id: "cm_1",
      date: "2 days ago",
      text: "Dr. Turing's breakdown of algorithmic complexity helped clarify concepts I had struggled with for weeks. His interactive demonstrations are top notch!",
      sentiment: "Positive",
      category: "Teaching Quality"
    },
    {
      id: "cm_2",
      date: "3 days ago",
      text: "The programming assignments are challenging and very rewarding, but releasing the specifications two days earlier would allow better debugging time.",
      sentiment: "Constructive",
      category: "Assignments"
    },
    {
      id: "cm_3",
      date: "5 days ago",
      text: "Very approachable during office hours. Always willing to explain alternate approaches to the problem sets.",
      sentiment: "Positive",
      category: "Approachability"
    },
    {
      id: "cm_4",
      date: "1 week ago",
      text: "Would appreciate more practice sample problems for the mid-term exams.",
      sentiment: "Constructive",
      category: "Exam Prep"
    }
  ],
  trends: [
    { week: "W1", satisfaction: 4.2 },
    { week: "W2", satisfaction: 4.4 },
    { week: "W3", satisfaction: 4.7 },
    { week: "W4", satisfaction: 4.6 }
  ]
};

export const MOCK_ADMIN_METRICS = {
  totalStudents: "14,250",
  totalStudentsGrowth: "+2.4%",
  totalFaculty: "845",
  totalFacultyGrowth: "+18 New",
  totalCourses: "1,120",
  totalCoursesGrowth: "+12 New",
  feedbackResponses: "38.4k",
  feedbackResponsesGrowth: "+12%",
  overallRating: 4.4,
  completionRate: "82%",
  ratingTrendsMonthly: [
    { month: "Sep", rating: 3.9 },
    { month: "Oct", rating: 4.1 },
    { month: "Nov", rating: 4.5 },
    { month: "Dec", rating: 4.3 },
    { month: "Jan", rating: 4.7 },
    { month: "Feb", rating: 4.8 }
  ],
  recentActivities: [
    {
      id: "act_1",
      title: "New course added: Introduction to Data Science (CS701)",
      time: "15 mins ago",
      author: "System Admin",
      iconType: "course"
    },
    {
      id: "act_2",
      title: "Feedback form activated: Mid-Term Evaluation - Engineering Dept",
      time: "2 hours ago",
      author: "Dr. Alan Smith",
      iconType: "form"
    },
    {
      id: "act_3",
      title: "User roles updated: 3 instructors granted 'Department Head' access",
      time: "Yesterday",
      author: "System Admin",
      iconType: "user"
    },
    {
      id: "act_4",
      title: "System Alert: API rate limit approaching for external LMS integrations",
      time: "Yesterday",
      author: "Monitor Bot",
      iconType: "alert"
    }
  ],
  activeCampaigns: [
    {
      id: "cmp_1",
      name: "Fall 2024 Mid-Term Core Courses",
      department: "Computer Science",
      progress: 75,
      status: "Active",
      closingDate: "Nov 05, 2024"
    },
    {
      id: "cmp_2",
      name: "Liberal Arts Faculty Review",
      department: "Humanities",
      progress: 52,
      status: "Active",
      closingDate: "Nov 12, 2024"
    },
    {
      id: "cmp_3",
      name: "Engineering Practical Lab Evaluation",
      department: "Engineering",
      progress: 88,
      status: "Active",
      closingDate: "Nov 02, 2024"
    },
    {
      id: "cmp_4",
      name: "Business Administration Capstone Survey",
      department: "Business",
      progress: 35,
      status: "Active",
      closingDate: "Nov 20, 2024"
    }
  ],
  departmentPerformance: [
    { name: "CS", fullName: "Computer Science", rating: 4.6, responses: 12400 },
    { name: "ENG", fullName: "Engineering", rating: 4.4, responses: 9800 },
    { name: "BUS", fullName: "Business", rating: 4.2, responses: 7500 },
    { name: "ART", fullName: "Arts & Humanities", rating: 4.0, responses: 5100 },
    { name: "SCI", fullName: "Sciences & Mathematics", rating: 4.5, responses: 8050 }
  ],
  institutionalFeedbackTrends: [
    { period: "Week 1", institutionAvg: 3.8, currentCycle: 3.9 },
    { period: "Week 4", institutionAvg: 4.0, currentCycle: 4.2 },
    { period: "Week 8", institutionAvg: 4.2, currentCycle: 4.5 },
    { period: "Week 12", institutionAvg: 4.3, currentCycle: 4.4 },
    { period: "Finals", institutionAvg: 4.4, currentCycle: 4.6 }
  ]
};
