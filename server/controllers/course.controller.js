import Course from '../models/Course.js';
import Faculty from '../models/Faculty.js';
import FeedbackForm from '../models/FeedbackForm.js';
import FeedbackResponse from '../models/FeedbackResponse.js';

/**
 * @desc    Get all courses with optional filters (View 9 & Student/Faculty Dashboards)
 * @route   GET /api/courses
 * @access  Private (All authenticated roles)
 */
export const getAllCourses = async (req, res, next) => {
  try {
    const { department, semester, search } = req.query;

    const query = {};
    if (department && department !== 'All Departments') query.department = department;
    if (semester && semester !== 'All Terms' && semester !== 'All Semesters') query.semester = semester;

    if (search) {
      query.$or = [
        { courseCode: { $regex: search, $options: 'i' } },
        { courseName: { $regex: search, $options: 'i' } },
      ];
    }

    const courses = await Course.find(query)
      .populate({
        path: 'facultyIds',
        populate: { path: 'userId', select: 'name email department' },
      })
      .sort({ courseCode: 1 });

    // Aggregate real counts of associated feedback forms and responses for each course
    const formCounts = await FeedbackForm.aggregate([
      { $group: { _id: '$courseId', count: { $sum: 1 } } },
    ]);
    const responseCounts = await FeedbackResponse.aggregate([
      { $group: { _id: '$courseId', count: { $sum: 1 } } },
    ]);

    const formCountMap = new Map(formCounts.map((item) => [item._id?.toString(), item.count]));
    const responseCountMap = new Map(responseCounts.map((item) => [item._id?.toString(), item.count]));

    const coursesWithMeta = courses.map((c) => {
      const cObj = c.toObject();
      const cIdStr = c._id.toString();
      cObj.formsCount = formCountMap.get(cIdStr) || 0;
      cObj.responsesCount = responseCountMap.get(cIdStr) || 0;
      return cObj;
    });

    res.status(200).json({
      success: true,
      count: coursesWithMeta.length,
      courses: coursesWithMeta,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single course by ID
 * @route   GET /api/courses/:id
 * @access  Private
 */
export const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate({
      path: 'facultyIds',
      populate: { path: 'userId', select: 'name email department' },
    });

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new course (View 9 Add Course modal)
 * @route   POST /api/courses
 * @access  Private (Admin only)
 */
export const createCourse = async (req, res, next) => {
  try {
    const { courseCode, courseName, department, semester, facultyIds, credits } = req.body;

    if (!courseCode || !courseName || !department) {
      return res.status(400).json({
        success: false,
        message: 'Course code, course name, and department are required.',
      });
    }

    const existing = await Course.findOne({ courseCode: courseCode.toUpperCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Course with code ${courseCode} already exists.`,
      });
    }

    const course = await Course.create({
      courseCode: courseCode.toUpperCase(),
      courseName,
      department,
      semester: semester || 'Fall 2024',
      facultyIds: facultyIds || [],
      credits: credits || 4,
      status: 'Active',
    });

    const populatedCourse = await Course.findById(course._id).populate({
      path: 'facultyIds',
      populate: { path: 'userId', select: 'name email' },
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully.',
      course: populatedCourse,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update course
 * @route   PUT /api/courses/:id
 * @access  Private (Admin only)
 */
export const updateCourse = async (req, res, next) => {
  try {
    const { courseCode, courseName, department, semester, facultyIds, credits, status } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (courseCode) course.courseCode = courseCode.toUpperCase();
    if (courseName) course.courseName = courseName;
    if (department) course.department = department;
    if (semester) course.semester = semester;
    if (facultyIds) course.facultyIds = facultyIds;
    if (credits) course.credits = credits;
    if (status) course.status = status;

    await course.save();

    const updated = await Course.findById(course._id).populate({
      path: 'facultyIds',
      populate: { path: 'userId', select: 'name email' },
    });

    res.status(200).json({
      success: true,
      message: 'Course updated successfully.',
      course: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete course
 * @route   DELETE /api/courses/:id
 * @access  Private (Admin only)
 */
export const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Safeguard: Prevent deleting courses with historical forms or submissions
    const formCount = await FeedbackForm.countDocuments({ courseId: course._id });
    const responseCount = await FeedbackResponse.countDocuments({ courseId: course._id });

    if (formCount > 0 || responseCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete course '${course.courseCode}': It is referenced by ${formCount} feedback form(s) and ${responseCount} submission(s). Please archive or mark the course as Inactive instead.`,
      });
    }

    await Course.deleteOne({ _id: course._id });

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
};
