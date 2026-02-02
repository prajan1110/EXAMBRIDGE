import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { api } from '@/services/api';

interface Question {
  id: string;
  type: string;
  question: string;
  options?: string[];
  marks: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  requireVerified: boolean;
}

export default function TakeQuiz() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [accessibilityFeatures, setAccessibilityFeatures] = useState({
    tts: false,
    stt: false,
    dyslexicFont: false,
    highContrast: false,
    fontSize: 16,
    darkMode: false,
    extraTime: false,
    captions: false,
    keyboardOnly: false
  });

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const [quizResponse, userResponse] = await Promise.all([
          api.get(`/quiz/${quizId}`),
          api.get('/auth/me')
        ]);

        setQuiz(quizResponse.data.quiz);
        setAccessibilityFeatures(userResponse.data.user.accessibilityFeatures);

        // Apply accessibility features
        document.body.style.fontSize = `${userResponse.data.user.accessibilityFeatures.fontSize}px`;
        if (userResponse.data.user.accessibilityFeatures.dyslexicFont) {
          document.body.style.fontFamily = 'OpenDyslexic, sans-serif';
        }
        if (userResponse.data.user.accessibilityFeatures.highContrast) {
          document.body.classList.add('high-contrast');
        }
      } catch (err) {
        setError('Failed to load quiz');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();

    // Cleanup function
    return () => {
      document.body.style.fontSize = '';
      document.body.style.fontFamily = '';
      document.body.classList.remove('high-contrast');
    };
  }, [quizId]);

  const startQuiz = async () => {
    if (!confirmed) {
      setError('Please confirm that you will follow exam rules');
      return;
    }

    try {
      const response = await api.post(`/quiz/${quizId}/start`);
      setAttemptId(response.data.attemptId);
      setTimeLeft(response.data.timeLimit);

      // Start timer
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null || prev <= 0) {
            clearInterval(timer);
            submitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    } catch (err) {
      console.error('Failed to start quiz:', err);
      setError('Failed to start quiz');
    }
  };

  const submitQuiz = async () => {
    if (!attemptId) return;

    try {
      const response = await api.post(`/quiz/${quizId}/submit`, {
        attemptId,
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer
        }))
      });

      navigate(`/student/quiz/${quizId}/results`, {
        state: { attempt: response.data.attempt }
      });
    } catch (err) {
      console.error('Failed to submit quiz:', err);
      setError('Failed to submit quiz');
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <Alert variant="destructive">{error}</Alert>;
  if (!quiz) return <Alert>Quiz not found</Alert>;

  if (!attemptId) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-4">{quiz.title}</h1>
          <p className="text-gray-600 mb-6">{quiz.description}</p>

          <div className="space-y-4 mb-6">
            <h2 className="font-semibold">Exam Rules:</h2>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Complete all questions within the time limit</li>
              <li>Do not switch browser tabs or windows</li>
              <li>Ensure stable internet connection</li>
              <li>Submit your answers before time runs out</li>
            </ul>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={confirmed}
                onCheckedChange={(checked) => setConfirmed(checked as boolean)}
                id="confirm"
              />
              <label htmlFor="confirm" className="text-sm">
                I confirm that I will follow all exam rules and use accessibility features as needed
              </label>
            </div>
          </div>

          <Button onClick={startQuiz} disabled={!confirmed} className="w-full">
            Start Quiz
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="sticky top-0 bg-white p-4 shadow mb-6 flex justify-between items-center">
        <h1 className="text-xl font-bold">{quiz.title}</h1>
        <div className="flex items-center space-x-4">
          {timeLeft !== null && (
            <div className="text-lg">
              Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          )}
          <Button onClick={submitQuiz}>Submit Quiz</Button>
        </div>
      </div>

      <div className="space-y-6 max-w-3xl mx-auto">
        {quiz.questions.map((question, index) => (
          <Card key={question.id} className="p-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold">Question {index + 1}</h3>
              <span className="text-sm text-gray-600">Marks: {question.marks}</span>
            </div>

            <p className={accessibilityFeatures.dyslexicFont ? 'font-dyslexic' : ''}>
              {question.question}
            </p>

            <div className="mt-4">
              {question.type === 'mcq' ? (
                <div className="space-y-2">
                  {question.options?.map((option, i) => (
                    <label key={i} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="rounded-full"
                      />
                      <span className={accessibilityFeatures.dyslexicFont ? 'font-dyslexic' : ''}>
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-full p-2 border rounded"
                  rows={4}
                  style={{
                    fontSize: `${accessibilityFeatures.fontSize}px`,
                    fontFamily: accessibilityFeatures.dyslexicFont ? 'OpenDyslexic' : 'inherit'
                  }}
                />
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}