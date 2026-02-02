import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PlusCircle, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';

interface Question {
  id: string;
  type: 'mcq' | 'short-answer';
  question: string;
  options?: string[];
  altText?: string;
  audioDescription?: string;
}

export const CreateQuiz: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(30);
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      type: 'mcq',
      question: '',
      options: ['', '', '', ''],
      altText: '',
      audioDescription: '',
    },
  ]);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: 'mcq',
      question: '',
      options: ['', '', '', ''],
      altText: '',
      audioDescription: '',
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    } else {
      toast.error('Quiz must have at least one question');
    }
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => (q.id === id ? { ...q, ...updates } : q)));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(
      questions.map(q =>
        q.id === questionId
          ? { ...q, options: q.options?.map((opt, i) => (i === optionIndex ? value : opt)) }
          : q
      )
    );
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast.error('Please enter a quiz title');
      return;
    }

    if (!description.trim()) {
      toast.error('Please enter a quiz description');
      return;
    }

    const hasEmptyQuestions = questions.some(q => !q.question.trim());
    if (hasEmptyQuestions) {
      toast.error('All questions must have text');
      return;
    }

    const newQuiz = {
      id: Date.now().toString(),
      title,
      description,
      duration,
      totalQuestions: questions.length,
      status: 'not-started',
      createdBy: 'Current Teacher',
      createdAt: new Date().toLocaleDateString(),
    };

    const storedQuizzes = localStorage.getItem('quizzes');
    const quizzes = storedQuizzes ? JSON.parse(storedQuizzes) : [];
    localStorage.setItem('quizzes', JSON.stringify([...quizzes, newQuiz]));

    toast.success('Quiz created successfully!');
    navigate('/teacher/dashboard');
  };

  return (
    <div className="container max-w-4xl py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">Create New Quiz</h1>
      <p className="text-muted-foreground mb-8">
        Build an accessible quiz with support for alternative text and audio descriptions
      </p>

      <div className="space-y-6">
        {/* Quiz Info */}
        <Card>
          <CardHeader>
            <CardTitle>Quiz Information</CardTitle>
            <CardDescription>Basic details about your quiz</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Quiz Title</Label>
              <Input
                id="title"
                placeholder="e.g., Introduction to Web Accessibility"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the quiz content"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="5"
                max="180"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        {questions.map((question, index) => (
          <Card key={question.id} className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeQuestion(question.id)}
                  disabled={questions.length === 1}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Question Type</Label>
                <RadioGroup
                  value={question.type}
                  onValueChange={(value: 'mcq' | 'short-answer') =>
                    updateQuestion(question.id, { type: value })
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mcq" id={`mcq-${question.id}`} />
                    <Label htmlFor={`mcq-${question.id}`}>Multiple Choice</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="short-answer" id={`short-${question.id}`} />
                    <Label htmlFor={`short-${question.id}`}>Short Answer</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label>Question Text</Label>
                <Textarea
                  placeholder="Enter your question..."
                  value={question.question}
                  onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                  rows={2}
                />
              </div>

              {question.type === 'mcq' && (
                <div className="space-y-2">
                  <Label>Answer Options</Label>
                  {question.options?.map((option, optIndex) => (
                    <Input
                      key={optIndex}
                      placeholder={`Option ${optIndex + 1}`}
                      value={option}
                      onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                    />
                  ))}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Alternative Text (for screen readers)
                  </Label>
                  <Input
                    placeholder="Describe any visual elements..."
                    value={question.altText || ''}
                    onChange={(e) => updateQuestion(question.id, { altText: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Audio Description
                  </Label>
                  <Input
                    placeholder="Additional audio context..."
                    value={question.audioDescription || ''}
                    onChange={(e) => updateQuestion(question.id, { audioDescription: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button variant="outline" onClick={addQuestion} className="w-full">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Question
        </Button>

        {/* Actions */}
        <div className="flex gap-4 justify-end">
          <Button variant="outline" onClick={() => navigate('/teacher/dashboard')}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Quiz
          </Button>
        </div>
      </div>
    </div>
  );
};
