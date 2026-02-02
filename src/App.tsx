import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AccessibilityProvider, useAccessibility } from "./contexts/AccessibilityContext";
import { ExamLockdownProvider } from "./contexts/ExamLockdownContext";
import { Header } from "./components/Header";
import { AccessibilityToolbar } from "./components/AccessibilityToolbar";
// Chatbot removed per request

// Pages
import { Home } from "./pages/Home";
import { Auth } from "./pages/Auth";
import { StudentProfile } from "./pages/student/Profile";
import { StudentDashboard } from "./pages/student/Dashboard";
import { Exam } from "./pages/student/Exam";
import { Results } from "./pages/student/Results";
import { TeacherDashboard } from "./pages/teacher/Dashboard";
import { CreateQuiz } from "./pages/teacher/CreateQuiz";
import { AccessibilityPreview } from "./pages/teacher/AccessibilityPreview";
import { Audit } from "./pages/Audit";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route wrapper
const ProtectedRoute = ({ children, role }: { children: React.ReactNode; role?: 'student' | 'teacher' }) => {
  const { isAuthenticated, profile } = useAccessibility();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (role && profile?.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error?: any }>{
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    // eslint-disable-next-line no-console
    console.error('Render error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24 }}>
          <h2>Something went wrong.</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children as any;
  }
}

const AppContent = () => {
  const { features } = useAccessibility();
  
  // Add this effect to show a tooltip when color blind theme changes
  useEffect(() => {
    // Guard against missing or malformed value from localStorage
    const currentTheme = typeof features?.colorTheme === 'string' ? features.colorTheme : 'default';
    if (currentTheme !== 'default') {
      const themeName = currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1);
      // Show feedback when theme changes
      const toast = document.createElement('div');
      toast.className = 'theme-toast';
      toast.style.position = 'fixed';
      toast.style.top = '70px';
      toast.style.right = '20px';
      toast.style.padding = '10px 15px';
      toast.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      toast.style.color = 'white';
      toast.style.borderRadius = '4px';
      toast.style.zIndex = '9999';
      toast.style.transition = 'opacity 0.5s';
      toast.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
      
      toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 12px; height: 12px; border-radius: 50%; background: white;"></div>
          <span>${themeName} Mode Activated</span>
        </div>
        <div style="font-size: 12px; margin-top: 5px;">
          Special patterns are now visible on quiz options
        </div>
      `;
      
      document.body.appendChild(toast);
      
      // Remove after 4 seconds
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 500);
      }, 4000);
    }
  }, [features.colorTheme]);
  
  return (
    <>
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/audit" element={<Audit />} />

          {/* Student Routes */}
          <Route
            path="/student/profile"
            element={
              <ProtectedRoute role="student">
                <StudentProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute role="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/exam/:id"
            element={
              <ProtectedRoute role="student">
                <Exam />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/exam/practice"
            element={
              <ProtectedRoute role="student">
                <Exam />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/results/:id"
            element={
              <ProtectedRoute role="student">
                <Results />
              </ProtectedRoute>
            }
          />

          {/* Teacher Routes */}
          <Route
            path="/teacher/dashboard"
            element={
              <ProtectedRoute role="teacher">
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/create-quiz"
            element={
              <ProtectedRoute role="teacher">
                <CreateQuiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/preview"
            element={
              <ProtectedRoute role="teacher">
                <AccessibilityPreview />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <AccessibilityToolbar />
      {/* ChatbotWidget removed */}
    </>
  );
};


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AccessibilityProvider>
          <ExamLockdownProvider>
            <ErrorBoundary>
              <AppContent />
            </ErrorBoundary>
          </ExamLockdownProvider>
        </AccessibilityProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
