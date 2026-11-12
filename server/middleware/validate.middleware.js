/**
 * Request Data Validation Middleware
 * Enforces schema constraints, field formatting, sanitization, and data integrity
 */

// Email regex pattern
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Course code pattern (e.g. CS101, MATH202, SE401, PHY301)
const COURSE_CODE_REGEX = /^[A-Z]{2,5}[0-9]{3,4}$/;

/**
 * Validate user registration payload
 */
export const validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Full name must be at least 2 characters long.');
  }

  if (!email || !EMAIL_REGEX.test(email.trim())) {
    errors.push('A valid email address is required (e.g. name@university.edu).');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password must be at least 6 characters in length.');
  }

  const validRoles = ['Student', 'Faculty', 'Administrator'];
  if (role && !validRoles.includes(role)) {
    errors.push(`Invalid role specified. Allowed roles: ${validRoles.join(', ')}.`);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors,
    });
  }

  next();
};

/**
 * Validate user login payload
 */
export const validateLogin = (req, res, next) => {
  const { email, username, password } = req.body;
  const identifier = email || username;

  if (!identifier || typeof identifier !== 'string' || identifier.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Email or username is required.',
    });
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Password is required.',
    });
  }

  next();
};

/**
 * Validate course creation payload
 */
export const validateCourse = (req, res, next) => {
  const { courseCode, courseName, department, semester, credits } = req.body;
  const errors = [];

  if (!courseCode || typeof courseCode !== 'string') {
    errors.push('Course code is required (e.g., CS101, MATH202).');
  } else {
    const cleanCode = courseCode.trim().toUpperCase();
    if (!COURSE_CODE_REGEX.test(cleanCode)) {
      errors.push('Course code must follow format: 2-5 uppercase letters followed by 3-4 digits (e.g. CS101, SE401).');
    }
  }

  if (!courseName || typeof courseName !== 'string' || courseName.trim().length < 3) {
    errors.push('Course name must be at least 3 characters long.');
  }

  if (!department || typeof department !== 'string' || department.trim().length === 0) {
    errors.push('Department is required.');
  }

  if (credits !== undefined) {
    const credNum = Number(credits);
    if (isNaN(credNum) || credNum < 1 || credNum > 10) {
      errors.push('Course credits must be a number between 1 and 10.');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors,
    });
  }

  next();
};

/**
 * Validate feedback form creation payload
 */
export const validateFeedbackForm = (req, res, next) => {
  const { courseId, facultyId, title, endDate, questions } = req.body;
  const errors = [];

  if (!courseId) {
    errors.push('Target courseId is required.');
  }

  if (!facultyId) {
    errors.push('Target facultyId is required.');
  }

  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    errors.push('Feedback form title must be at least 3 characters long.');
  }

  if (!endDate) {
    errors.push('Submission deadline (endDate) is required.');
  } else {
    const end = new Date(endDate);
    if (isNaN(end.getTime())) {
      errors.push('Invalid endDate date format.');
    }
  }

  if (questions && Array.isArray(questions)) {
    questions.forEach((q, idx) => {
      if (!q.questionText || typeof q.questionText !== 'string' || q.questionText.trim().length === 0) {
        errors.push(`Question #${idx + 1} must have non-empty questionText.`);
      }
      if (q.questionType && !['Rating', 'Text'].includes(q.questionType)) {
        errors.push(`Question #${idx + 1} questionType must be 'Rating' or 'Text'.`);
      }
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors,
    });
  }

  next();
};

/**
 * Validate student feedback submission payload
 */
export const validateFeedbackResponse = (req, res, next) => {
  const { formId, ratings } = req.body;
  const errors = [];

  if (!formId) {
    errors.push('formId is required.');
  }

  if (!ratings || !Array.isArray(ratings) || ratings.length === 0) {
    errors.push('Ratings array is required with at least one question response.');
  } else {
    ratings.forEach((r, idx) => {
      if (!r.questionId) {
        errors.push(`Rating item #${idx + 1} is missing questionId.`);
      }
      const val = Number(r.ratingValue);
      if (isNaN(val) || val < 1 || val > 5) {
        errors.push(`Rating for question ${r.questionId || idx + 1} must be an integer between 1 and 5.`);
      }
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors,
    });
  }

  next();
};

export default {
  validateRegister,
  validateLogin,
  validateCourse,
  validateFeedbackForm,
  validateFeedbackResponse,
};
