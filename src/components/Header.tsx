import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { Sun, Moon } from 'lucide-react';
import { useExamLockdownContext } from '@/contexts/ExamLockdownContext';
import { LogOut, Home, User } from 'lucide-react';

export const Header: React.FC = () => {
  const { profile, isAuthenticated, logout, features, updateFeature } = useAccessibility();
  const { hideNavbar } = useExamLockdownContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (hideNavbar) {
    return null; // Don't render the header during exam mode
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src="/exambridge.png" 
            alt="EXAM BRIDGE Logo" 
            className="h-10 w-auto object-contain" 
          />
          <span className="font-bold text-xl">EXAM BRIDGE</span>
        </Link>

        <nav className="flex items-center gap-4">
          {/* Global Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle dark mode"
            onClick={() => updateFeature('darkMode', !features.darkMode)}
            className="mr-2"
          >
            {features.darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
          {isAuthenticated && profile ? (
            <>
              <Link to={profile.role === 'student' ? '/student/dashboard' : '/teacher/dashboard'}>
                <Button variant="ghost" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              
              {profile.role === 'student' && (
                <Link to="/student/profile">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </Link>
              )}

              <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-muted">
                <span className="text-sm text-muted-foreground">{profile.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {profile.role}
                </span>
              </div>

              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/auth">
                <Button variant="default" size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
