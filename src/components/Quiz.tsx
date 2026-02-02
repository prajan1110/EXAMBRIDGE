import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { 
  useKeyboardNavigation, 
  useLineFocusMode,
  useScreenMagnifier,
  useColorPalette,
} from '@/lib/accessibility-utils';

export type MCQOption = {
  id: string;
  text: string;
  isCorrect: boolean;
};

export type MCQQuestion = {
  id: string;
  text: string;
  options: MCQOption[];
};

interface QuizProps {
  questions: MCQQuestion[];
  timeLimit?: number; // in seconds, undefined means no time limit
  onComplete: (answers: Record<string, string>) => void;
  randomizeQuestions?: boolean;
}

export const Quiz: React.FC<QuizProps> = ({
  questions: originalQuestions,
  timeLimit,
  onComplete,
  randomizeQuestions = true
}) => {
  const { features } = useAccessibility();
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [remainingTime, setRemainingTime] = useState(timeLimit || 0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  
  // Refs for keyboard navigation
  const optionsRef = useRef<HTMLDivElement>(null);
  const prevButtonRef = useRef<HTMLButtonElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  
  // Apply accessibility hooks
  useKeyboardNavigation('.quiz-option, .quiz-navigation button');
  useLineFocusMode();
  useScreenMagnifier();
  const currentPalette = useColorPalette();
  
  // Voice command configuration
  const voiceCommands = [
    {
      command: 'next question',
      action: () => handleNextQuestion(),
      feedback: 'Moving to next question'
    },
    {
      command: 'previous question',
      action: () => handlePrevQuestion(),
      feedback: 'Moving to previous question'
    },
    {
      command: 'select option a',
      action: () => selectOptionByLetter('A'),
      feedback: 'Selected option A'
    },
    {
      command: 'select option b',
      action: () => selectOptionByLetter('B'),
      feedback: 'Selected option B'
    },
    {
      command: 'select option c',
      action: () => selectOptionByLetter('C'),
      feedback: 'Selected option C'
    },
    {
      command: 'select option d',
      action: () => selectOptionByLetter('D'),
      feedback: 'Selected option D'
    },
    {
      command: 'submit quiz',
      action: () => handleSubmit(),
      feedback: 'Submitting quiz'
    }
  ];
  

  // Initialize quiz questions, potentially randomized
  useEffect(() => {
    // Randomize if needed
    let processedQuestions = [...originalQuestions];
    if (randomizeQuestions) {
      processedQuestions = [...originalQuestions].sort(() => Math.random() - 0.5);
    }
    
    setQuestions(processedQuestions);
    setQuizStarted(true);
  }, [originalQuestions, randomizeQuestions]);

  // Timer logic
  useEffect(() => {
    if (!timeLimit || !quizStarted || quizFinished) return;
    
    // Apply extra time if the feature is enabled
    const adjustedTimeLimit = features.extraTime 
      ? Math.round(timeLimit * 1.3) // 30% extra time
      : timeLimit;
    
    setRemainingTime(adjustedTimeLimit);
    
    const timer = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-submit when time is up
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [quizStarted, quizFinished, timeLimit, features.extraTime]);

  // Handle selecting an option
  const handleOptionSelect = (questionId: string, optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  // Helper to select option by letter (A, B, C, D) for voice commands
  const selectOptionByLetter = (letter: string) => {
    if (!questions[currentQuestionIndex]) return;
    
    const questionId = questions[currentQuestionIndex].id;
    const optionIndex = letter.charCodeAt(0) - 'A'.charCodeAt(0);
    
    if (optionIndex < 0 || optionIndex >= questions[currentQuestionIndex].options.length) return;
    
    const optionId = questions[currentQuestionIndex].options[optionIndex].id;
    handleOptionSelect(questionId, optionId);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    setQuizFinished(true);
    onComplete(answers);
  };

  // Function to handle keyboard navigation within options
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const options = optionsRef.current?.querySelectorAll('.quiz-option');
      const focusedElement = document.activeElement;
      
      if (options) {
        // Find the index of the currently focused option
        const currentIndex = Array.from(options).findIndex(el => el === focusedElement);
        if (currentIndex >= 0 && currentIndex < options.length - 1) {
          (options[currentIndex + 1] as HTMLElement).focus();
        }
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const options = optionsRef.current?.querySelectorAll('.quiz-option');
      const focusedElement = document.activeElement;
      
      if (options) {
        const currentIndex = Array.from(options).findIndex(el => el === focusedElement);
        if (currentIndex > 0) {
          (options[currentIndex - 1] as HTMLElement).focus();
        }
      }
    }
  };

  // Format remaining time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // No language translation needed

  // If quiz is not started or questions are not loaded yet
  if (!quizStarted || questions.length === 0) {
    return <div className="quiz-loading">Loading quiz...</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const selectedOptionId = answers[currentQuestion.id];

  return (
    <div 
      className="quiz-container"
      role="region" 
      aria-label="Quiz"
      onKeyDown={handleKeyDown}
    >
      {/* Quiz Header */}
      <div className="quiz-header">
        <div className="quiz-progress">
          Question {currentQuestionIndex + 1} of {questions.length}
        </div>
        
        {timeLimit && (
          <div className={`quiz-timer ${remainingTime < 30 ? 'text-danger' : ''}`} role="timer">
            Time: {formatTime(remainingTime)}
          </div>
        )}
      </div>
      
      {/* Progress bar */}
      <Progress 
        value={(currentQuestionIndex + 1) / questions.length * 100} 
        className="h-2" 
        aria-label={`${currentQuestionIndex + 1} of ${questions.length} questions completed`}
      />
      
      {/* Question */}
      <div 
        className="quiz-question quiz-content" 
        role="heading" 
        aria-level={2} 
        tabIndex={0}
        style={{ wordSpacing: `${features.wordSpacing}px`, letterSpacing: `${features.wordSpacing * 0.3}px` }}
      >
        {currentQuestion.text}
      </div>
      
      {/* Options */}
      <div className="quiz-options quiz-content" ref={optionsRef} style={{ wordSpacing: `${features.wordSpacing}px` }}>
        {currentQuestion.options.map((option, index) => {
          const letter = String.fromCharCode(65 + index); // A, B, C, D...
          
          return (
            <div
              key={option.id}
              className="quiz-option"
              role="option"
              aria-selected={selectedOptionId === option.id}
              tabIndex={0}
              data-option={letter}
              onClick={() => handleOptionSelect(currentQuestion.id, option.id)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleOptionSelect(currentQuestion.id, option.id);
                }
              }}
              style={{ 
                wordSpacing: `${features.wordSpacing}px`, 
                letterSpacing: `${features.wordSpacing * 0.3}px` 
              }}
            >
              <span className="option-letter">{letter}.</span> <span className="option-text">{option.text}</span>
            </div>
          );
        })}
      </div>
      
      {/* Navigation Buttons */}
      <div className="quiz-navigation">
        <Button
          variant="outline"
          onClick={handlePrevQuestion}
          disabled={currentQuestionIndex === 0}
          ref={prevButtonRef}
          aria-label="Previous question"
        >
          Previous
        </Button>
        
        {currentQuestionIndex === questions.length - 1 ? (
          <Button
            onClick={handleSubmit}
            disabled={quizFinished || Object.keys(answers).length < questions.length}
            aria-label="Submit quiz"
          >
            Submit
          </Button>
        ) : (
          <Button
            onClick={handleNextQuestion}
            ref={nextButtonRef}
            aria-label="Next question"
          >
            Next
          </Button>
        )}
      </div>
      
      {/* Answer Review Dialog */}
      {reviewMode && (
        <div 
          className="quiz-review-dialog"
          role="dialog"
          aria-label="Review Answers"
        >
          <h3>Review Your Answers</h3>
          <div className="quiz-review-list">
            {questions.map((q, index) => (
              <div key={q.id} className="quiz-review-item">
                <div className="quiz-review-question">
                  {index + 1}. {q.text}
                </div>
                <div className="quiz-review-answer">
                  {answers[q.id] ? (
                    <span>
                      Selected: {
                        q.options.find(o => o.id === answers[q.id])?.text || 'Unknown option'
                      }
                    </span>
                  ) : (
                    <span className="text-danger">Not answered</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="quiz-review-actions">
            <Button onClick={() => setReviewMode(false)}>
              Continue Editing
            </Button>
            <Button onClick={handleSubmit}>
              Submit Quiz
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz;