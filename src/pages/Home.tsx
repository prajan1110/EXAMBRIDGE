import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { 
  CheckCircle2, Brain, Shield, Users, Zap, Accessibility, 
  ScrollText, FileText, Check, CircleCheck, FileCheck, Settings
} from 'lucide-react';
// Removed quick-login AccountManager and MD5 gravatars

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10" />
        
        {/* Animated Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-[10%] w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-pulse" 
              style={{ animationDuration: '15s' }} />
          <div className="absolute top-1/3 right-[15%] w-80 h-80 rounded-full bg-secondary/5 blur-3xl animate-pulse"
              style={{ animationDuration: '20s', animationDelay: '2s' }} />
          <div className="absolute bottom-1/4 left-[30%] w-72 h-72 rounded-full bg-accent/5 blur-3xl animate-pulse"
              style={{ animationDuration: '18s', animationDelay: '1s' }} />
          
          {/* Decorative Elements */}
          <div className="absolute top-20 right-[20%] w-20 h-20 rotate-45 border-2 border-primary/10 animate-spin"
              style={{ animationDuration: '30s' }} />
          <div className="absolute bottom-40 left-[20%] w-32 h-32 rounded-full border-2 border-secondary/10 animate-ping"
              style={{ animationDuration: '15s', animationDelay: '1s', animationIterationCount: 'infinite' }} />
        </div>
        
        <div className="container relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gradient opacity-0 animate-fade-in" style={{animationDelay: '0.2s', animationFillMode: 'forwards'}}>
              Inclusive Exams.<br className="hidden md:block" /> Equal Opportunity.
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 opacity-0 animate-fade-in" style={{animationDelay: '0.6s', animationFillMode: 'forwards'}}>
              AI-powered exam platform ensuring fairness for all learners, including differently-abled students.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-in" style={{animationDelay: '1s', animationFillMode: 'forwards'}}>
              {/* Quick Login removed */}
              
              {/* Get Started Button */}
              <Link to="/auth">
                <Button variant="hero" size="xl" className="w-full sm:w-auto bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1 transition-all">
                  Get Started
                </Button>
              </Link>
              {/* Continue as Guest */}
              <Link to="/explore">
                <Button variant="outline" size="xl" className="w-full sm:w-auto backdrop-blur-sm bg-white/10 hover:bg-white/20 transition-all hover:-translate-y-1 border border-white/20">
                  Learn More
                </Button>
              </Link>
            </div>
            
            {/* Floating Accessibility Icons */}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 hidden lg:block">
              {['🔍', '🔊', '🎨', '⌨️', '📱'].map((icon, index) => (
                <div 
                  key={index} 
                  className="bg-white/10 backdrop-blur-md w-12 h-12 rounded-full flex items-center justify-center text-lg mb-4 animate-bounce" 
                  style={{ 
                    animationDuration: `${2 + index * 0.5}s`,
                    animationDelay: `${index * 0.2}s`,
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  {icon}
                </div>
              ))}
            </div>
            
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 hidden lg:block">
              {['👁️', '📄', '🎯', '🔄', '💬'].map((icon, index) => (
                <div 
                  key={index} 
                  className="bg-white/10 backdrop-blur-md w-12 h-12 rounded-full flex items-center justify-center text-lg mb-4 animate-bounce" 
                  style={{ 
                    animationDuration: `${2.5 + index * 0.5}s`,
                    animationDelay: `${index * 0.2 + 0.5}s`,
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  {icon}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-muted/80 to-background" />
        <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-primary/5 to-transparent" />
        <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-secondary/5 to-transparent" />
        
        {/* Animated Patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
        </div>
        
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary inline-block">
              About EXAM BRIDGE <span className="opacity-80">powered by TEAM SHIKSHA</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Our mission is to create an accessible, fair, and inclusive examination ecosystem that adapts 
              to each student's unique needs through cutting-edge AI technology.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {[
              { 
                icon: Brain, 
                title: "AI-Powered Verification", 
                desc: "Intelligent medical certificate analysis to verify disabilities and recommend appropriate accessibility features.",
                color: "text-primary",
                bg: "bg-primary/5",
                border: "border-primary/20",
                delay: 0.1
              },
              { 
                icon: Accessibility, 
                title: "Adaptive Interface", 
                desc: "Dynamic UI that automatically adjusts based on verified accessibility needs - from dyslexic fonts to screen readers.",
                color: "text-secondary",
                bg: "bg-secondary/5",
                border: "border-secondary/20",
                delay: 0.3
              },
              { 
                icon: Shield, 
                title: "Fair & Secure", 
                desc: "WCAG AAA compliant platform ensuring equal opportunity while maintaining exam integrity and data security.",
                color: "text-accent",
                bg: "bg-accent/5",
                border: "border-accent/20",
                delay: 0.5
              }
            ].map((feature, index) => (
              <Card 
                key={index}
                className="border border-white/20 backdrop-blur-sm bg-white/10 hover:bg-white/20 transition-all hover:-translate-y-2 hover:shadow-xl opacity-0 animate-fade-in"
                style={{animationDelay: `${feature.delay}s`, animationFillMode: 'forwards'}}
              >
                <CardHeader>
                  <div className={`rounded-xl p-3 ${feature.bg} ${feature.border} border w-fit mb-4`}>
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <CardTitle className="font-bold tracking-tight">{feature.title}</CardTitle>
                  <CardDescription className="text-foreground/70 text-base mt-2 leading-relaxed">
                    {feature.desc}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-tr from-background to-background/80" />
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-pulse" 
               style={{animationDuration: '8s'}} />
          <div className="absolute bottom-20 left-20 w-80 h-80 rounded-full bg-secondary/5 blur-3xl animate-pulse" 
               style={{animationDuration: '12s'}} />
        </div>
        
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 relative inline-block">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Key Features
              </span>
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 to-secondary/50 rounded-full transform scale-x-0 animate-scale-in" style={{transformOrigin: 'left', animationDelay: '0.5s', animationFillMode: 'forwards'}}></div>
            </h2>
            <p className="text-lg text-muted-foreground mt-4 opacity-0 animate-fade-in" style={{animationDelay: '0.7s', animationFillMode: 'forwards'}}>
              Discover how EXAM BRIDGE transforms the testing experience for students with disabilities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                badge: { text: "Verification", variant: "default" },
                title: "Easy Certificate Verification",
                description: "Simply upload your disability certificate, and our AI system will verify and activate appropriate accommodations.",
                icon: FileCheck,
                delay: 0.6
              },
              {
                badge: { text: "Accessibility", variant: "secondary" },
                title: "Personalized Accommodations",
                description: "From color blind modes to dyslexia-friendly fonts, we automatically enable features that match your specific needs.",
                icon: Settings,
                delay: 0.7
              },
              {
                badge: { text: "Security", variant: "outline" },
                title: "Exam Integrity",
                description: "Enhanced security measures ensure fair testing while providing the accommodations needed.",
                icon: Shield,
                delay: 0.8
              },
              {
                badge: { text: "Adaptation", variant: "secondary" },
                title: "Dynamic UI Adaptation",
                description: "Interface automatically adjusts to match your verified needs with the most suitable accessibility features.",
                icon: Zap,
                delay: 0.9
              },
              {
                badge: { text: "AI-Powered", variant: "default" },
                title: "Intelligent Analysis",
                description: "Our AI analyzes medical certificates to identify and recommend the most appropriate accommodations.",
                icon: Brain,
                delay: 1.0
              },
              {
                badge: { text: "Equality", variant: "outline" },
                title: "Equal Opportunity",
                description: "Level the playing field with fairness and inclusion at the core of our examination platform.",
                icon: Users,
                delay: 1.1
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="p-6 rounded-xl border border-white/10 backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-all hover:shadow-lg transform opacity-0 animate-fade-in"
                style={{animationDelay: `${feature.delay}s`, animationFillMode: 'forwards'}}
              >
                <div className="flex items-start">
                  <div className="mr-4 rounded-full p-2 bg-primary/10 border border-primary/20">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <Badge variant={feature.badge.variant as "default" | "secondary" | "outline"} className="mb-2">
                      {feature.badge.text}
                    </Badge>
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                    <p className="mt-2 text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Choose EXAM BRIDGE?</h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              { title: 'Accessibility First', description: 'Built from the ground up with WCAG AAA compliance and universal design principles.' },
              { title: 'Fairness & Equity', description: 'AI ensures only verified students receive appropriate accommodations, preventing misuse.' },
              { title: 'Data Security', description: 'Medical certificates and personal data are handled with enterprise-grade security.' },
              { title: 'Ease of Use', description: 'Intuitive interface for both students and teachers with minimal learning curve.' },
            ].map((advantage, index) => (
              <div key={index} className="flex gap-4 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <CheckCircle2 className="h-6 w-6 text-success shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">{advantage.title}</h3>
                  <p className="text-muted-foreground">{advantage.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/50 to-secondary/40" />
        
        {/* Animated patterns */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute left-10 top-10 w-64 h-64 rounded-full border border-white/20 animate-float" 
               style={{animationDuration: '20s'}} />
          <div className="absolute left-20 top-20 w-40 h-40 rounded-full border border-white/20 animate-float" 
               style={{animationDuration: '15s', animationDelay: '1s'}} />
          <div className="absolute right-10 bottom-10 w-64 h-64 rounded-full border border-white/20 animate-float" 
               style={{animationDuration: '20s', animationDelay: '0.5s'}} />
          <div className="absolute right-20 bottom-20 w-40 h-40 rounded-full border border-white/20 animate-float" 
               style={{animationDuration: '15s', animationDelay: '1.5s'}} />
        </div>
        
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center backdrop-blur-sm bg-white/10 rounded-2xl p-12 border border-white/20 shadow-glow">
            <div className="opacity-0 animate-fade-in" style={{animationDelay: '0.3s', animationFillMode: 'forwards'}}>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                Ready to Experience Fair Exams?
              </h2>
            </div>
            
            <div className="opacity-0 animate-fade-in" style={{animationDelay: '0.6s', animationFillMode: 'forwards'}}>
              <p className="text-xl mb-10 text-white/90 max-w-2xl mx-auto">
                Join EXAM BRIDGE today and be part of a revolutionary approach to accessible education 
                that ensures equal opportunity for all students.
              </p>
            </div>
            
            <div className="opacity-0 animate-fade-in flex justify-center" 
                 style={{animationDelay: '0.9s', animationFillMode: 'forwards'}}>
              <Link to="/auth">
                <Button 
                  variant="hero" 
                  size="xl" 
                  className="bg-white text-primary hover:bg-white/90 hover:scale-105 transition-all shadow-lg"
                >
                  Sign Up Now
                  <div className="ml-2 relative">
                    <span className="absolute -right-1 -top-1 w-3 h-3 rounded-full bg-secondary animate-ping"></span>
                    <span className="relative w-2 h-2 rounded-full bg-secondary"></span>
                  </div>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-background to-muted/30" />
        
        {/* Top border with gradient */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        
        <div className="container relative z-10">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="md:col-span-1">
              <div className="mb-5 flex items-center">
                <Accessibility className="w-6 h-6 text-primary mr-2" />
                <h3 className="font-bold text-lg">EXAM BRIDGE</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered accessible exam platform for inclusive education.
              </p>
              <div className="mt-5 space-x-3">
                {[
                  { icon: 'github', href: '#', label: 'GitHub' },
                  { icon: 'twitter', href: '#', label: 'Twitter' },
                  { icon: 'linkedin', href: '#', label: 'LinkedIn' }
                ].map((social) => (
                  <a 
                    key={social.icon}
                    href={social.href}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted/50 hover:bg-primary/20 transition-all"
                    aria-label={social.label}
                  >
                    <span className="sr-only">{social.label}</span>
                    {social.icon === 'github' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>}
                    {social.icon === 'twitter' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>}
                    {social.icon === 'linkedin' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>}
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-5 text-lg">Quick Links</h3>
              <ul className="space-y-3">
                {[
                  { text: 'About', link: '/#about' },
                  { text: 'Features', link: '/#features' },
                  { text: 'Login', link: '/auth' }
                ].map((item, index) => (
                  <li key={index}>
                    <Link 
                      to={item.link} 
                      className="text-muted-foreground hover:text-primary transition-colors flex items-center group"
                    >
                      <span className="w-1 h-1 bg-primary/50 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-all"></span>
                      {item.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-5 text-lg">Resources</h3>
              <ul className="space-y-3">
                {[
                  { text: 'Accessibility Policy', link: '#' },
                  { text: 'WCAG Audit', link: '/audit' },
                  { text: 'Contact', link: '#' }
                ].map((item, index) => (
                  <li key={index}>
                    <Link 
                      to={item.link} 
                      className="text-muted-foreground hover:text-primary transition-colors flex items-center group"
                    >
                      <span className="w-1 h-1 bg-primary/50 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-all"></span>
                      {item.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-5 text-lg">Subscribe</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Stay updated with the latest features and releases.
              </p>
              <div className="flex">
                <div className="relative flex-grow">
                  <input
                    type="email"
                    placeholder="Email address"
                    className="w-full rounded-l-md border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <Button className="rounded-l-none">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
            © 2025 EXAM BRIDGE powered by TEAM SHIKSHA. All rights reserved. | WCAG AAA Compliant
          </div>
        </div>
      </footer>
    </div>
  );
};
