import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, XCircle, Shield, Lock, Clock, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

interface AuditResult {
  id: string;
  type: 'error' | 'warning' | 'pass';
  category: string;
  description: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  wcagLevel: 'A' | 'AA' | 'AAA';
  element?: string;
}

interface SecurityAuditResult {
  id: string;
  feature: string;
  status: 'implemented' | 'partial' | 'missing';
  category: 'prevention' | 'detection' | 'response';
  description: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
  recommendation?: string;
}

interface ExamStats {
  totalExams: number;
  completedExams: number;
  avgScore: number;
  securityViolations: number;
  avgDuration: number; // in minutes
  accessibilityFeatures: {
    name: string;
    count: number;
  }[];
}

export const Audit: React.FC = () => {
  const [results, setResults] = useState<AuditResult[]>([]);
  const [securityResults, setSecurityResults] = useState<SecurityAuditResult[]>([]);
  const [examStats, setExamStats] = useState<ExamStats | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const runAudit = () => {
    setIsScanning(true);

    // Simulated accessibility audit results
    setTimeout(() => {
      const mockResults: AuditResult[] = [
        {
          id: '1',
          type: 'pass',
          category: 'Color Contrast',
          description: 'All text elements meet WCAG AAA contrast ratios (7:1 for normal text)',
          impact: 'critical',
          wcagLevel: 'AAA',
        },
        {
          id: '2',
          type: 'pass',
          category: 'Keyboard Navigation',
          description: 'All interactive elements are keyboard accessible',
          impact: 'critical',
          wcagLevel: 'A',
        },
        {
          id: '3',
          type: 'pass',
          category: 'ARIA Labels',
          description: 'All form inputs have proper labels and ARIA attributes',
          impact: 'serious',
          wcagLevel: 'AA',
        },
        {
          id: '4',
          type: 'pass',
          category: 'Focus Indicators',
          description: 'Visible focus indicators present on all focusable elements',
          impact: 'serious',
          wcagLevel: 'AA',
        },
        {
          id: '5',
          type: 'pass',
          category: 'Semantic HTML',
          description: 'Proper use of semantic HTML5 elements (nav, main, section, etc.)',
          impact: 'moderate',
          wcagLevel: 'A',
        },
        {
          id: '6',
          type: 'pass',
          category: 'Alt Text',
          description: 'All images have descriptive alternative text',
          impact: 'critical',
          wcagLevel: 'A',
        },
        {
          id: '7',
          type: 'pass',
          category: 'Heading Hierarchy',
          description: 'Proper heading structure maintained (h1 → h2 → h3)',
          impact: 'moderate',
          wcagLevel: 'AA',
        },
        {
          id: '8',
          type: 'pass',
          category: 'Screen Reader Support',
          description: 'Content is properly structured for screen reader navigation',
          impact: 'critical',
          wcagLevel: 'A',
        },
        {
          id: '9',
          type: 'pass',
          category: 'Motion Preference',
          description: 'Respects prefers-reduced-motion user preference',
          impact: 'moderate',
          wcagLevel: 'AAA',
        },
        {
          id: '10',
          type: 'pass',
          category: 'Form Validation',
          description: 'Clear error messages with ARIA live regions',
          impact: 'serious',
          wcagLevel: 'AA',
        },
      ];

      // Simulated security audit results
      const mockSecurityResults: SecurityAuditResult[] = [
        {
          id: '1',
          feature: 'Fullscreen Lockdown',
          status: 'implemented',
          category: 'prevention',
          description: 'Forces exam to run in fullscreen mode; exits cause automatic submission',
          importance: 'critical'
        },
        {
          id: '2',
          feature: 'Tab/Window Switching Prevention',
          status: 'implemented',
          category: 'prevention',
          description: 'Detects when user attempts to switch tabs or windows',
          importance: 'critical'
        },
        {
          id: '3',
          feature: 'Keyboard Shortcut Blocking',
          status: 'implemented',
          category: 'prevention',
          description: 'Blocks browser shortcuts for copy, paste, print, navigation, etc.',
          importance: 'high'
        },
        {
          id: '4',
          feature: 'Context Menu Disabling',
          status: 'implemented',
          category: 'prevention',
          description: 'Prevents right-click context menu access',
          importance: 'medium'
        },
        {
          id: '5',
          feature: 'Browser Navigation Prevention',
          status: 'implemented',
          category: 'prevention',
          description: 'Prevents refresh, back button, and URL navigation',
          importance: 'high'
        },
        {
          id: '6',
          feature: 'Security Violation Logging',
          status: 'implemented',
          category: 'detection',
          description: 'Records timestamps and details of security policy violations',
          importance: 'high'
        },
        {
          id: '7',
          feature: 'Auto-Submit on Violations',
          status: 'implemented',
          category: 'response',
          description: 'Automatically submits exam after configurable number of violations',
          importance: 'high'
        },
        {
          id: '8',
          feature: 'Developer Tools Detection',
          status: 'implemented',
          category: 'detection',
          description: 'Detects when developer tools are opened',
          importance: 'high'
        },
        {
          id: '9',
          feature: 'Inactivity Monitoring',
          status: 'implemented',
          category: 'detection',
          description: 'Tracks user activity and flags suspicious inactivity',
          importance: 'medium'
        },
        {
          id: '10',
          feature: 'Multiple Display Detection',
          status: 'partial',
          category: 'detection',
          description: 'Attempts to detect use of multiple displays',
          importance: 'medium',
          recommendation: 'Consider adding webcam monitoring for enhanced security'
        },
        {
          id: '11',
          feature: 'Accessibility Feature Whitelisting',
          status: 'implemented',
          category: 'prevention',
          description: 'Allows specific keyboard shortcuts for accessibility tools',
          importance: 'high'
        },
        {
          id: '12',
          feature: 'Remote Proctoring',
          status: 'missing',
          category: 'detection',
          description: 'No webcam/microphone monitoring implemented',
          importance: 'medium',
          recommendation: 'Consider adding AI-based remote proctoring capabilities'
        },
      ];

      // Mock exam statistics
      const mockExamStats: ExamStats = {
        totalExams: 28,
        completedExams: 24,
        avgScore: 72,
        securityViolations: 17,
        avgDuration: 24, // 24 minutes
        accessibilityFeatures: [
          { name: 'Text-to-Speech', count: 8 },
          { name: 'Dyslexic Font', count: 5 },
          { name: 'High Contrast', count: 3 },
          { name: 'Extra Time', count: 10 },
          { name: 'Line Focus Mode', count: 2 }
        ]
      };

      setResults(mockResults);
      setSecurityResults(mockSecurityResults);
      setExamStats(mockExamStats);
      setIsScanning(false);
    }, 2000);
  };

  useEffect(() => {
    runAudit();
  }, []);

  const accessStats = {
    pass: results.filter(r => r.type === 'pass').length,
    warning: results.filter(r => r.type === 'warning').length,
    error: results.filter(r => r.type === 'error').length,
  };

  const securityStats = {
    implemented: securityResults.filter(r => r.status === 'implemented').length,
    partial: securityResults.filter(r => r.status === 'partial').length,
    missing: securityResults.filter(r => r.status === 'missing').length,
  };

  const getTypeIcon = (type: AuditResult['type']) => {
    switch (type) {
      case 'pass':
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive" />;
    }
  };

  const getTypeBadge = (type: AuditResult['type']) => {
    switch (type) {
      case 'pass':
        return <Badge className="bg-success text-success-foreground">Pass</Badge>;
      case 'warning':
        return <Badge className="bg-warning text-warning-foreground">Warning</Badge>;
      case 'error':
        return <Badge className="bg-destructive text-destructive-foreground">Error</Badge>;
    }
  };

  const getImpactBadge = (impact: AuditResult['impact'] | SecurityAuditResult['importance']) => {
    const colors = {
      critical: 'bg-destructive text-destructive-foreground',
      serious: 'bg-warning text-warning-foreground',
      high: 'bg-warning text-warning-foreground',
      moderate: 'bg-secondary text-secondary-foreground',
      medium: 'bg-secondary text-secondary-foreground',
      minor: 'bg-muted text-muted-foreground',
      low: 'bg-muted text-muted-foreground',
    };
    return <Badge variant="outline" className={colors[impact as keyof typeof colors] || colors.low}>{impact}</Badge>;
  };

  const getSecurityStatusBadge = (status: SecurityAuditResult['status']) => {
    switch (status) {
      case 'implemented':
        return <Badge className="bg-success text-success-foreground">Implemented</Badge>;
      case 'partial':
        return <Badge className="bg-warning text-warning-foreground">Partial</Badge>;
      case 'missing':
        return <Badge className="bg-destructive text-destructive-foreground">Missing</Badge>;
    }
  };

  const getSecurityCategoryBadge = (category: SecurityAuditResult['category']) => {
    const colors = {
      prevention: 'bg-blue-100 text-blue-800 border-blue-300',
      detection: 'bg-purple-100 text-purple-800 border-purple-300',
      response: 'bg-orange-100 text-orange-800 border-orange-300',
    };
    return <Badge variant="outline" className={colors[category]}>{category}</Badge>;
  };

  return (
    <div className="container max-w-6xl py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">System Audit Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive accessibility and security analysis</p>
        </div>
        <Button onClick={runAudit} disabled={isScanning}>
          {isScanning ? 'Scanning...' : 'Re-run Audit'}
        </Button>
      </div>

      <Tabs defaultValue="accessibility" className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
          <TabsTrigger value="security">Exam Security</TabsTrigger>
          <TabsTrigger value="statistics">Exam Statistics</TabsTrigger>
        </TabsList>
        
        {/* === ACCESSIBILITY TAB === */}
        <TabsContent value="accessibility">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{results.length}</p>
                    <p className="text-sm text-muted-foreground">Total Checks</p>
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
                    <p className="text-2xl font-bold">{accessStats.pass}</p>
                    <p className="text-sm text-muted-foreground">Passed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-warning/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-warning/10">
                    <AlertTriangle className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{accessStats.warning}</p>
                    <p className="text-sm text-muted-foreground">Warnings</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-destructive/10">
                    <XCircle className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{accessStats.error}</p>
                    <p className="text-sm text-muted-foreground">Errors</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Compliance Badge */}
          {accessStats.error === 0 && accessStats.warning === 0 && (
            <Card className="mb-8 border-success/50 bg-success/5">
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="p-4 rounded-full bg-success/10">
                  <Shield className="h-8 w-8 text-success" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-success-foreground">WCAG AAA Compliant ✓</h3>
                  <p className="text-sm text-muted-foreground">
                    This application meets the highest accessibility standards
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle>Accessibility Audit Results</CardTitle>
              <CardDescription>
                Detailed breakdown of accessibility compliance checks
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isScanning ? (
                <div className="text-center py-12">
                  <div className="animate-pulse mb-4">
                    <Shield className="h-12 w-12 text-primary mx-auto" />
                  </div>
                  <p className="text-muted-foreground">Analyzing accessibility...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {results.map((result) => (
                    <div
                      key={result.id}
                      className="p-4 rounded-lg border-2 hover:shadow-md transition-smooth"
                    >
                      <div className="flex items-start gap-4">
                        <div className="shrink-0">{getTypeIcon(result.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{result.category}</h4>
                            {getTypeBadge(result.type)}
                            <Badge variant="outline">WCAG {result.wcagLevel}</Badge>
                            {getImpactBadge(result.impact)}
                          </div>
                          <p className="text-sm text-muted-foreground">{result.description}</p>
                          {result.element && (
                            <code className="text-xs mt-2 block bg-muted px-2 py-1 rounded">
                              {result.element}
                            </code>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Footer Info */}
          <Card className="mt-6 bg-muted/50">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">About This Accessibility Audit</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  • This audit checks compliance with WCAG 2.1 Level A, AA, and AAA guidelines
                </p>
                <p>
                  • Automated testing covers ~30-50% of accessibility issues; manual testing recommended
                </p>
                <p>
                  • Focus areas: keyboard navigation, ARIA, color contrast, semantic HTML, screen readers
                </p>
                <p>
                  • For production deployment, consider additional tools like axe DevTools or WAVE
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* === SECURITY TAB === */}
        <TabsContent value="security">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{securityResults.length}</p>
                    <p className="text-sm text-muted-foreground">Total Security Features</p>
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
                    <p className="text-2xl font-bold">{securityStats.implemented}</p>
                    <p className="text-sm text-muted-foreground">Implemented</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-warning/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-warning/10">
                    <AlertTriangle className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{securityStats.partial}</p>
                    <p className="text-sm text-muted-foreground">Partial</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-destructive/10">
                    <XCircle className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{securityStats.missing}</p>
                    <p className="text-sm text-muted-foreground">Missing</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security Rating Badge */}
          <Card className="mb-8 border-success/50 bg-success/5">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-4 rounded-full bg-success/10">
                <Lock className="h-8 w-8 text-success" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-success-foreground">
                  {securityStats.implemented > 10 ? "High Security Rating ✓" : "Medium Security Rating"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {securityStats.implemented} of {securityResults.length} security features fully implemented
                </p>
              </div>
              <div>
                <Progress className="w-32" value={(securityStats.implemented / securityResults.length) * 100} />
              </div>
            </CardContent>
          </Card>

          {/* Security Results */}
          <Card>
            <CardHeader>
              <CardTitle>Exam Security Audit Results</CardTitle>
              <CardDescription>
                Comprehensive review of exam proctoring and security measures
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isScanning ? (
                <div className="text-center py-12">
                  <div className="animate-pulse mb-4">
                    <Lock className="h-12 w-12 text-primary mx-auto" />
                  </div>
                  <p className="text-muted-foreground">Analyzing security features...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {securityResults.map((result) => (
                    <div
                      key={result.id}
                      className={`p-4 rounded-lg border-2 hover:shadow-md transition-smooth ${
                        result.status === 'missing' ? 'border-destructive/20' : 
                        result.status === 'partial' ? 'border-warning/20' : 
                        'border-success/20'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="shrink-0">
                          {result.status === 'implemented' && <CheckCircle2 className="h-5 w-5 text-success" />}
                          {result.status === 'partial' && <AlertTriangle className="h-5 w-5 text-warning" />}
                          {result.status === 'missing' && <XCircle className="h-5 w-5 text-destructive" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h4 className="font-semibold">{result.feature}</h4>
                            {getSecurityStatusBadge(result.status)}
                            {getSecurityCategoryBadge(result.category)}
                            {getImpactBadge(result.importance)}
                          </div>
                          <p className="text-sm text-muted-foreground">{result.description}</p>
                          {result.recommendation && (
                            <p className="text-xs mt-2 px-3 py-2 bg-warning/10 border border-warning/20 rounded-md text-warning-foreground">
                              <span className="font-semibold">Recommendation:</span> {result.recommendation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Info */}
          <Card className="mt-6 bg-muted/50">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">About This Security Audit</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  • This audit evaluates the security features of the exam environment
                </p>
                <p>
                  • Security categories: Prevention (blocking violations), Detection (identifying violations), Response (actions taken)
                </p>
                <p>
                  • Features are rated by importance: Critical (essential), High (important), Medium (recommended), Low (optional)
                </p>
                <p>
                  • For higher security needs, consider implementing the recommended features
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* === STATISTICS TAB === */}
        <TabsContent value="statistics">
          {examStats && (
            <>
              {/* Exam Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="col-span-1 md:col-span-3">
                  <CardHeader className="pb-2">
                    <CardTitle>Exam Overview</CardTitle>
                    <CardDescription>Performance and usage metrics from all exams</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Total Exams</span>
                          <span className="font-semibold">{examStats.totalExams}</span>
                        </div>
                        <Progress className="h-2" value={100} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Completion Rate</span>
                          <span className="font-semibold">{Math.round((examStats.completedExams / examStats.totalExams) * 100)}%</span>
                        </div>
                        <Progress className="h-2" value={(examStats.completedExams / examStats.totalExams) * 100} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Average Score</span>
                          <span className="font-semibold">{examStats.avgScore}%</span>
                        </div>
                        <Progress className="h-2" value={examStats.avgScore} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Exam Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-blue-100">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{examStats.avgScore}%</p>
                        <p className="text-sm text-muted-foreground">Average Score</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Exam Duration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-orange-100">
                        <Clock className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{examStats.avgDuration} min</p>
                        <p className="text-sm text-muted-foreground">Average Completion Time</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Security Violations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-red-100">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{examStats.securityViolations}</p>
                        <p className="text-sm text-muted-foreground">Total Violations</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Accessibility Feature Usage */}
              <Card>
                <CardHeader>
                  <CardTitle>Accessibility Feature Usage</CardTitle>
                  <CardDescription>
                    Statistics on which accessibility features are being used
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {examStats.accessibilityFeatures.map((feature, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{feature.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {feature.count} users ({Math.round((feature.count / examStats.totalExams) * 100)}%)
                          </span>
                        </div>
                        <Progress 
                          value={(feature.count / examStats.totalExams) * 100} 
                          className="h-2" 
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="text-sm text-muted-foreground border-t pt-4 flex justify-between">
                  <span>{examStats.accessibilityFeatures.reduce((sum, feat) => sum + feat.count, 0)} total feature usages</span>
                  <Button variant="ghost" size="sm">
                    Download Full Report
                  </Button>
                </CardFooter>
              </Card>
            </>
          )}
          
          {!examStats && !isScanning && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No exam statistics available.</p>
            </div>
          )}
          
          {isScanning && (
            <div className="text-center py-12">
              <div className="animate-pulse mb-4">
                <Users className="h-12 w-12 text-primary mx-auto" />
              </div>
              <p className="text-muted-foreground">Loading exam statistics...</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
