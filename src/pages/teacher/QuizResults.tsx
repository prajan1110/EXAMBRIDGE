import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';

interface QuizAttempt {
  id: string;
  studentEmail: string;
  startedAt: string;
  submittedAt: string;
  timeTaken: number;
  marksAwarded: number;
  graded: boolean;
  usedAccessibilityFeatures: {
    tts: boolean;
    stt: boolean;
    dyslexicFont: boolean;
    highContrast: boolean;
    fontSize: number;
    darkMode: boolean;
    extraTime: boolean;
    captions: boolean;
    keyboardOnly: boolean;
  };
  verificationSnapshot: {
    verificationStatus: string;
    recommendedFeatures: string[];
    confidenceScore: number;
  };
  gradingDetails: {
    questionId: string;
    mark: number;
    correct: boolean | null;
    feedback: string;
  }[];
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: {
    id: string;
    type: string;
    question: string;
    marks: number;
  }[];
}

export default function QuizResults() {
  const { quizId } = useParams<{ quizId: string }>();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Fetch quiz details
        const quizResponse = await api.get(`/quiz/${quizId}`);
        setQuiz(quizResponse.data.quiz);

        // Fetch attempts
        const attemptsResponse = await api.get(`/quiz/${quizId}/results`);
        setAttempts(attemptsResponse.data.attempts);
      } catch (err) {
        setError('Failed to load quiz results');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [quizId]);

  const handleGrade = async (attemptId: string, gradingDetails: any) => {
    try {
      await api.put(`/quiz/${quizId}/grade`, {
        attemptId,
        gradingDetails
      });
      
      // Refresh attempts after grading
      const response = await api.get(`/quiz/${quizId}/results`);
      setAttempts(response.data.attempts);
    } catch (err) {
      console.error('Failed to grade attempt:', err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <Alert variant="destructive">{error}</Alert>;
  if (!quiz) return <Alert>Quiz not found</Alert>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{quiz.title} - Results</h1>
      <p className="text-gray-600 mb-6">{quiz.description}</p>

      <div className="space-y-6">
        {attempts.map((attempt) => (
          <div key={attempt.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold">{attempt.studentEmail}</h3>
                <p className="text-sm text-gray-600">
                  Submitted: {new Date(attempt.submittedAt).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Time Taken: {Math.round(attempt.timeTaken / 1000 / 60)} minutes
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">
                  Marks: {attempt.marksAwarded} / {quiz.questions.reduce((sum, q) => sum + q.marks, 0)}
                </p>
                <p className="text-sm text-gray-600">
                  Status: {attempt.graded ? 'Graded' : 'Pending Review'}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold mb-2">Accessibility Features Used:</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(attempt.usedAccessibilityFeatures)
                  .filter(([, value]) => value)
                  .map(([feature]) => (
                    <span key={feature} className="px-2 py-1 bg-blue-100 rounded text-sm">
                      {feature}
                    </span>
                  ))}
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold mb-2">Verification Status:</h4>
              <div className="flex gap-2 items-center">
                <span className={`px-2 py-1 rounded text-sm ${
                  attempt.verificationSnapshot.verificationStatus === 'verified'
                    ? 'bg-green-100'
                    : 'bg-yellow-100'
                }`}>
                  {attempt.verificationSnapshot.verificationStatus}
                </span>
                <span className="text-sm text-gray-600">
                  Confidence: {(attempt.verificationSnapshot.confidenceScore * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Answers & Grading:</h4>
              {attempt.gradingDetails.map((detail, index) => (
                <div key={detail.questionId} className="border-t pt-2">
                  <p className="font-medium">Question {index + 1}</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm">Marks: {detail.mark}</p>
                      {detail.correct === null ? (
                        <div className="mt-2">
                          <input
                            type="number"
                            className="w-20 border rounded p-1"
                            placeholder="Marks"
                            onChange={(e) => {
                              const newDetails = [...attempt.gradingDetails];
                              newDetails[index] = {
                                ...detail,
                                mark: parseInt(e.target.value),
                                correct: parseInt(e.target.value) > 0
                              };
                              handleGrade(attempt.id, newDetails);
                            }}
                          />
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">
                          {detail.correct ? 'Correct' : 'Incorrect'}
                        </p>
                      )}
                    </div>
                    <textarea
                      className="border rounded p-1 text-sm w-1/2"
                      placeholder="Feedback"
                      value={detail.feedback}
                      onChange={(e) => {
                        const newDetails = [...attempt.gradingDetails];
                        newDetails[index] = {
                          ...detail,
                          feedback: e.target.value
                        };
                        handleGrade(attempt.id, newDetails);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};