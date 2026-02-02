import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { api } from '@/services/api';

interface Quiz {
  id: string;
  title: string;
  description: string;
  requireVerified: boolean;
  questions: {
    id: string;
    type: string;
    question: string;
    options?: string[];
  }[];
}

export default function AssignedQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user's verification status
        const userResponse = await api.get('/auth/me');
        setVerificationStatus(userResponse.data.user.verificationStatus);

        // Fetch assigned quizzes
        const quizzesResponse = await api.get('/quiz/assigned');
        setQuizzes(quizzesResponse.data.quizzes);
      } catch (err) {
        setError('Failed to load quizzes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <Alert variant="destructive">{error}</Alert>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Quizzes</h1>

      {verificationStatus !== 'verified' && (
        <Alert className="mb-6">
          <p>
            Some quizzes may require verification to access additional accessibility features.
            {verificationStatus === 'none' ? (
              <Link to="/profile" className="text-blue-600 hover:underline ml-2">
                Upload your certificate
              </Link>
            ) : verificationStatus === 'pending' ? (
              <span className="text-yellow-600 ml-2">
                Your verification is pending
              </span>
            ) : null}
          </p>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="p-4">
            <h2 className="text-lg font-semibold mb-2">{quiz.title}</h2>
            <p className="text-sm text-gray-600 mb-4">{quiz.description}</p>
            
            <div className="text-sm text-gray-600 space-y-1 mb-4">
              <p>Questions: {quiz.questions.length}</p>
              {quiz.requireVerified && (
                <p className="text-blue-600">
                  Requires Verification
                  {verificationStatus !== 'verified' && (
                    <span className="text-red-600 ml-2">
                      (Not Available)
                    </span>
                  )}
                </p>
              )}
            </div>

            <Button
              disabled={quiz.requireVerified && verificationStatus !== 'verified'}
              onClick={() => window.location.href = `/student/quiz/${quiz.id}/take`}
              className="w-full"
            >
              Start Quiz
            </Button>
          </Card>
        ))}
      </div>

      {quizzes.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No quizzes assigned yet.</p>
        </div>
      )}
    </div>
  );
}