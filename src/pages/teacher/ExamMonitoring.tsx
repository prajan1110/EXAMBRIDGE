import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Shield, AlertTriangle, CheckCircle, Clock, UserX, Eye, ExternalLink, RefreshCw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';

// Mock data - in a real app this would come from an API
const mockExaminees = [
  { 
    id: 1, 
    name: 'Alice Johnson', 
    status: 'active', 
    progress: 68, 
    timeLeft: '21:45',
    violations: 0,
    lastActivity: 'Question 5 - Answered',
    avatar: '/avatars/avatar-1.jpg'
  },
  { 
    id: 2, 
    name: 'Bob Smith', 
    status: 'active', 
    progress: 42, 
    timeLeft: '24:12',
    violations: 2,
    lastActivity: 'Question 3 - Reading',
    avatar: '/avatars/avatar-2.jpg'
  },
  { 
    id: 3, 
    name: 'Carol Davis', 
    status: 'completed', 
    progress: 100, 
    timeLeft: '00:00',
    violations: 1,
    lastActivity: 'Exam Completed',
    avatar: '/avatars/avatar-3.jpg'
  },
  { 
    id: 4, 
    name: 'Dave Wilson', 
    status: 'warning', 
    progress: 15, 
    timeLeft: '25:33',
    violations: 3,
    lastActivity: 'Attempted to switch tab - Warned',
    avatar: '/avatars/avatar-4.jpg'
  },
  { 
    id: 5, 
    name: 'Eve Martinez', 
    status: 'inactive', 
    progress: 0, 
    timeLeft: '30:00',
    violations: 0,
    lastActivity: 'Not started',
    avatar: '/avatars/avatar-5.jpg'
  },
];

