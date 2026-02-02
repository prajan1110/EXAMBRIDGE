import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { BookOpen, Clock, CheckCircle2, AlertCircle, PlayCircle } from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  description: string;
  duration: number;
  totalQuestions: number;
  status: 'not-started' | 'in-progress' | 'completed';
  score?: number;
  createdBy: string;
}

export const StudentDashboard: React.FC = () => {
  const { profile } = useAccessibility();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    // Load quizzes from localStorage (created by teachers)
    const storedQuizzes = localStorage.getItem('quizzes');
    if (storedQuizzes) {
      setQuizzes(JSON.parse(storedQuizzes));
    } else {
      // Demo quizzes
      const demoQuizzes: Quiz[] = [
        {
          id: '1',
          title: 'Introduction to Web Accessibility',
          description: 'Test your knowledge of WCAG guidelines and accessible design principles',
          duration: 30,
          totalQuestions: 10,
          status: 'not-started',
          createdBy: 'Prof. Smith',
        },
        {
          id: '2',
          title: 'React Fundamentals',
          description: 'Assess your understanding of React hooks, components, and state management',
          duration: 45,
          totalQuestions: 15,
          status: 'not-started',
          createdBy: 'Dr. Johnson',
        },
        {
          id: '3',
          title: 'Inclusive Design Patterns',
          description: 'Explore best practices for creating inclusive user experiences',
          duration: 25,
          totalQuestions: 12,
          status: 'not-started',
          createdBy: 'Prof. Chen',
        },
      ];
      setQuizzes(demoQuizzes);
      localStorage.setItem('quizzes', JSON.stringify(demoQuizzes));
    }
  }, []);

  const getStatusBadge = (status: Quiz['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success text-success-foreground"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-warning text-warning-foreground"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>;
      default:
        return <Badge variant="outline"><AlertCircle className="h-3 w-3 mr-1" />Not Started</Badge>;
    }
  };

  return (
    <div className="container max-w-6xl py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Student Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {profile?.name}!</p>
        </div>

        {profile?.verificationStatus === 'verified' && (
          <Card className="bg-success/10 border-success/20">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 text-success-foreground">
                <CheckCircle2 className="h-5 w-5" />
                <div>
                  <p className="font-semibold text-sm">Accessibility Verified</p>
                  <p className="text-xs capitalize">{profile.disabilityType.replace('-', ' ')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Verification Prompt */}
      {profile?.verificationStatus === 'none' && (
        <Card className="mb-8 border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Complete Your Accessibility Profile
            </CardTitle>
            <CardDescription>
              Upload your medical certificate to unlock personalized accessibility features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/student/profile">
              <Button variant="default">
                Upload Certificate
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{quizzes.length}</p>
                <p className="text-sm text-muted-foreground">Available Quizzes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-success/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-success/10">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{quizzes.filter(q => q.status === 'completed').length}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-warning/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-warning/10">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{quizzes.filter(q => q.status === 'in-progress').length}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Quizzes */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Available Quizzes</h2>
        
        {quizzes.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No quizzes available yet. Check back later!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-lg transition-smooth">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle>{quiz.title}</CardTitle>
                        {getStatusBadge(quiz.status)}
                      </div>
                      <CardDescription>{quiz.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {quiz.duration} min
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {quiz.totalQuestions} questions
                      </span>
                      <span>By {quiz.createdBy}</span>
                    </div>

                    <div className="flex gap-2">
                      {quiz.status === 'completed' && quiz.score !== undefined && (
                        <Link to={`/student/results/${quiz.id}`}>
                          <Button variant="outline" size="sm">
                            View Results
                          </Button>
                        </Link>
                      )}
                      
                      <Link to={`/student/exam/${quiz.id}`}>
                        <Button size="sm">
                          <PlayCircle className="h-4 w-4 mr-2" />
                          {quiz.status === 'completed' ? 'Retake' : quiz.status === 'in-progress' ? 'Continue' : 'Start Quiz'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
