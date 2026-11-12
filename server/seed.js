import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Student from './models/Student.js';
import Faculty from './models/Faculty.js';
import Course from './models/Course.js';
import FeedbackForm from './models/FeedbackForm.js';
import FeedbackResponse from './models/FeedbackResponse.js';
import Notification from './models/Notification.js';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/StudentFeedbackDB';

export const seedDatabase = async ({ force = true, disconnect = true } = {}) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log(`[Seed] Connecting to MongoDB at ${mongoUri}...`);
      await mongoose.connect(mongoUri, { tlsAllowInvalidCertificates: true });
      console.log('[Seed] Connected to database.');
    }

    // If not forcing a full reset, check if database already contains users
    if (!force) {
      const existingUserCount = await User.countDocuments();
      if (existingUserCount > 0) {
        console.log(`[Seed] Found ${existingUserCount} existing user records. Preserving existing data (auto-seed bypassed).`);
        return;
      }
      console.log('[Seed] Empty database detected. Performing initial automated seeding...');
    }

    // 1. Clear existing collections
    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Faculty.deleteMany({}),
      Course.deleteMany({}),
      FeedbackForm.deleteMany({}),
      FeedbackResponse.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log('[Seed] Collections cleared.');

    // 2. Create Administrator Users
    console.log('[Seed] Creating Administrator accounts...');
    const adminUser = await User.create({
      name: 'Dr. Eleanor Vance',
      email: 'eleanor.vance@university.edu',
      password: 'password123',
      role: 'Administrator',
      department: 'Academic Affairs',
      status: 'Active',
    });

    // 3. Create Faculty Users and Profiles
    console.log('[Seed] Creating Faculty accounts...');
    const facultyData = [
      {
        name: 'Dr. Alan Turing',
        email: 'alan.turing@university.edu',
        password: 'password123',
        department: 'Computer Science',
        designation: 'Professor',
        specialization: 'Theoretical Computer Science & AI',
      },
      {
        name: 'Prof. Grace Hopper',
        email: 'grace.hopper@university.edu',
        password: 'password123',
        department: 'Computer Science',
        designation: 'Associate Professor',
        specialization: 'Software Engineering & Compilers',
      },
      {
        name: 'Prof. Emmy Noether',
        email: 'emmy.noether@university.edu',
        password: 'password123',
        department: 'Mathematics',
        designation: 'Professor',
        specialization: 'Abstract Algebra',
      },
      {
        name: 'Dr. Richard Feynman',
        email: 'richard.feynman@university.edu',
        password: 'password123',
        department: 'Physics',
        designation: 'Professor',
        specialization: 'Quantum Electrodynamics',
      },
    ];

    const facultyDocs = [];
    for (const item of facultyData) {
      const u = await User.create({
        name: item.name,
        email: item.email,
        password: item.password,
        role: 'Faculty',
        department: item.department,
        status: 'Active',
      });
      const f = await Faculty.create({
        userId: u._id,
        department: item.department,
        designation: item.designation,
        specialization: item.specialization,
      });
      facultyDocs.push({ user: u, faculty: f });
    }

    const turingFaculty = facultyDocs[0].faculty;
    const hopperFaculty = facultyDocs[1].faculty;
    const noetherFaculty = facultyDocs[2].faculty;
    const feynmanFaculty = facultyDocs[3].faculty;

    // 4. Create Student Users and Profiles
    console.log('[Seed] Creating Student accounts...');
    const studentData = [
      {
        name: 'Maanas Chawan',
        email: 'maanas.chawan@university.edu',
        password: 'password123',
        department: 'Computer Science',
        rollNo: 'D15A-08',
        semester: 5,
      },
      {
        name: 'Elena Rostova',
        email: 'elena.rostova@student.edu',
        password: 'password123',
        department: 'Engineering',
        rollNo: 'ENG-2024-023',
        semester: 4,
      },
      {
        name: 'Alex Chen',
        email: 'alex.chen@university.edu',
        password: 'password123',
        department: 'Computer Science',
        rollNo: 'CS-2024-042',
        semester: 5,
      },
    ];

    const studentDocs = [];
    for (const item of studentData) {
      const u = await User.create({
        name: item.name,
        email: item.email,
        password: item.password,
        role: 'Student',
        department: item.department,
        status: 'Active',
      });
      const s = await Student.create({
        userId: u._id,
        rollNo: item.rollNo,
        department: item.department,
        semester: item.semester,
      });
      studentDocs.push({ user: u, student: s });
    }

    const maanasStudent = studentDocs[0].student;
    const alexStudent = studentDocs[2].student;

    // 5. Create Courses (demonstrating Section 9.2 #4 facultyIds co-teaching)
    console.log('[Seed] Creating Courses with faculty associations...');
    const courseCS101 = await Course.create({
      courseCode: 'CS101',
      courseName: 'Intro to Programming',
      department: 'Computer Science',
      semester: 'Fall 2024',
      facultyIds: [turingFaculty._id],
      credits: 4,
      enrolledCount: 120,
      status: 'Active',
    });

    const courseCS201 = await Course.create({
      courseCode: 'CS201',
      courseName: 'Introduction to Computer Science',
      department: 'Computer Science',
      semester: 'Fall 2024',
      facultyIds: [turingFaculty._id],
      credits: 4,
      enrolledCount: 95,
      status: 'Active',
    });

    // Co-taught course
    const courseCS301 = await Course.create({
      courseCode: 'CS301',
      courseName: 'Data Structures & Algorithms',
      department: 'Computer Science',
      semester: 'Fall 2024',
      facultyIds: [turingFaculty._id, hopperFaculty._id],
      credits: 4,
      enrolledCount: 88,
      status: 'Active',
    });

    const courseSE401 = await Course.create({
      courseCode: 'SE401',
      courseName: 'Web Development Frameworks',
      department: 'Computer Science',
      semester: 'Fall 2024',
      facultyIds: [hopperFaculty._id],
      credits: 3,
      enrolledCount: 64,
      status: 'Active',
    });

    const courseMATH202 = await Course.create({
      courseCode: 'MATH202',
      courseName: 'Linear Algebra',
      department: 'Mathematics',
      semester: 'Fall 2024',
      facultyIds: [noetherFaculty._id],
      credits: 4,
      enrolledCount: 110,
      status: 'Active',
    });

    const coursePHY301 = await Course.create({
      courseCode: 'PHY301',
      courseName: 'Quantum Mechanics',
      department: 'Physics',
      semester: 'Fall 2024',
      facultyIds: [feynmanFaculty._id],
      credits: 4,
      enrolledCount: 45,
      status: 'Active',
    });

    // 6. Create Standard Evaluation Questions
    const standardQuestions = [
      { questionId: 'Q1', questionText: 'How clearly did the instructor explain complex concepts and theoretical foundations?', questionType: 'Rating', required: true },
      { questionId: 'Q2', questionText: 'Rate the instructor\'s subject knowledge, depth, and preparedness in class.', questionType: 'Rating', required: true },
      { questionId: 'Q3', questionText: 'How approachable, responsive, and supportive was the instructor during office hours?', questionType: 'Rating', required: true },
      { questionId: 'Q4', questionText: 'Rate the quality, pacing, and practical relevance of assignments and laboratory work.', questionType: 'Rating', required: true },
      { questionId: 'Q5', questionText: 'Additional Comments or Suggestions for Academic Improvement:', questionType: 'Text', required: false },
    ];

    // 7. Create Feedback Forms
    console.log('[Seed] Creating Feedback Forms...');
    const formCS201 = await FeedbackForm.create({
      courseId: courseCS201._id,
      facultyId: turingFaculty._id,
      title: 'CS201: Introduction to Computer Science Evaluation',
      semester: 'Fall 2024',
      status: 'Active',
      startDate: new Date('2024-10-15'),
      endDate: new Date('2024-11-20'),
      deadlineNote: 'Due in 3 days • 24% completed',
      questions: standardQuestions,
    });

    const formCS301 = await FeedbackForm.create({
      courseId: courseCS301._id,
      facultyId: turingFaculty._id,
      title: 'CS301: Data Structures & Algorithms Mid-Term Feedback',
      semester: 'Fall 2024',
      status: 'Active',
      startDate: new Date('2024-10-10'),
      endDate: new Date('2024-11-15'),
      deadlineNote: 'Due in 2 days',
      questions: standardQuestions,
    });

    const formSE401 = await FeedbackForm.create({
      courseId: courseSE401._id,
      facultyId: hopperFaculty._id,
      title: 'SE401: Web Development Frameworks Evaluation',
      semester: 'Fall 2024',
      status: 'Active',
      startDate: new Date('2024-10-12'),
      endDate: new Date('2024-11-25'),
      deadlineNote: 'Due in 5 days',
      questions: standardQuestions,
    });

    const formMATH202 = await FeedbackForm.create({
      courseId: courseMATH202._id,
      facultyId: noetherFaculty._id,
      title: 'MATH202: Linear Algebra Comprehensive Review',
      semester: 'Fall 2024',
      status: 'Completed',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2024-10-01'),
      deadlineNote: 'Completed on Oct 01',
      questions: standardQuestions,
    });

    // 8. Create Sample Feedback Responses
    // Student Alex Chen submits for CS201 and CS301
    console.log('[Seed] Creating Initial Feedback Responses...');
    await FeedbackResponse.create({
      formId: formCS201._id,
      studentId: alexStudent._id,
      courseId: courseCS201._id,
      facultyId: turingFaculty._id,
      ratings: [
        { questionId: 'Q1', ratingValue: 5 },
        { questionId: 'Q2', ratingValue: 5 },
        { questionId: 'Q3', ratingValue: 4 },
        { questionId: 'Q4', ratingValue: 5 },
      ],
      comments: 'Dr. Turing makes the hardest concepts intuitive with real algorithmic breakthroughs.',
      suggestions: 'More problem sets on computability would be fantastic.',
      submittedAt: new Date('2024-10-18'),
    });

    await FeedbackResponse.create({
      formId: formCS301._id,
      studentId: alexStudent._id,
      courseId: courseCS301._id,
      facultyId: turingFaculty._id,
      ratings: [
        { questionId: 'Q1', ratingValue: 4 },
        { questionId: 'Q2', ratingValue: 5 },
        { questionId: 'Q3', ratingValue: 4 },
        { questionId: 'Q4', ratingValue: 4 },
      ],
      comments: 'High pace but very rewarding assignments.',
      suggestions: 'Include more graphical visualization of tree balance rotations.',
      submittedAt: new Date('2024-10-19'),
    });

    // 9. Create Notifications
    console.log('[Seed] Creating initial Notifications...');
    await Notification.create({
      recipientRole: 'Student',
      title: 'Mid-Term Feedback Active',
      message: 'Evaluation window is open for CS201, CS301 and SE401 until Nov 25.',
      type: 'info',
    });

    console.log('------------------------------------------------------------');
    console.log('✅ Database Seeding Completed Successfully!');
    console.log('Database: StudentFeedbackDB');
    console.log('Demo Credentials:');
    console.log(' - Administrator: eleanor.vance@university.edu / password123');
    console.log(' - Faculty:       alan.turing@university.edu   / password123');
    console.log(' - Faculty:       grace.hopper@university.edu  / password123');
    console.log(' - Student:       maanas.chawan@university.edu / password123');
    console.log(' - Student:       alex.chen@university.edu     / password123');
    console.log('------------------------------------------------------------');

    if (disconnect) {
      await mongoose.disconnect();
      process.exit(0);
    }
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    if (disconnect) {
      process.exit(1);
    }
    throw err;
  }
};

const isDirectExecution = process.argv[1] && (
  process.argv[1].endsWith('seed.js') || 
  process.argv[1].endsWith('seed')
);

if (isDirectExecution) {
  seedDatabase({ force: true, disconnect: true });
}

export default seedDatabase;
