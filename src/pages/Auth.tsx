import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAccessibility, DisabilityType } from '@/contexts/AccessibilityContext';
// Removed AccountManager quick-save helper
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [disabilityType, setDisabilityType] = useState<DisabilityType>('none');
  const { login, signup, isAuthenticated, profile, features } = useAccessibility();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && profile) {
      navigate(profile.role === 'student' ? '/student/dashboard' : '/teacher/dashboard');
    }
  }, [isAuthenticated, profile, navigate]);

  const validateEmail = (email: string) => {
    // Regex to check if email is from gmail.com or ends with .edu.in
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|.*\.edu\.in)$/i;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent, mode: 'login' | 'signup') => {
    e.preventDefault();
    
    if (mode === 'login') {
      if (!email || !password) {
        toast.error('Please fill in all fields');
        return;
      }

      try {
        const { token, user } = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        }).then(res => res.json());

        if (token && user) {
          // Removed saving test user account locally
          // Store token for quick login
          localStorage.setItem(`token_${email}`, token);
          // Call the context login
          await login(email, password, token);
        }
      } catch (error) {
        console.error('Login failed:', error);
        toast.error('Login failed');
      }
    } else {
      if (!name || !email || !password) {
        toast.error('Please fill in all fields');
        return;
      }

      // Validate email format for signup
      if (!validateEmail(email)) {
        toast.error('Please use a valid Gmail or .edu.in email address');
        return;
      }
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      if (mode === 'login') {
        await login(email, password, role);
      } else {
        await signup(email, password, name, role, disabilityType);
        if (role === 'student' && disabilityType !== 'none') {
          toast.success('Account created! Please upload your medical certificate for verification.');
          navigate('/student/profile');
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  // Demo exam removed

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-48 -left-48 w-96 h-96 rounded-full bg-primary/10 blur-3xl animate-pulse" 
             style={{ animationDuration: '15s' }} />
        <div className="absolute top-1/2 -right-48 w-96 h-96 rounded-full bg-secondary/10 blur-3xl animate-pulse"
             style={{ animationDuration: '20s', animationDelay: '2s' }} />
        <div className="absolute -bottom-48 left-1/4 w-96 h-96 rounded-full bg-accent/10 blur-3xl animate-pulse"
             style={{ animationDuration: '18s', animationDelay: '1s' }} />
      </div>
      
      <Card className="w-full max-w-md shadow-glow backdrop-blur-md bg-card/90 animate-scale-in border border-white/20">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/5 to-secondary/5 opacity-80 z-0"></div>
        <CardHeader className="text-center relative z-10">
          <div className="mx-auto h-14 w-14 rounded-full bg-gradient-to-br from-primary to-secondary mb-4 shadow-glow flex items-center justify-center transition-transform hover:scale-110 duration-500">
            <span className="text-white font-bold text-xl">EB</span>
          </div>
          <CardTitle className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Welcome to EXAM BRIDGE</CardTitle>
          <CardDescription className="text-foreground/80">Sign in to access your accessible exam platform</CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 p-1 mb-4 bg-muted/50 backdrop-blur-sm">
              <TabsTrigger value="login" className="transition-all data-[state=active]:bg-white data-[state=active]:shadow-md">Login</TabsTrigger>
              <TabsTrigger value="signup" className="transition-all data-[state=active]:bg-white data-[state=active]:shadow-md">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={(e) => handleSubmit(e, 'login')} className="space-y-5">
                <div className="space-y-2 group">
                  <Label htmlFor="login-email" className="inline-block transition-all group-hover:-translate-y-0.5 group-hover:text-primary">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="student@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    aria-required="true"
                    className="border-muted/60 bg-background/80 dark:bg-muted/20 text-foreground placeholder:text-muted-foreground backdrop-blur-sm transition-all focus:border-primary/50 focus:bg-background"
                  />
                </div>
                
                <div className="space-y-2 group">
                  <Label htmlFor="login-password" className="inline-block transition-all group-hover:-translate-y-0.5 group-hover:text-primary">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    aria-required="true"
                    className="border-muted/60 bg-background/80 dark:bg-muted/20 text-foreground placeholder:text-muted-foreground backdrop-blur-sm transition-all focus:border-primary/50 focus:bg-background"
                  />
                </div>

                <div className="space-y-2 group">
                  <Label htmlFor="login-role" className="inline-block transition-all group-hover:-translate-y-0.5 group-hover:text-primary">Role</Label>
                  <Select 
                    value={role} 
                    onValueChange={(value) => setRole(value as 'student' | 'teacher')}
                  >
                    <SelectTrigger id="login-role" className="border-muted/60 bg-background/80 dark:bg-muted/20 text-foreground backdrop-blur-sm transition-all focus:border-primary/50 hover:bg-muted/40">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full mt-6 transition-all bg-gradient-to-r from-primary to-primary hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5" variant="default">
                  Login
                </Button>
                
                {/* Practice exam removed */}
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={(e) => handleSubmit(e, 'signup')} className="space-y-5">
                <div className="space-y-2 group">
                  <Label htmlFor="signup-name" className="inline-block transition-all group-hover:-translate-y-0.5 group-hover:text-primary">Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    aria-required="true"
                    className="border-muted/60 bg-background/80 dark:bg-muted/20 text-foreground placeholder:text-muted-foreground backdrop-blur-sm transition-all focus:border-primary/50 focus:bg-background"
                  />
                </div>
              
                <div className="space-y-2 group">
                  <Label htmlFor="signup-email" className="inline-block transition-all group-hover:-translate-y-0.5 group-hover:text-primary">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="student@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    aria-required="true"
                    className="border-muted/60 bg-background/80 dark:bg-muted/20 text-foreground placeholder:text-muted-foreground backdrop-blur-sm transition-all focus:border-primary/50 focus:bg-background"
                  />
                  <p className="text-xs text-muted-foreground/90 pl-1 animate-fade-in" style={{animationDelay: '0.2s'}}>
                    Only Gmail or .edu.in email addresses are allowed
                  </p>
                </div>
                
                <div className="space-y-2 group">
                  <Label htmlFor="signup-password" className="inline-block transition-all group-hover:-translate-y-0.5 group-hover:text-primary">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    aria-required="true"
                    aria-describedby="password-requirements"
                    className="border-muted/60 bg-background/80 dark:bg-muted/20 text-foreground placeholder:text-muted-foreground backdrop-blur-sm transition-all focus:border-primary/50 focus:bg-background"
                  />
                  <p id="password-requirements" className="text-xs text-muted-foreground/90 pl-1 animate-fade-in" style={{animationDelay: '0.3s'}}>
                    Must be at least 6 characters
                  </p>
                </div>

                <div className="space-y-2 group">
                  <Label htmlFor="signup-role" className="inline-block transition-all group-hover:-translate-y-0.5 group-hover:text-primary">Role</Label>
                  <Select 
                    value={role} 
                    onValueChange={(value) => setRole(value as 'student' | 'teacher')}
                  >
                    <SelectTrigger id="signup-role" className="border-muted/60 bg-background/80 dark:bg-muted/20 text-foreground backdrop-blur-sm transition-all focus:border-primary/50 hover:bg-muted/40">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {role === 'student' && (
                  <div className="space-y-2 group animate-fade-in">
                    <Label htmlFor="disability-type" className="inline-block transition-all group-hover:-translate-y-0.5 group-hover:text-primary">Disability Type</Label>
                    <Select value={disabilityType} onValueChange={(value) => setDisabilityType(value as DisabilityType)}>
                    <SelectTrigger id="disability-type" className="border-muted/60 bg-background/80 dark:bg-muted/20 text-foreground backdrop-blur-sm transition-all focus:border-primary/50 hover:bg-muted/40">
                        <SelectValue placeholder="Select disability type" />
                      </SelectTrigger>
                      <SelectContent className="bg-background/95 backdrop-blur-md border-white/20">
                        <SelectItem value="none">No Disability</SelectItem>
                        <SelectItem value="dyslexia">Dyslexia</SelectItem>
                        <SelectItem value="low-vision">Low Vision</SelectItem>
                        <SelectItem value="hearing">Hearing Impairment</SelectItem>
                        <SelectItem value="motor">Motor Disability</SelectItem>
                        <SelectItem value="adhd">ADHD</SelectItem>
                      </SelectContent>
                    </Select>
                    {disabilityType !== 'none' && (
                      <p className="text-xs text-muted-foreground/90 pl-1 animate-fade-in">
                        You'll be prompted to upload a medical certificate for verification.
                      </p>
                    )}
                  </div>
                )}

                <Button type="submit" className="w-full mt-6 transition-all bg-gradient-to-r from-primary to-primary hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5" variant="default">
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Practice exam dialog removed */}
    </div>
  );
};