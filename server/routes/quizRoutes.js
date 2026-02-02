/**
 * Quiz routes
 * Handles quiz CRUD operations, assignments, and attempt management
 */

const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  createQuiz,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  getAssignedQuizzesForEmail,
  createQuizAttempt,
  getAttemptsForQuiz,
  gradeAttempt
} = require('../utils/dataUtils');
const { getUserById } = require('../utils/dataUtils');

/**
 * Role-based authorization middleware
 */
const roleAuth = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const user = await getUserById(req.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: 'Access denied. Insufficient role.' });
      }
      req.user = user;
      next();
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  };
};

/**
 * @route   POST /api/quiz
 * @desc    Create new quiz
 * @access  Private (Teacher)
 */
router.post('/', [authMiddleware, roleAuth(['teacher'])], async (req, res) => {
  try {
    const quizData = {
      ...req.body,
      teacherId: req.userId
    };

    const quiz = await createQuiz(quizData);
    
    res.status(201).json({
      message: 'Quiz created successfully',
      quiz: quiz.toTeacherView()
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/quiz/:quizId
 * @desc    Get quiz by ID (teachers see full quiz, students see assigned quizzes without answers)
 * @access  Private
 */
router.get('/:quizId', authMiddleware, async (req, res) => {
  try {
    const quiz = await getQuizById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const user = await getUserById(req.userId);

    // Teachers can see everything
    if (user.role === 'teacher') {
      if (quiz.teacherId !== req.userId) {
        return res.status(403).json({ message: 'Access denied. Not the quiz owner.' });
      }
      return res.json({ quiz: quiz.toTeacherView() });
    }

    // Students can only see assigned quizzes
    if (!quiz.assignedStudentEmails.includes(user.email.toLowerCase())) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Return student view (without answers)
    res.json({ quiz: quiz.toStudentView() });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   PUT /api/quiz/:quizId
 * @desc    Update quiz
 * @access  Private (Teacher)
 */
router.put('/:quizId', [authMiddleware, roleAuth(['teacher'])], async (req, res) => {
  try {
    const quiz = await getQuizById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (quiz.teacherId !== req.userId) {
      return res.status(403).json({ message: 'Access denied. Not the quiz owner.' });
    }

    const updatedQuiz = await updateQuiz(req.params.quizId, req.body);
    res.json({
      message: 'Quiz updated successfully',
      quiz: updatedQuiz.toTeacherView()
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   DELETE /api/quiz/:quizId
 * @desc    Delete quiz
 * @access  Private (Teacher)
 */
router.delete('/:quizId', [authMiddleware, roleAuth(['teacher'])], async (req, res) => {
  try {
    const quiz = await getQuizById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (quiz.teacherId !== req.userId) {
      return res.status(403).json({ message: 'Access denied. Not the quiz owner.' });
    }

    await deleteQuiz(req.params.quizId);
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/quiz/assigned
 * @desc    Get all quizzes assigned to the student
 * @access  Private (Student)
 */
router.get('/assigned', [authMiddleware, roleAuth(['student'])], async (req, res) => {
  try {
    const quizzes = await getAssignedQuizzesForEmail(req.user.email);
    res.json({
      quizzes: quizzes.map(quiz => quiz.toStudentView())
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/quiz/:quizId/start
 * @desc    Start a quiz attempt
 * @access  Private (Student)
 */
router.post('/:quizId/start', [authMiddleware, roleAuth(['student'])], async (req, res) => {
  try {
    const quiz = await getQuizById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Verify student is assigned to this quiz
    if (!quiz.assignedStudentEmails.includes(req.user.email.toLowerCase())) {
      return res.status(403).json({ message: 'Access denied. Quiz not assigned to you.' });
    }

    // Check verification status if quiz requires it
    if (quiz.requireVerified && req.user.verificationStatus !== 'verified') {
      return res.status(403).json({ message: 'This quiz requires verified status.' });
    }

    // Create attempt record
    const attempt = await createQuizAttempt({
      quizId: quiz.id,
      studentId: req.userId,
      studentEmail: req.user.email,
      usedAccessibilityFeatures: req.user.accessibilityFeatures,
      verificationSnapshot: {
        verificationStatus: req.user.verificationStatus,
        recommendedFeatures: req.user.recommendedFeatures,
        confidenceScore: req.user.confidenceScore
      }
    });

    res.json({
      message: 'Quiz attempt started',
      attemptId: attempt.id,
      timeLimit: quiz.timeLimit
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/quiz/:quizId/results
 * @desc    Get quiz results (teacher view)
 * @access  Private (Teacher)
 */
router.get('/:quizId/results', [authMiddleware, roleAuth(['teacher'])], async (req, res) => {
  try {
    const quiz = await getQuizById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (quiz.teacherId !== req.userId) {
      return res.status(403).json({ message: 'Access denied. Not the quiz owner.' });
    }

    const attempts = await getAttemptsForQuiz(req.params.quizId);
    res.json({
      attempts: attempts.map(attempt => attempt.toTeacherView())
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/quiz/:quizId/submit
 * @desc    Submit quiz answers and get grading
 * @access  Private (Student)
 */
router.post('/:quizId/submit', [authMiddleware, roleAuth(['student'])], async (req, res) => {
  try {
    const { attemptId, answers } = req.body;
    if (!attemptId || !answers) {
      return res.status(400).json({ message: 'Missing attempt ID or answers' });
    }

    const quiz = await getQuizById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Verify attempt belongs to student
    const attempt = await getAttemptById(attemptId);
    if (!attempt || attempt.studentId !== req.userId) {
      return res.status(403).json({ message: 'Invalid attempt' });
    }

    if (attempt.submittedAt) {
      return res.status(400).json({ message: 'Quiz already submitted' });
    }

    // Calculate time taken
    const timeTaken = new Date() - new Date(attempt.startedAt);
    
    // Auto-grade MCQ questions, mark others for manual grading
    const gradingDetails = quiz.questions.map(question => {
      const answer = answers.find(a => a.questionId === question.id);
      if (!answer) {
        return { questionId: question.id, mark: 0, correct: false };
      }

      if (question.type === 'mcq') {
        const correct = answer.answer === question.correctAnswer;
        return {
          questionId: question.id,
          mark: correct ? question.marks : 0,
          correct,
          feedback: correct ? 'Correct answer' : 'Incorrect answer'
        };
      }

      // For non-MCQ questions, mark as pending manual grading
      return {
        questionId: question.id,
        mark: 0,
        correct: null,
        feedback: 'Pending manual grading'
      };
    });

    // Calculate total marks for auto-graded questions
    const marksAwarded = gradingDetails.reduce((total, detail) => total + detail.mark, 0);

    // Update attempt with submission details
    const updatedAttempt = await gradeAttempt(attemptId, {
      submittedAt: new Date().toISOString(),
      timeTaken,
      answers,
      marksAwarded,
      gradingDetails,
      graded: gradingDetails.every(detail => detail.correct !== null),
      isAutoGraded: true
    });

    res.json({
      message: 'Quiz submitted successfully',
      attempt: updatedAttempt.toStudentView()
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   PUT /api/quiz/:quizId/grade
 * @desc    Manual grading by teacher
 * @access  Private (Teacher)
 */
router.put('/:quizId/grade', [authMiddleware, roleAuth(['teacher'])], async (req, res) => {
  try {
    const { attemptId, gradingDetails } = req.body;
    if (!attemptId || !gradingDetails) {
      return res.status(400).json({ message: 'Missing attempt ID or grading details' });
    }

    const quiz = await getQuizById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (quiz.teacherId !== req.userId) {
      return res.status(403).json({ message: 'Access denied. Not the quiz owner.' });
    }

    // Update attempt with manual grading
    const marksAwarded = gradingDetails.reduce((total, detail) => total + detail.mark, 0);
    const updatedAttempt = await gradeAttempt(attemptId, {
      gradingDetails,
      marksAwarded,
      graded: true,
      isAutoGraded: false
    });

    res.json({
      message: 'Quiz graded successfully',
      attempt: updatedAttempt.toTeacherView()
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;