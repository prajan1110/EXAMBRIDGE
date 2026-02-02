import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { api } from '@/services/api';

interface Quiz {
  id: string;
  title: string;
  description: string;
  isPublished: boolean;
  createdAt: string;
  assignedStudentEmails: string[];
  requireVerified: boolean;
}

export default function QuizList() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await api.get('/quiz/teacher');
        setQuizzes(response.data.quizzes);
      } catch (err) {
        setError('Failed to load quizzes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleDeleteQuiz = async (quizId: string) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) {
      return;
    }

    try {
      await api.delete(`/quiz/${quizId}`);
      setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
    } catch (err) {
      console.error('Failed to delete quiz:', err);
    }
  };

  const handlePublishToggle = async (quizId: string, currentStatus: boolean) => {
    try {
      await api.put(`/quiz/${quizId}`, {
        isPublished: !currentStatus
      });
      
      setQuizzes(quizzes.map(quiz => 
        quiz.id === quizId 
          ? { ...quiz, isPublished: !currentStatus }
          : quiz
      ));
    } catch (err) {
      console.error('Failed to toggle quiz status:', err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <Alert variant="destructive">{error}</Alert>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Quizzes</h1>
        <Button onClick={() => navigate('/teacher/quiz/create')}>
          Create New Quiz
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-lg font-semibold">{quiz.title}</h2>
              <div className="flex items-center space-x-2">
                <Button
                  variant={quiz.isPublished ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => handlePublishToggle(quiz.id, quiz.isPublished)}
                >
                  {quiz.isPublished ? 'Published' : 'Draft'}
                </Button>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">{quiz.description}</p>
            
            <div className="text-sm text-gray-600 space-y-1 mb-4">
              <p>Created: {new Date(quiz.createdAt).toLocaleDateString()}</p>
              <p>Students: {quiz.assignedStudentEmails.length}</p>
              {quiz.requireVerified && (
                <p className="text-blue-600">Requires Verification</p>
              )}
            </div>

            <div className="flex justify-between items-center">
              <div className="space-x-2">
                <Link
                  to={`/teacher/quiz/${quiz.id}/edit`}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </Link>
                <Link
                  to={`/teacher/quiz/${quiz.id}/results`}
                  className="text-green-600 hover:underline"
                >
                  Results
                </Link>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteQuiz(quiz.id)}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {quizzes.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No quizzes created yet.</p>
          <Button
            onClick={() => navigate('/teacher/quiz/create')}
            className="mt-4"
          >
            Create Your First Quiz
          </Button>
        </div>
      )}
    </div>
  );
}