/**
 * Quiz grading utilities
 * Handles automatic and manual grading of quiz attempts
 */

/**
 * Grade a single MCQ question
 * @param {Object} question Question object with correct answer
 * @param {Object} answer Student's answer
 * @returns {Object} Grading result
 */
function gradeMCQ(question, answer) {
  const isCorrect = answer.answer === question.correctAnswer;
  return {
    questionId: question.id,
    mark: isCorrect ? question.marks : 0,
    correct: isCorrect,
    feedback: isCorrect ? 'Correct answer' : 'Incorrect answer'
  };
}

/**
 * Grade an entire quiz attempt
 * @param {Object} quiz Full quiz object with questions and correct answers
 * @param {Array} answers Student's answers
 * @returns {Object} Grading details and total marks
 */
function gradeQuizAttempt(quiz, answers) {
  const gradingDetails = quiz.questions.map(question => {
    const answer = answers.find(a => a.questionId === question.id);
    if (!answer) {
      return {
        questionId: question.id,
        mark: 0,
        correct: false,
        feedback: 'No answer provided'
      };
    }

    // Grade based on question type
    switch (question.type) {
      case 'mcq':
        return gradeMCQ(question, answer);
      
      case 'text':
      case 'code':
        return {
          questionId: question.id,
          mark: 0, // Initially 0 until manual grading
          correct: null,
          feedback: 'Pending manual grading'
        };
      
      default:
        console.warn(`Unknown question type: ${question.type}`);
        return {
          questionId: question.id,
          mark: 0,
          correct: null,
          feedback: 'Unable to grade unknown question type'
        };
    }
  });

  // Calculate total marks and determine if fully graded
  const totalMarks = gradingDetails.reduce((sum, detail) => sum + detail.mark, 0);
  const isFullyGraded = gradingDetails.every(detail => detail.correct !== null);

  return {
    gradingDetails,
    totalMarks,
    isFullyGraded
  };
}

module.exports = {
  gradeMCQ,
  gradeQuizAttempt
};