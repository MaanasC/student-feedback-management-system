import FeedbackForm from '../models/FeedbackForm.js';
import FeedbackResponse from '../models/FeedbackResponse.js';
import Course from '../models/Course.js';
import Faculty from '../models/Faculty.js';
import { emitFormCreated, emitFormUpdated } from '../sockets/socketHandler.js';

/**
 * @desc    Get all feedback forms with filters (View 10 & Student Dashboard View 2)
 * @route   GET /api/feedback-forms
 * @access  Private (All authenticated roles)
 */
export const getAllForms = async (req, res, next) => {
  try {
    const { status, semester, department, courseId } = req.query;

    const query = {};
    if (status && status !== 'All Statuses') query.status = status;
    if (semester && semester !== 'All Terms') query.semester = semester;
    if (courseId) query.courseId = courseId;

    const forms = await FeedbackForm.find(query)
      .populate('courseId', 'courseCode courseName department semester')
      .populate({
        path: 'facultyId',
        populate: { path: 'userId', select: 'name email department' },
      })
      .sort({ createdAt: -1 });

    // Filter by department if specified
    let filteredForms = forms;
    if (department && department !== 'All Departments') {
      filteredForms = forms.filter(
        (f) => f.courseId && f.courseId.department === department
      );
    }

    // If a student is fetching, restrict forms to the student's own registered department
    if (req.user && req.user.role === 'Student') {
      const studentDept = (req.studentProfile?.department || req.user.department || '').trim().toLowerCase();
      if (studentDept) {
        filteredForms = filteredForms.filter(
          (f) => f.courseId && (f.courseId.department || '').trim().toLowerCase() === studentDept
        );
      }
    }

    // If a student is fetching, annotate which forms they have already submitted
    let results = filteredForms.map((f) => f.toObject());

    if (req.user && req.user.role === 'Student' && req.studentProfile) {
      const submissions = await FeedbackResponse.find({
        studentId: req.studentProfile._id,
      }).select('formId submittedAt');

      const submittedFormIds = new Set(
        submissions.map((s) => s.formId.toString())
      );

      results = results.map((form) => ({
        ...form,
        hasSubmitted: submittedFormIds.has(form._id.toString()),
      }));
    }

    res.status(200).json({
      success: true,
      count: results.length,
      forms: results,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single feedback form with questions (View 3: Feedback Form Page)
 * @route   GET /api/feedback-forms/:id
 * @access  Private
 */
export const getFormById = async (req, res, next) => {
  try {
    const form = await FeedbackForm.findById(req.params.id)
      .populate('courseId', 'courseCode courseName department')
      .populate({
        path: 'facultyId',
        populate: { path: 'userId', select: 'name email department' },
      });

    if (!form) {
      return res.status(404).json({ success: false, message: 'Feedback form not found' });
    }

    let hasSubmitted = false;
    if (req.user && req.user.role === 'Student' && req.studentProfile) {
      const existing = await FeedbackResponse.findOne({
        formId: form._id,
        studentId: req.studentProfile._id,
      });
      hasSubmitted = !!existing;
    }

    res.status(200).json({
      success: true,
      form,
      hasSubmitted,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new feedback form with questions (View 10 Modal)
 * @route   POST /api/feedback-forms
 * @access  Private (Admin only)
 */
export const createForm = async (req, res, next) => {
  try {
    const {
      courseId,
      facultyId,
      title,
      semester,
      startDate,
      endDate,
      deadlineNote,
      questions,
      status,
    } = req.body;

    if (!courseId || !facultyId || !title || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Course, faculty, title, and deadline are required fields.',
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Target course not found' });
    }

    const faculty = await Faculty.findById(facultyId).populate('userId', 'name');
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Target faculty not found' });
    }

    const defaultQuestions = [
      { questionText: 'How effectively did the instructor present core concepts and explain complex topics?', questionType: 'Rating', required: true },
      { questionText: 'Rate the pace, clarity, and helpfulness of coursework materials.', questionType: 'Rating', required: true },
      { questionText: 'How approachable and responsive was the faculty member during office hours and doubt resolution?', questionType: 'Rating', required: true },
      { questionText: 'Overall satisfaction with teaching methodology, lab experiments, and learning outcomes.', questionType: 'Rating', required: true },
      { questionText: 'Additional comments or suggestions for academic improvement:', questionType: 'Text', required: false },
    ];

    const form = await FeedbackForm.create({
      courseId,
      facultyId,
      title,
      semester: semester || 'Fall 2024',
      startDate: startDate || new Date(),
      endDate,
      deadlineNote: deadlineNote || 'Active Evaluation Cycle',
      status: status || 'Active',
      questions: questions && questions.length > 0 ? questions : defaultQuestions,
    });

    // Real-time WebSocket notification (Experiment 7)
    if (form.status === 'Active') {
      await emitFormCreated(form, course, faculty.userId?.name || 'Faculty');
    }

    const populated = await FeedbackForm.findById(form._id)
      .populate('courseId', 'courseCode courseName')
      .populate({
        path: 'facultyId',
        populate: { path: 'userId', select: 'name' },
      });

    res.status(201).json({
      success: true,
      message: 'Feedback form created and published.',
      form: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update feedback form details or questions
 * @route   PUT /api/feedback-forms/:id
 * @access  Private (Admin only)
 */
export const updateForm = async (req, res, next) => {
  try {
    const { title, semester, startDate, endDate, deadlineNote, questions, status } = req.body;

    const form = await FeedbackForm.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ success: false, message: 'Feedback form not found' });
    }

    const previousStatus = form.status;
    if (title) form.title = title;
    if (semester) form.semester = semester;
    if (startDate) form.startDate = startDate;
    if (endDate) form.endDate = endDate;
    if (deadlineNote) form.deadlineNote = deadlineNote;
    if (status) form.status = status;
    if (questions) form.questions = questions;

    await form.save();

    if (form.status === 'Active' && previousStatus !== 'Active') {
      const course = await Course.findById(form.courseId);
      const faculty = await Faculty.findById(form.facultyId).populate('userId', 'name');
      await emitFormCreated(form, course, faculty?.userId?.name || 'Faculty');
    } else {
      // Trigger real-time update event
      await emitFormUpdated(form, 'updated');
    }

    res.status(200).json({
      success: true,
      message: 'Feedback form updated successfully.',
      form,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle feedback form status (Active / Draft / Completed)
 * @route   PATCH /api/feedback-forms/:id/toggle-status
 * @access  Private (Admin only)
 */
export const toggleFormStatus = async (req, res, next) => {
  try {
    const form = await FeedbackForm.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ success: false, message: 'Feedback form not found' });
    }

    const previousStatus = form.status;
    form.status = form.status === 'Active' ? 'Draft' : 'Active';
    await form.save();

    if (form.status === 'Active' && previousStatus !== 'Active') {
      const course = await Course.findById(form.courseId);
      const faculty = await Faculty.findById(form.facultyId).populate('userId', 'name');
      await emitFormCreated(form, course, faculty?.userId?.name || 'Faculty');
    } else {
      // Broadcast status change via Socket.IO (Experiment 7)
      await emitFormUpdated(form, 'status_changed');
    }

    res.status(200).json({
      success: true,
      message: `Form status changed to ${form.status}.`,
      status: form.status,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete feedback form
 * @route   DELETE /api/feedback-forms/:id
 * @access  Private (Admin only)
 */
export const deleteForm = async (req, res, next) => {
  try {
    const form = await FeedbackForm.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ success: false, message: 'Feedback form not found' });
    }

    // Also remove responses linked to this form
    await FeedbackResponse.deleteMany({ formId: form._id });
    await FeedbackForm.deleteOne({ _id: form._id });

    res.status(200).json({
      success: true,
      message: 'Feedback form and its associated responses deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getAllForms,
  getFormById,
  createForm,
  updateForm,
  toggleFormStatus,
  deleteForm,
};