const mockViolations = [
  { 
    id: 1, 
    student: 'Dave Wilson', 
    time: '10:15 AM', 
    type: 'Tab Switch',
    details: 'Attempted to switch to another browser tab',
    severity: 'high'
  },
  { 
    id: 2, 
    student: 'Bob Smith', 
    time: '10:08 AM', 
    type: 'Keyboard Shortcut',
    details: 'Used Ctrl+C to attempt copying content',
    severity: 'medium'
  },
  { 
    id: 3, 
    student: 'Dave Wilson', 
    time: '10:05 AM', 
    type: 'Fullscreen Exit',
    details: 'Attempted to exit fullscreen mode',
    severity: 'high'
  },
  { 
    id: 4, 
    student: 'Carol Davis', 
    time: '10:02 AM', 
    type: 'Right-click',
    details: 'Attempted to open context menu',
    severity: 'low'
  },
  { 
    id: 5, 
    student: 'Dave Wilson', 
    time: '9:58 AM', 
    type: 'Long Inactivity',
    details: 'No activity detected for 3 minutes',
    severity: 'medium'
  },
  { 
    id: 6, 
    student: 'Bob Smith', 
    time: '9:55 AM', 
    type: 'Navigation',
    details: 'Attempted to use browser back button',
    severity: 'medium'
  },
];

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusMap: Record<string, { color: string; icon: React.ReactNode }> = {
    active: { 
      color: 'bg-green-100 text-green-800 border-green-300', 
      icon: <CheckCircle className="h-3 w-3 mr-1" />
    },
    inactive: { 
      color: 'bg-gray-100 text-gray-800 border-gray-300', 
      icon: <Clock className="h-3 w-3 mr-1" />
    },
    completed: { 
      color: 'bg-blue-100 text-blue-800 border-blue-300', 
      icon: <CheckCircle className="h-3 w-3 mr-1" />
    },
    warning: { 
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300', 
      icon: <AlertTriangle className="h-3 w-3 mr-1" />
    },
    flagged: { 
      color: 'bg-red-100 text-red-800 border-red-300', 
      icon: <AlertTriangle className="h-3 w-3 mr-1" />
    },
  };

  const { color, icon } = statusMap[status] || statusMap.inactive;

  return (
    <Badge variant="outline" className={`${color} flex items-center`}>
      {icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

// Violation severity badge
const SeverityBadge = ({ severity }: { severity: string }) => {
  const severityMap: Record<string, string> = {
    high: 'bg-red-100 text-red-800 border-red-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    low: 'bg-blue-100 text-blue-800 border-blue-300',
  };

  return (
    <Badge variant="outline" className={severityMap[severity] || severityMap.low}>
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </Badge>
  );
};

export const ExamMonitoring: React.FC = () => {
  const [examinees, setExaminees] = useState(mockExaminees);
  const [violations, setViolations] = useState(mockViolations);
  const [selectedExaminee, setSelectedExaminee] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [examStatus, setExamStatus] = useState<'in-progress' | 'completed' | 'not-started'>('in-progress');
  
  // In a real app, this would fetch data from an API
  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const examineesCount = {
    total: examinees.length,
    active: examinees.filter(e => e.status === 'active').length,
    completed: examinees.filter(e => e.status === 'completed').length,
    warning: examinees.filter(e => e.status === 'warning').length,
    inactive: examinees.filter(e => e.status === 'inactive').length,
  };

  const violationsCount = {
    total: violations.length,
    high: violations.filter(v => v.severity === 'high').length,
    medium: violations.filter(v => v.severity === 'medium').length,
    low: violations.filter(v => v.severity === 'low').length,
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Exam Monitoring</h1>
          <p className="text-muted-foreground">Advanced Accessibility Quiz - Real-time Proctoring</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant={examStatus === 'in-progress' ? 'secondary' : examStatus === 'completed' ? 'default' : 'outline'} 
            className={examStatus === 'in-progress' ? 'bg-green-100 text-green-800 border-green-300' : ''}>
            {examStatus === 'in-progress' ? 'Exam in Progress' : examStatus === 'completed' ? 'Exam Completed' : 'Not Started'}
          </Badge>
          
          <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Total Examinees</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <div className="text-3xl font-bold">{examineesCount.total}</div>
            <p className="text-xs text-muted-foreground">
              {examineesCount.active} active, {examineesCount.completed} completed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Security Violations</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <div className="text-3xl font-bold">{violationsCount.total}</div>
            <p className="text-xs text-muted-foreground">
              {violationsCount.high} high, {violationsCount.medium} medium, {violationsCount.low} low severity
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <div className="text-3xl font-bold">
              {Math.round(examinees.reduce((acc, e) => acc + e.progress, 0) / examinees.length)}%
            </div>
            <Progress 
              value={Math.round(examinees.reduce((acc, e) => acc + e.progress, 0) / examinees.length)} 
              className="h-2 mt-2" 
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Flagged Students</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <div className="text-3xl font-bold">{examineesCount.warning}</div>
            <p className="text-xs text-muted-foreground">
              {examineesCount.warning > 0 ? 'Requires attention!' : 'No issues detected'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Students</CardTitle>
            <CardDescription>
              Real-time monitoring of all exam participants
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[520px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Time Left</TableHead>
                    <TableHead>Violations</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {examinees.map((examinee) => (
                    <TableRow key={examinee.id} className={examinee.status === 'warning' ? 'bg-warning/5' : ''}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={examinee.avatar} />
                            <AvatarFallback>{examinee.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{examinee.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={examinee.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={examinee.progress} className="h-2 w-16" />
                          <span className="text-sm">{examinee.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span>{examinee.timeLeft}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={examinee.violations > 0 ? "outline" : "secondary"} className={
                          examinee.violations >= 3 
                            ? "bg-red-100 text-red-800 border-red-300" 
                            : examinee.violations > 0 
                              ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                              : ""
                        }>
                          {examinee.violations}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setSelectedExaminee(examinee.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <UserX className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Violations</CardTitle>
            <CardDescription>
              Recent security incidents during the exam
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[520px]">
              <div className="space-y-4">
                {violations.map((violation) => (
                  <div 
                    key={violation.id} 
                    className="p-3 rounded-lg border bg-card"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium">{violation.student}</div>
                      <SeverityBadge severity={violation.severity} />
                    </div>
                    <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                      <AlertTriangle className="h-3 w-3" />
                      <span>{violation.type}</span>
                      <span className="text-xs">•</span>
                      <span>{violation.time}</span>
                    </div>
                    <p className="text-sm">{violation.details}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="border-t bg-muted/50 flex justify-between">
            <span className="text-sm text-muted-foreground">
              {violations.length} total violations
            </span>
            <Button variant="outline" size="sm">
              View Full Log
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};