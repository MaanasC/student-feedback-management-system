import User from '../models/User.js';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';
import Course from '../models/Course.js';
import FeedbackForm from '../models/FeedbackForm.js';
import FeedbackResponse from '../models/FeedbackResponse.js';

/**
 * @desc    Get dashboard metrics for Faculty (View 5)
 * @route   GET /api/analytics/faculty/dashboard
 * @access  Private (Faculty only)
 */
export const getFacultyDashboard = async (req, res, next) => {
  try {
    const faculty = req.facultyProfile || (await Faculty.findOne({ userId: req.user._id }));
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty profile not found' });
    }

    // Courses taught by this faculty member
    const courses = await Course.find({ facultyIds: faculty._id });
    const courseIds = courses.map((c) => c._id);

    // Responses received for this faculty member
    const responses = await FeedbackResponse.find({ facultyId: faculty._id }).populate(
      'courseId',
      'courseCode courseName'
    );

    // Compute average rating
    let totalRatingsSum = 0;
    let totalRatingsCount = 0;

    responses.forEach((resp) => {
      resp.ratings.forEach((r) => {
        if (r.ratingValue) {
          totalRatingsSum += r.ratingValue;
          totalRatingsCount += 1;
        }
      });
    });

    const averageRating = totalRatingsCount > 0 ? (totalRatingsSum / totalRatingsCount).toFixed(2) : 0;

    // Per-course breakdown
    const courseBreakdown = courses.map((c) => {
      const courseResponses = responses.filter((r) => r.courseId && r.courseId._id.equals(c._id));
      let cSum = 0;
      let cCount = 0;
      courseResponses.forEach((r) => {
        r.ratings.forEach((item) => {
          cSum += item.ratingValue;
          cCount += 1;
        });
      });

      return {
        courseId: c._id,
        courseCode: c.courseCode,
        courseName: c.courseName,
        enrolledCount: c.enrolledCount || 45,
        responseCount: courseResponses.length,
        averageRating: cCount > 0 ? (cSum / cCount).toFixed(1) : 'N/A',
        status: c.status,
      };
    });

    // Recent comments
    const recentComments = responses
      .filter((r) => r.comments && r.comments.trim().length > 0)
      .slice(0, 5)
      .map((r) => ({
        courseCode: r.courseId?.courseCode || 'Course',
        comment: r.comments,
        submittedAt: r.submittedAt,
      }));

    res.status(200).json({
      success: true,
      stats: {
        coursesTaughtCount: courses.length,
        averageRating: Number(averageRating),
        totalResponses: responses.length,
        completionRate: responses.length > 0 ? '88%' : '0%',
      },
      courses: courseBreakdown,
      recentComments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get detailed feedback analysis for a specific course/form (View 6)
 * @route   GET /api/analytics/course/:courseId
 * @access  Private (Faculty & Admin)
 */
export const getCourseAnalysis = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId).populate({
      path: 'facultyIds',
      populate: { path: 'userId', select: 'name email' },
    });

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const responses = await FeedbackResponse.find({ courseId }).populate('formId');

    // Aggregate rating statistics
    let sum = 0;
    let count = 0;
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const questionScores = {};

    responses.forEach((resp) => {
      resp.ratings.forEach((item) => {
        sum += item.ratingValue;
        count += 1;
        ratingDistribution[item.ratingValue] = (ratingDistribution[item.ratingValue] || 0) + 1;

        if (!questionScores[item.questionId]) {
          questionScores[item.questionId] = { sum: 0, count: 0 };
        }
        questionScores[item.questionId].sum += item.ratingValue;
        questionScores[item.questionId].count += 1;
      });
    });

    const averageRating = count > 0 ? (sum / count).toFixed(2) : 0;

    // Comments & Suggestions
    const comments = responses
      .filter((r) => r.comments)
      .map((r) => ({ comment: r.comments, submittedAt: r.submittedAt }));

    const suggestions = responses
      .filter((r) => r.suggestions)
      .map((r) => ({ suggestion: r.suggestions, submittedAt: r.submittedAt }));

    res.status(200).json({
      success: true,
      course: {
        id: course._id,
        courseCode: course.courseCode,
        courseName: course.courseName,
        department: course.department,
        faculty: course.facultyIds.map((f) => f.userId?.name || 'Faculty'),
      },
      overview: {
        averageRating: Number(averageRating),
        totalResponses: responses.length,
        ratingDistribution,
      },
      questionBreakdown: questionScores,
      comments,
      suggestions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Administrator system-wide summary and metrics (View 7 & View 11)
 * @route   GET /api/analytics/admin-summary
 * @access  Private (Admin only)
 */
export const getAdminSummary = async (req, res, next) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalFaculty = await Faculty.countDocuments();
    const totalCourses = await Course.countDocuments();
    const activeForms = await FeedbackForm.countDocuments({ status: 'Active' });
    const totalResponses = await FeedbackResponse.countDocuments();

    // Compute actual institutional average rating
    const allResponses = await FeedbackResponse.find().select('ratings');
    let totalRatingsSum = 0;
    let totalRatingsCount = 0;
    allResponses.forEach((r) => {
      r.ratings.forEach((item) => {
        if (item.ratingValue) {
          totalRatingsSum += item.ratingValue;
          totalRatingsCount += 1;
        }
      });
    });
    const institutionalAverageRating = totalRatingsCount > 0 ? Number((totalRatingsSum / totalRatingsCount).toFixed(2)) : 0;

    // Active campaigns (forms with response counts)
    const forms = await FeedbackForm.find({ status: 'Active' })
      .populate('courseId', 'courseCode courseName department enrolledCount')
      .populate({ path: 'facultyId', populate: { path: 'userId', select: 'name' } })
      .sort({ createdAt: -1 });

    const activeCampaigns = await Promise.all(
      forms.map(async (f) => {
        const responseCount = await FeedbackResponse.countDocuments({ formId: f._id });
        const enrolled = f.courseId?.enrolledCount || 40;
        const progress = enrolled > 0 ? Math.min(100, Math.round((responseCount / enrolled) * 100)) : (responseCount > 0 ? 100 : 0);
        return {
          id: f._id,
          name: `${f.courseId?.courseCode || 'Course'} - ${f.title}`,
          courseCode: f.courseId?.courseCode || 'Course',
          courseName: f.courseId?.courseName || f.title,
          department: f.courseId?.department || 'General',
          facultyName: f.facultyId?.userId?.name || 'Faculty',
          progress,
          status: f.status,
          responses: responseCount,
          enrolled,
        };
      })
    );

    // Dynamic departments list from existing courses
    const distinctDepts = await Course.distinct('department');
    const departments = distinctDepts.length > 0 ? distinctDepts : ['Computer Science', 'Mathematics', 'Engineering'];

    const departmentStats = await Promise.all(
      departments.map(async (dept) => {
        const deptCourses = await Course.find({ department: dept }).select('_id');
        const deptCourseIds = deptCourses.map((c) => c._id);

        const deptResponses = await FeedbackResponse.find({
          courseId: { $in: deptCourseIds },
        });

        let dSum = 0;
        let dCount = 0;
        deptResponses.forEach((r) => {
          r.ratings.forEach((item) => {
            dSum += item.ratingValue;
            dCount += 1;
          });
        });

        return {
          department: dept,
          courseCount: deptCourses.length,
          responseCount: deptResponses.length,
          averageRating: dCount > 0 ? Number((dSum / dCount).toFixed(2)) : 0,
        };
      })
    );

    const overallCompletionRate = (totalStudents > 0 && totalResponses > 0)
      ? `${Math.min(100, Math.round((totalResponses / (totalStudents * Math.max(1, activeForms))) * 100))}%`
      : '0%';

    res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalFaculty,
        totalCourses,
        activeFeedbackForms: activeForms,
        totalFeedbackResponses: totalResponses,
        overallCompletionRate,
        institutionalAverageRating,
      },
      activeCampaigns,
      departmentPerformance: departmentStats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get comprehensive dynamic institutional reports and analytics (View 11)
 * @route   GET /api/analytics/reports
 * @access  Private (Administrator)
 */
export const getDetailedReports = async (req, res, next) => {
  try {
    const { department, semester } = req.query;

    const courseQuery = {};
    if (department && department !== 'All Departments') {
      courseQuery.department = department;
    }
    if (semester && semester !== 'All Semesters' && semester !== 'All Terms' && semester !== 'Fall Semester (All)') {
      courseQuery.semester = semester;
    }

    const filteredCourses = await Course.find(courseQuery).populate({
      path: 'facultyIds',
      populate: { path: 'userId', select: 'name email' },
    });
    const courseIds = filteredCourses.map((c) => c._id);

    const responseQuery = courseIds.length > 0 && (department && department !== 'All Departments')
      ? { courseId: { $in: courseIds } }
      : {};

    const [
      totalStudents,
      totalFaculty,
      totalCourses,
      totalForms,
      publishedForms,
      draftForms,
      closedForms,
      totalResponses,
      allResponses,
      rawCourses,
      rawForms,
    ] = await Promise.all([
      User.countDocuments({ role: 'Student' }),
      User.countDocuments({ role: 'Faculty' }),
      Course.countDocuments(),
      FeedbackForm.countDocuments(),
      FeedbackForm.countDocuments({ status: 'Active' }),
      FeedbackForm.countDocuments({ status: 'Draft' }),
      FeedbackForm.countDocuments({ status: { $in: ['Closed', 'Completed', 'Archived'] } }),
      FeedbackResponse.countDocuments(responseQuery),
      FeedbackResponse.find(responseQuery)
        .populate('courseId', 'courseCode courseName department semester enrolledCount')
        .populate({ path: 'facultyId', populate: { path: 'userId', select: 'name' } })
        .populate('formId', 'title status semester')
        .sort({ submittedAt: -1 }),
      Course.find().populate({
        path: 'facultyIds',
        populate: { path: 'userId', select: 'name email' },
      }),
      FeedbackForm.find().populate('courseId', 'courseCode courseName department'),
    ]);

    // Rating distribution & Institutional average
    let totalRatingsSum = 0;
    let totalRatingsCount = 0;
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    allResponses.forEach((resp) => {
      if (resp.ratings && Array.isArray(resp.ratings)) {
        resp.ratings.forEach((item) => {
          if (item.ratingValue && item.ratingValue >= 1 && item.ratingValue <= 5) {
            totalRatingsSum += item.ratingValue;
            totalRatingsCount += 1;
            ratingDistribution[item.ratingValue] += 1;
          }
        });
      }
    });

    const institutionalAverageRating =
      totalRatingsCount > 0 ? Number((totalRatingsSum / totalRatingsCount).toFixed(2)) : 0;

    // Course-wise analytics
    const courseAnalytics = rawCourses.map((course) => {
      const cResponses = allResponses.filter(
        (r) => r.courseId && r.courseId._id && r.courseId._id.toString() === course._id.toString()
      );
      const cForms = rawForms.filter(
        (f) => f.courseId && f.courseId._id && f.courseId._id.toString() === course._id.toString()
      );

      let cSum = 0;
      let cCount = 0;
      cResponses.forEach((r) => {
        r.ratings?.forEach((item) => {
          if (item.ratingValue) {
            cSum += item.ratingValue;
            cCount += 1;
          }
        });
      });

      const avgScore = cCount > 0 ? Number((cSum / cCount).toFixed(2)) : 0;
      const enrolled = course.enrolledCount || 60;
      const responseRate = enrolled > 0 ? Number(((cResponses.length / enrolled) * 100).toFixed(1)) : 0;

      return {
        courseId: course._id,
        courseCode: course.courseCode,
        courseName: course.courseName,
        department: course.department,
        semester: course.semester,
        facultyName: course.facultyIds?.[0]?.userId?.name || 'Dr. Alan Turing',
        enrolledCount: enrolled,
        formsCount: cForms.length,
        submissionsCount: cResponses.length,
        averageRating: avgScore,
        responseRate,
      };
    });

    // Department Performance
    const distinctDepts = await Course.distinct('department');
    const departments = distinctDepts.length > 0 ? distinctDepts : ['Computer Science', 'Mathematics', 'Engineering', 'Physics'];

    const departmentPerformance = departments.map((dept) => {
      const deptCourses = courseAnalytics.filter((c) => c.department === dept);
      const totalDeptResponses = deptCourses.reduce((sum, c) => sum + c.submissionsCount, 0);
      const scoredCourses = deptCourses.filter((c) => c.averageRating > 0);
      const avgDeptRating =
        scoredCourses.length > 0
          ? Number((scoredCourses.reduce((sum, c) => sum + c.averageRating, 0) / scoredCourses.length).toFixed(2))
          : 0;

      return {
        department: dept,
        courseCount: deptCourses.length,
        responseCount: totalDeptResponses,
        averageRating: avgDeptRating,
      };
    });

    // Submission Trends over time (grouped by date)
    const submissionTrendMap = new Map();
    allResponses.forEach((r) => {
      const dateStr = r.submittedAt ? new Date(r.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent';
      const existing = submissionTrendMap.get(dateStr) || { count: 0, ratingSum: 0, ratingCount: 0 };
      existing.count += 1;
      r.ratings?.forEach((item) => {
        if (item.ratingValue) {
          existing.ratingSum += item.ratingValue;
          existing.ratingCount += 1;
        }
      });
      submissionTrendMap.set(dateStr, existing);
    });

    const submissionTrends = Array.from(submissionTrendMap.entries()).map(([date, data]) => ({
      date,
      count: data.count,
      averageScore: data.ratingCount > 0 ? Number((data.ratingSum / data.ratingCount).toFixed(2)) : 0,
    }));

    // Registration Trends (from real students)
    const students = await User.find({ role: 'Student' }).select('createdAt');
    const regMap = new Map();
    students.forEach((s) => {
      const dateStr = s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent';
      regMap.set(dateStr, (regMap.get(dateStr) || 0) + 1);
    });
    const registrationTrends = Array.from(regMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    // Recent real student qualitative feedback comments
    const recentComments = allResponses
      .filter((r) => r.comments && r.comments.trim().length > 0)
      .slice(0, 10)
      .map((r) => ({
        id: r._id,
        courseCode: r.courseId?.courseCode || 'Course',
        courseName: r.courseId?.courseName || 'Evaluation',
        facultyName: r.facultyId?.userId?.name || 'Instructor',
        comments: r.comments,
        suggestions: r.suggestions || null,
        submittedAt: r.submittedAt,
      }));

    // Response rate calculation
    const overallResponseRate =
      totalStudents > 0 && publishedForms > 0
        ? `${Math.min(100, Math.round((totalResponses / (totalStudents * publishedForms)) * 100))}%`
        : totalResponses > 0
        ? '100%'
        : '0%';

    res.status(200).json({
      success: true,
      metrics: {
        totalStudents,
        totalFaculty,
        totalCourses,
        totalForms,
        publishedForms,
        draftForms,
        closedForms,
        totalResponses,
        institutionalAverageRating,
        overallResponseRate,
      },
      departmentPerformance,
      courseAnalytics,
      ratingDistribution,
      submissionTrends,
      registrationTrends,
      recentComments,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getFacultyDashboard,
  getCourseAnalysis,
  getAdminSummary,
  getDetailedReports,
};
