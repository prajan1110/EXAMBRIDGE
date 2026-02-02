import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useExamLockdownContext } from '@/contexts/ExamLockdownContext';
import { ExamSecurityNotice } from '@/components/ExamSecurityNotice';
import { ExamSecurityWarning } from '@/components/ExamSecurityWarning';
import { ExamTimer } from '@/components/ExamTimer';
import { 
  Clock, Volume2, Mic, ChevronLeft, ChevronRight, Flag, 
  ShieldAlert, Shield, AlertTriangle, Timer 
} from 'lucide-react';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

interface Question {
  id: string;
  type: 'mcq' | 'short-answer';
  question: string;
  options?: string[];
  answer?: string;
}

export const Exam: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { features, profile } = useAccessibility();
  const { 
    isLockdownActive, 
    startSecureExam, 
    endSecureExam,
    securityViolations,
    warningCount,
    examStartTime,
    getExamDuration
  } = useExamLockdownContext();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSecurityNotice, setShowSecurityNotice] = useState(true);
  const [examStarted, setExamStarted] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [warningType, setWarningType] = useState<'warning' | 'error' | 'info'>('warning');

  // Original questions
  const originalQuestions: Question[] = [
    {
      id: '1',
      type: 'mcq',
      question: 'What does WCAG stand for in web accessibility?',
      options: [
        'Web Content Accessibility Guidelines',
        'World Compliance Accessibility Group',
        'Website Color and Graphics',
        'Web Component Access Gateway',
      ],
    },
    {
      id: '2',
      type: 'mcq',
      question: 'Which HTML element is most appropriate for navigation links?',
      options: ['<div>', '<nav>', '<header>', '<section>'],
    },
    {
      id: '3',
      type: 'short-answer',
      question: 'Explain why keyboard accessibility is important for web applications.',
    },
    {
      id: '4',
      type: 'mcq',
      question: 'What is the minimum contrast ratio for normal text according to WCAG AA?',
      options: ['3:1', '4.5:1', '7:1', '2.5:1'],
    },
    {
      id: '5',
      type: 'short-answer',
      question: 'Describe how screen readers help visually impaired users navigate websites.',
    },
  ];
  
  // Translated questions state
  const [questions, setQuestions] = useState<Question[]>(originalQuestions);

  // Apply extra time if feature is enabled
  useEffect(() => {
    if (features.extraTime) {
      setTimeLeft(prev => Math.floor(prev * 1.5)); // 50% extra time
    }
  }, [features.extraTime]);
  
  // Initialize questions
  useEffect(() => {
    setQuestions(originalQuestions);
  }, [originalQuestions]);

  // Watch security violations and show warnings
  useEffect(() => {
    if (securityViolations.length > 0 && examStarted) {
      const latestViolation = securityViolations[securityViolations.length - 1];
      
      // Don't show a warning for violations that occurred more than 5 seconds ago
      if (Date.now() - latestViolation.timestamp < 5000) {
        let message = '';
        
        // Customize message based on violation type
        switch(latestViolation.type) {
          case 'FULLSCREEN_EXIT':
            message = 'Exiting fullscreen mode is not permitted during the exam.';
            setWarningType('error');
            break;
          case 'PAGE_VISIBILITY_CHANGE':
            message = 'Switching tabs or minimizing the browser is not allowed.';
            setWarningType('error');
            break;
          case 'KEYBOARD_SHORTCUT':
            message = `Keyboard shortcut detected: ${latestViolation.details}. This is not allowed.`;
            setWarningType('warning');
            break;
          case 'CONTEXT_MENU':
            message = 'Right-clicking is disabled during the exam.';
            setWarningType('warning');
            break;
          case 'CLIPBOARD_OPERATION':
            message = 'Copy, cut, and paste operations are disabled during the exam.';
            setWarningType('warning');
            break;
          case 'DEV_TOOLS_OPEN':
            message = 'Developer tools are not allowed during this exam.';
            setWarningType('error');
            break;
          case 'BROWSER_NAVIGATION':
            message = 'Browser navigation is disabled during the exam.';
            setWarningType('warning');
            break;
          case 'EXTENDED_INACTIVITY':
            message = 'Extended inactivity detected. Please continue your exam.';
            setWarningType('info');
            break;
          default:
            message = 'A security violation was detected. This incident has been logged.';
            setWarningType('warning');
        }
        
        setWarningMessage(message);
        setShowWarning(true);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
          setShowWarning(false);
        }, 5000);
      }
    }
  }, [securityViolations, examStarted]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleTTS = () => {
    if (!features.tts) {
      toast.error('Text-to-Speech is not enabled');
      return;
    }

    const question = questions[currentQuestion];
    const text = question.type === 'mcq' 
      ? `${question.question}. Options: ${question.options?.join(', ')}`
      : question.question;

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
      toast.info('Reading question aloud');
    } else {
      toast.error('Text-to-Speech not supported in this browser');
    }
  };

  const handleSTT = () => {
    if (!features.stt) {
      toast.error('Speech-to-Text is not enabled');
      return;
    }
    toast.info('Speech-to-Text simulation: Speak your answer');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // End the secure exam mode if active
    if (isLockdownActive) {
      const examData = await endSecureExam();
      
      // Here you would normally send this data to your backend
      console.log('Exam completed with duration:', examData.examDuration, 'ms');
      console.log('Security violations:', examData.securityViolations.length);
    }

    // Calculate score (simplified)
    const answeredCount = Object.keys(answers).length;
    const score = Math.floor((answeredCount / questions.length) * 100);

    // Save results
    const quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
    const updatedQuizzes = quizzes.map((q: any) =>
      q.id === id ? { ...q, status: 'completed', score } : q
    );
    localStorage.setItem('quizzes', JSON.stringify(updatedQuizzes));

    // Prepare duration string from context helper
    const durationMs = getExamDuration();
    const mins = Math.max(0, Math.floor(durationMs / 60000));
    const secs = Math.max(0, Math.floor((durationMs % 60000) / 1000));
    const duration = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    toast.success('Exam submitted successfully!');
    
    setTimeout(() => {
      navigate(`/student/results/${id}`, {
        state: {
          results: {
            score,
            totalQuestions: questions.length,
            correctAnswers: answeredCount,
            duration,
            quizTitle: 'Quiz in Progress'
          }
        }
      });
    }, 1000);
  };

  // Handle starting the secure exam
  const handleStartSecureExam = async () => {
    const success = await startSecureExam();
    if (success) {
      setShowSecurityNotice(false);
      setExamStarted(true);
      toast.success('Secure exam mode activated');
      
      // Show a welcome message
      setWarningMessage('Secure exam environment activated. Your session is being monitored.');
      setWarningType('info');
      setShowWarning(true);
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setShowWarning(false);
      }, 5000);
    } else {
      toast.error('Failed to start secure exam mode. Please ensure fullscreen is allowed.');
    }
  };

  // Handle time up
  const handleTimeUp = () => {
    toast.warning('Time is up! Your exam will be submitted automatically.');
    handleSubmit();
  };

  // Handle closing the security notice
  const handleCloseSecurityNotice = () => {
    setShowSecurityNotice(false);
    navigate('/student/dashboard');
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];

  // Show exam start prompt if not started
  if (!examStarted) {
    return (
      <>
        <ExamSecurityNotice 
          open={showSecurityNotice}
          onClose={handleCloseSecurityNotice}
          onStartExam={handleStartSecureExam}
        />
        
        {!showSecurityNotice && (
          <div className="container max-w-4xl py-16 animate-fade-in">
            <Card className="p-8 border-2 border-warning/30 bg-card shadow-lg">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center">
                  <ShieldAlert className="h-8 w-8 text-warning" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Ready to Start Your Exam?</h2>
                  <p className="text-muted-foreground">
                    Click the button below to enter the secure exam environment.
                    Please ensure you're prepared before starting.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/student/dashboard')}
                  >
                    Return to Dashboard
                  </Button>
                  <Button 
                    onClick={() => setShowSecurityNotice(true)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    View Exam Security Notice
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Security Warning */}
      {showWarning && (
        <ExamSecurityWarning 
          message={warningMessage}
          type={warningType}
          onDismiss={() => setShowWarning(false)}
          autoDismiss={true}
          dismissTime={5000}
          violationCount={warningCount}
          maxViolations={3}
        />
      )}
      
      {/* Warning banner at top of exam */}
      <div className="exam-warning">
        <div className="flex items-center justify-center gap-2">
          <ShieldAlert className="h-4 w-4" />
          <span>Secure Exam Mode: Violations may result in automatic submission</span>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 exam-content container max-w-4xl py-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 mt-6">
          <div>
            <h1 className="text-2xl font-bold">Quiz in Progress</h1>
            <div className="flex items-center gap-2 text-sm mb-2">
              Question {currentQuestion + 1} of {questions.length}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {features.dyslexicFont && (
              <Badge variant="outline" className="text-xs">
                Dyslexic Font Enabled
              </Badge>
            )}
            
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border">
              <Timer className="h-4 w-4 text-primary" />
              <span className="font-mono font-semibold">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <Progress value={progress} className="mb-6" />

        {/* Question Card */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="flex-1 text-lg">
                {question.question}
              </CardTitle>
              
              <div className="flex gap-2 ml-4">
                {features.tts && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleTTS}
                    aria-label="Read question aloud"
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {question.type === 'mcq' ? (
              <RadioGroup
                value={answers[question.id] || ''}
                onValueChange={(value) => handleAnswer(question.id, value)}
              >
                {question.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted transition-smooth">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label
                      htmlFor={`option-${index}`}
                      className="flex-1 cursor-pointer"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="space-y-2">
                <div className="space-y-2">
                  <Label htmlFor="answer">Your Answer</Label>
                  {features.tts && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSTT}
                    >
                      <Mic className="h-4 w-4 mr-2" />
                      Voice Input
                    </Button>
                  )}
                </div>
                <Textarea
                  id="answer"
                  placeholder="Type your answer here..."
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-8 h-8 rounded-md text-sm font-medium transition-smooth ${
                  index === currentQuestion
                    ? 'bg-primary text-primary-foreground'
                    : answers[questions[index].id]
                    ? 'bg-success/20 text-success-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
                aria-label={`Go to question ${index + 1}`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestion < questions.length - 1 ? (
            <Button
              onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              variant="success"
            >
              <Flag className="h-4 w-4 mr-2" />
              Submit Exam
            </Button>
          )}
        </div>

        {/* Accessibility Info */}
        {profile?.verificationStatus === 'verified' && (
          <Card className="mt-6 bg-primary/5 border-primary/20">
            <CardContent className="pt-4 text-sm">
              <p className="font-semibold mb-2">Active Accessibility Features:</p>
              <div className="flex flex-wrap gap-2">
                {features.tts && <Badge variant="secondary">Text-to-Speech</Badge>}
                {features.dyslexicFont && <Badge variant="secondary">Dyslexic Font</Badge>}
                {features.highContrast && <Badge variant="secondary">High Contrast</Badge>}
                {features.extraTime && <Badge variant="secondary">Extra Time (50%)</Badge>}
                {features.lineFocusMode && <Badge variant="secondary">Line Focus Mode</Badge>}
                {features.screenMagnifier && <Badge variant="secondary">Screen Magnifier</Badge>}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Footer with timer and security status */}
      <div className="exam-footer">
        <ExamTimer
          startTime={examStartTime}
          duration={30} // 30 minutes
          warningTime={5} // Warn when 5 minutes left
          securityViolations={warningCount}
          maxViolations={3}
          onTimeUp={handleTimeUp}
        />
      </div>
    </div>
  );
};
