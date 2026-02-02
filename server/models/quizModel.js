/**
 * Quiz model definition
 * Contains quiz data including questions, assignments, and metadata
 */

class Quiz {
  constructor(data) {
    this.id = data.id || Math.random().toString(36).substring(2, 15);
    this.teacherId = data.teacherId;
    this.title = data.title;
    this.description = data.description || '';
    this.questions = data.questions.map(q => ({
      id: q.id || Math.random().toString(36).substring(2, 15),
      type: q.type,
      question: q.question,
      options: q.type === 'mcq' ? q.options : undefined,
      correctAnswer: q.correctAnswer,
      marks: q.marks || 1,
      metadata: q.metadata || {}
    }));
    this.assignedStudentEmails = (data.assignedStudentEmails || []).map(email => email.toLowerCase());
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.isPublished = data.isPublished || false;
    this.requireVerified = data.requireVerified || false;
  }

  // Remove sensitive data (like correct answers) before sending to students
  toStudentView() {
    return {
      ...this,
      questions: this.questions.map(({ correctAnswer, ...q }) => q)
    };
  }

  // Full view for teachers includes everything
  toTeacherView() {
    return this;
  }
}

module.exports = Quiz;