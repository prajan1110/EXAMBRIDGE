import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ScrollText, FileText, Users, Accessibility, 
  Brain, Shield 
} from 'lucide-react';

export const Explore: React.FC = () => {
  // Sample demo quizzes that don't require login
  const demoQuizzes = [
    {
      id: 'demo1',
      title: 'Basic Mathematics',
      description: 'Try out basic math problems with accessibility features',
      subject: 'Math',
      questions: 5,
      timeLimit: '10 mins'
    },
    {
      id: 'demo2',
      title: 'Reading Comprehension',
      description: 'Test our text-to-speech and dyslexia support features',
      subject: 'English',
      questions: 3,
      timeLimit: '15 mins'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-6">
              Experience Inclusive Learning
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Try out our accessible quiz platform. No login required. Experience our accessibility features firsthand.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 bg-muted/50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Accessibility className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Accessibility First</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Experience our dyslexia-friendly fonts, text-to-speech, and high contrast modes.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Brain className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Smart Features</CardTitle>
              </CardHeader>
              <CardContent>
                <p>AI-powered certificate verification and personalized accommodations.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Secure Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Protected exam environment with anti-cheat measures.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Quizzes */}
      <section className="py-12">
        <div className="container">
          <h2 className="text-2xl font-bold mb-6">Try Demo Quizzes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {demoQuizzes.map((quiz) => (
              <Card key={quiz.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{quiz.title}</CardTitle>
                      <CardDescription>{quiz.description}</CardDescription>
                    </div>
                    <Badge>{quiz.subject}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-sm">Questions: {quiz.questions}</p>
                      <p className="text-sm">Time: {quiz.timeLimit}</p>
                    </div>
                    <Button 
                      onClick={() => window.location.href = `/demo/quiz/${quiz.id}`}
                      variant="outline"
                    >
                      Try Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-primary/5">
        <div className="container text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-6">
            Create an account to access full features and track your progress.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/auth">
              <Button size="lg">Sign Up Now</Button>
            </Link>
            <Link to="/auth?mode=login">
              <Button variant="outline" size="lg">Log In</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};