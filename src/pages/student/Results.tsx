import React, { useMemo, useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { CheckCircle2, XCircle, Trophy, ArrowLeft, Volume2, Download, FileText, Printer, Award } from 'lucide-react';
import { toast } from 'sonner';
import { generateResultsPDF } from '@/utils/pdfUtils';

export const Results: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const { features, profile } = useAccessibility();
  const [isDownloading, setIsDownloading] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  // Prefer real results passed via navigation state; fallback to safe defaults
  const results = useMemo(() => {
    const stateResults = (location.state as any)?.results;
    return {
      quizTitle: stateResults?.quizTitle || 'Quiz Results',
      score: typeof stateResults?.score === 'number' ? stateResults.score : 0,
      totalQuestions: typeof stateResults?.totalQuestions === 'number' ? stateResults.totalQuestions : 0,
      correctAnswers: typeof stateResults?.correctAnswers === 'number' ? stateResults.correctAnswers : 0,
      duration: stateResults?.duration || '00:00',
      completedAt: new Date().toLocaleDateString(),
      studentName: profile?.name || 'Student',
      studentEmail: profile?.email || ''
    };
  }, [location.state, profile?.name, profile?.email]);
  
  // Mock question details for the PDF
  const questionDetails = [
    { question: 'What is the primary goal of web accessibility?', correct: true },
    { question: 'Which attribute is used to provide text alternatives for images?', correct: true },
    { question: 'What does WCAG stand for?', correct: true },
    { question: 'Which of these is not a principle of WCAG?', correct: false },
    { question: 'What is the purpose of ARIA landmarks?', correct: true },
    { question: 'Which color combination provides the best contrast for accessibility?', correct: true },
    { question: 'What is the recommended minimum font size for accessible web content?', correct: true },
    { question: 'Which of these is not an assistive technology?', correct: true },
    { question: 'Why is keyboard navigation important for accessibility?', correct: false },
    { question: 'What level of WCAG compliance is legally required in most cases?', correct: true }
  ];

  const handleTTS = () => {
    if (!features.tts) {
      toast.error('Text-to-Speech is not enabled');
      return;
    }

    const text = `Your exam results: You scored ${results.score} percent. You answered ${results.correctAnswers} out of ${results.totalQuestions} questions correctly.`;

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
      toast.info('Reading results aloud');
    }
  };
  
  const handleDownloadPDF = () => {
    try {
      setIsDownloading(true);
      toast.info('Preparing your results...');
      
      // Short timeout to allow toast to show
      setTimeout(() => {
        generateResultsPDF(results, questionDetails);
        toast.success('Results PDF downloaded successfully!');
        setIsDownloading(false);
      }, 1000);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
      setIsDownloading(false);
    }
  };

  const getGrade = (score: number) => {
    if (score >= 90) return { grade: 'A+', color: 'text-success' };
    if (score >= 80) return { grade: 'A', color: 'text-success' };
    if (score >= 70) return { grade: 'B', color: 'text-secondary' };
    if (score >= 60) return { grade: 'C', color: 'text-warning' };
    return { grade: 'F', color: 'text-destructive' };
  };

  const { grade, color } = getGrade(results.score);

  return (
    <div className="container max-w-4xl py-8 animate-fade-in">
      <Link to="/student/dashboard">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>

      <div className="text-center mb-8">
        <div className="inline-block p-4 rounded-full bg-primary/10 mb-4">
          <Trophy className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Exam Completed!</h1>
        <p className="text-muted-foreground">{results.quizTitle}</p>
      </div>

      {/* Score Card */}
      <Card className="mb-6 border-2 shadow-glow">
        <CardHeader className="text-center">
          <CardTitle className="text-6xl font-bold mb-2 text-gradient">
            {results.score}%
          </CardTitle>
          <p className={`text-4xl font-bold ${color}`}>{grade}</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-success">{results.correctAnswers}</p>
              <p className="text-sm text-muted-foreground">Correct</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-destructive">{results.totalQuestions - results.correctAnswers}</p>
              <p className="text-sm text-muted-foreground">Incorrect</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{results.duration}</p>
              <p className="text-sm text-muted-foreground">Duration</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Breakdown (Demo) */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Question Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: results.totalQuestions }).map((_, index) => {
            const isCorrect = index < results.correctAnswers;
            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <span className="font-medium">Question {index + 1}</span>
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-success" />
                      <Badge className="bg-success text-success-foreground">Correct</Badge>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-destructive" />
                      <Badge className="bg-destructive text-destructive-foreground">Incorrect</Badge>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {features.tts && (
          <Button variant="outline" onClick={handleTTS}>
            <Volume2 className="h-4 w-4 mr-2" />
            Read Results Aloud
          </Button>
        )}
        
        <Button 
          variant="outline" 
          onClick={handleDownloadPDF} 
          disabled={isDownloading}
        >
          {isDownloading ? (
            <>
              <span className="animate-spin mr-2">●</span>
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Download Results
            </>
          )}
        </Button>

        <Button 
          variant="outline"
          onClick={() => setShowCertificate(true)}
        >
          <Award className="h-4 w-4 mr-2" />
          View Certificate
        </Button>

        <Link to={`/student/exam/${id}`}>
          <Button>
            Retake Quiz
          </Button>
        </Link>
      </div>
      
      {/* Certificate Dialog */}
      <Dialog open={showCertificate} onOpenChange={setShowCertificate}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">Achievement Certificate</DialogTitle>
          </DialogHeader>
          
          <div id="certificate-container" className="border-8 border-double border-primary/30 p-8 bg-background print:bg-white">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold mb-2">EXAM BRIDGE</h1>
              <h2 className="text-xl font-semibold text-muted-foreground">Certificate of Achievement</h2>
            </div>
            
            <div className="text-center mb-10">
              <p className="text-lg">This certifies that</p>
              <h3 className="text-2xl font-bold my-3 border-b pb-1">{results.studentName}</h3>
              <p className="text-lg">has successfully completed</p>
              <h4 className="text-xl font-semibold my-3">{results.quizTitle}</h4>
              <p className="text-lg">with a score of</p>
              <h3 className="text-3xl font-bold my-3 text-primary">{results.score}%</h3>
            </div>
            
            <div className="flex justify-between items-center mt-16">
              <div className="text-center">
                <div className="border-t border-gray-300 pt-2 w-40">
                  <p className="text-sm text-muted-foreground">Date</p>
                </div>
                <p>{results.completedAt}</p>
              </div>
              
              <div className="flex flex-col items-center">
                <Award className="h-20 w-20 text-primary mb-2" />
                <p className="text-xs text-muted-foreground">EXAM BRIDGE CERTIFIED</p>
              </div>
              
              <div className="text-center">
                <div className="border-t border-gray-300 pt-2 w-40">
                  <p className="text-sm text-muted-foreground">Signature</p>
                </div>
                <p className="text-sm">Exam Authority</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-6">
            <Button 
              onClick={() => {
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                  const content = document.getElementById('certificate-container')?.innerHTML;
                  printWindow.document.write(`
                    <html>
                      <head>
                        <title>EXAM BRIDGE Certificate</title>
                        <style>
                          body { font-family: Arial, sans-serif; padding: 40px; }
                          .certificate { border: 10px double #8884; padding: 40px; max-width: 800px; margin: 0 auto; }
                          h1, h2, h3, h4 { margin: 10px 0; }
                          .signature-area { display: flex; justify-content: space-between; margin-top: 80px; }
                          .signature { text-align: center; }
                          .signature-line { border-top: 1px solid #333; padding-top: 10px; width: 200px; }
                          @media print {
                            body { padding: 0; }
                            button { display: none; }
                          }
                        </style>
                      </head>
                      <body>
                        <div class="certificate">
                          ${content}
                        </div>
                        <div style="text-align: center; margin-top: 30px;">
                          <button onclick="window.print()">Print Certificate</button>
                        </div>
                      </body>
                    </html>
                  `);
                  printWindow.document.close();
                  toast.success('Certificate opened in new window for printing');
                } else {
                  toast.error('Failed to open print window. Please check your popup blocker.');
                }
              }}
              className="mr-4"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Certificate
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Accessibility Note */}
      <Card className="mt-6 bg-primary/5 border-primary/20">
        <CardContent className="pt-4 text-sm">
          <p>
            <strong>Result Summary:</strong> You completed the exam with a score of {results.score}%, 
            answering {results.correctAnswers} out of {results.totalQuestions} questions correctly in {results.duration}.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
