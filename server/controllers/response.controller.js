import mongoose from 'mongoose';
import FeedbackResponse from '../models/FeedbackResponse.js';
import FeedbackForm from '../models/FeedbackForm.js';
import Course from '../models/Course.js';
import Faculty from '../models/Faculty.js';
import Student from '../models/Student.js';
import { emitFeedbackSubmitted } from '../sockets/socketHandler.js';

/**
 * @desc    Submit student feedback response (View 3 -> View 4)
 * @route   POST /api/feedback-responses
 * @access  Private (Student only)
 */
export const submitFeedback = async (req, res, next) => {
  try {
    const { formId, ratings, comments, suggestions } = req.body;

    if (!formId) {
      return res.status(400).json({
        success: false,
        message: 'Feedback Form ID is required.',
      });
    }

    if (!ratings || !Array.isArray(ratings) || ratings.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid rating responses for all evaluation criteria.',
      });
    }

    // Identify student profile
    const student = req.studentProfile || (await Student.findOne({ userId: req.user._id }));
    if (!student) {
      return res.status(403).json({
        success: false,
        message: 'Only registered students can submit feedback responses.',
      });
    }

    // Verify form status and existence
    const form = await FeedbackForm.findById(formId).populate('courseId').populate('facultyId');
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Feedback form not found.',
      });
    }

    if (form.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: `Feedback submission is not allowed. Form status is '${form.status}'.`,
      });
    }

    // Check if student already submitted feedback for this form (Application level check)
    const alreadySubmitted = await FeedbackResponse.findOne({
      formId: form._id,
      studentId: student._id,
    });

    if (alreadySubmitted) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate Submission Prevented: You have already submitted feedback for this course form.',
        submittedAt: alreadySubmitted.submittedAt,
        responseId: alreadySubmitted.responseId,
      });
    }

    // Create Feedback Response
    // (Database-level compound unique index { formId: 1, studentId: 1 } guarantees concurrency safety)
    const response = await FeedbackResponse.create({
      formId: form._id,
      studentId: student._id,
      courseId: form.courseId._id,
      facultyId: form.facultyId._id,
      ratings,
      comments: comments || '',
      suggestions: suggestions || '',
      submittedAt: new Date(),
    });

    // Notify assigned Faculty and Admins in real-time (Experiment 7)
    const facultyDoc = await Faculty.findById(form.facultyId._id).populate('userId');
    await emitFeedbackSubmitted({
      facultyUserId: facultyDoc?.userId?._id?.toString(),
      courseCode: form.courseId?.courseCode || 'Course',
      courseName: form.courseId?.courseName || '',
      responseId: response.responseId,
      formId: form._id,
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully.',
      confirmation: {
        responseId: response.responseId,
        formTitle: form.title,
        courseCode: form.courseId.courseCode,
        courseName: form.courseId.courseName,
        facultyName: facultyDoc?.userId?.name || 'Faculty Member',
        submittedAt: response.submittedAt,
        status: 'Completed',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all feedback responses submitted by the logged in student
 * @route   GET /api/feedback-responses/my
 * @access  Private (Student only)
 */
export const getMySubmissions = async (req, res, next) => {
  try {
    const student = req.studentProfile || (await Student.findOne({ userId: req.user._id }));
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const responses = await FeedbackResponse.find({ studentId: student._id })
      .populate('formId', 'title semester startDate endDate')
      .populate('courseId', 'courseCode courseName department')
      .populate({
        path: 'facultyId',
        populate: { path: 'userId', select: 'name email' },
      })
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      count: responses.length,
      submissions: responses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all responses for a given feedback form (View 6 / Admin)
 * @route   GET /api/feedback-responses/form/:formId
 * @access  Private (Faculty & Admin)
 */
export const getResponsesByForm = async (req, res, next) => {
  try {
    const { formId } = req.params;

    const responses = await FeedbackResponse.find({ formId })
      .select('-studentId') // Protect student anonymity as per Section 2 of PDF
      .populate('courseId', 'courseCode courseName')
      .populate('formId', 'title questions')
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      count: responses.length,
      responses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all feedback responses across forms (Admin only)
 * @route   GET /api/feedback-responses
 * @access  Private (Admin only)
 */
export const getAllResponses = async (req, res, next) => {
  try {
    const responses = await FeedbackResponse.find()
      .select('-studentId')
      .populate('formId', 'title semester questions')
      .populate('courseId', 'courseCode courseName department')
      .populate({
        path: 'facultyId',
        populate: { path: 'userId', select: 'name email' },
      })
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      count: responses.length,
      responses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single feedback response with details and mapped questions
 * @route   GET /api/feedback-responses/:id
 * @access  Private (Admin & Faculty)
 */
export const getResponseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ _id: id }, { responseId: id }] };
    } else {
      query = { responseId: id };
    }

    const response = await FeedbackResponse.findOne(query)
      .select('-studentId')
      .populate('formId')
      .populate('courseId', 'courseCode courseName department')
      .populate({
        path: 'facultyId',
        populate: { path: 'userId', select: 'name email' },
      });

    if (!response) {
      return res.status(404).json({ success: false, message: 'Feedback response not found' });
    }

    // Map ratings to questions
    const questionMap = new Map();
    if (response.formId && Array.isArray(response.formId.questions)) {
      response.formId.questions.forEach((q) => {
        questionMap.set(q.questionId, q.questionText);
      });
    }

    const ratingsWithQuestions = response.ratings.map((r) => ({
      questionId: r.questionId,
      questionText: questionMap.get(r.questionId) || `Evaluation Criteria (${r.questionId})`,
      ratingValue: r.ratingValue,
    }));

    res.status(200).json({
      success: true,
      response: {
        ...response.toObject(),
        ratingsWithQuestions,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  submitFeedback,
  getMySubmissions,
  getResponsesByForm,
  getAllResponses,
  getResponseById,
};
