/**
 * QuizAttempt model definition
 * Contains student's quiz attempt data including answers and grading
 */

class QuizAttempt {
  constructor(data) {
    this.id = data.id || Math.random().toString(36).substring(2, 15);
    this.quizId = data.quizId;
    this.studentId = data.studentId;
    this.studentEmail = data.studentEmail.toLowerCase();
    this.startedAt = data.startedAt || new Date().toISOString();
    this.submittedAt = data.submittedAt || null;
    this.timeTaken = data.timeTaken || null;
    
    // Store answers with timing data per question
    this.answers = (data.answers || []).map(a => ({
      questionId: a.questionId,
      answer: a.answer,
      timeSpent: a.timeSpent || 0
    }));

    this.marksAwarded = data.marksAwarded || 0;
    this.graded = data.graded || false;
    this.gradingDetails = data.gradingDetails || [];
    
    // Snapshot of student's accessibility configuration during attempt
    this.usedAccessibilityFeatures = data.usedAccessibilityFeatures || {
      tts: false,
      stt: false,
      dyslexicFont: false,
      highContrast: false,
      fontSize: 16,
      darkMode: false,
      extraTime: false,
      captions: false,
      keyboardOnly: false
    };

    // Snapshot of verification status when attempt started
    this.verificationSnapshot = data.verificationSnapshot || {
      verificationStatus: 'none',
      recommendedFeatures: [],
      confidenceScore: 0
    };

    this.isAutoGraded = data.isAutoGraded || false;
  }

  // Remove sensitive data before sending to students
  toStudentView() {
    const { gradingDetails, ...basicData } = this;
    return {
      ...basicData,
      gradingDetails: this.gradingDetails.map(({ correct, feedback, ...rest }) => rest)
    };
  }

  // Full view for teachers includes everything
  toTeacherView() {
    return this;
  }
}

module.exports = QuizAttempt;