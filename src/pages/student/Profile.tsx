import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { Upload, CheckCircle2, XCircle, Clock, AlertCircle, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type AIVerificationResult = {
  status: 'Valid' | 'Invalid';
  disability_type: string;
  recommended_features: string[];
  confidence: number;
};

export const StudentProfile: React.FC = () => {
  const { profile, setProfile, applyRecommendedFeatures } = useAccessibility();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<AIVerificationResult | null>(null);

  const simulateAIVerification = async (file: File): Promise<AIVerificationResult> => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate different verification outcomes based on file name
    const fileName = file.name.toLowerCase();
    
    if (fileName.includes('dyslexia')) {
      return {
        status: 'Valid',
        disability_type: 'Dyslexia',
        recommended_features: ['tts', 'dyslexicFont', 'fontSize', 'extraTime'],
        confidence: 0.92,
      };
    } else if (fileName.includes('vision') || fileName.includes('blind')) {
      return {
        status: 'Valid',
        disability_type: 'Low Vision',
        recommended_features: ['tts', 'highContrast', 'fontSize', 'extraTime'],
        confidence: 0.88,
      };
    } else if (fileName.includes('hearing') || fileName.includes('deaf')) {
      return {
        status: 'Valid',
        disability_type: 'Hearing Impairment',
        recommended_features: ['captions', 'extraTime'],
        confidence: 0.90,
      };
    } else if (fileName.includes('motor')) {
      return {
        status: 'Valid',
        disability_type: 'Motor Disability',
        recommended_features: ['keyboardOnly', 'extraTime', 'stt'],
        confidence: 0.85,
      };
    } else if (fileName.includes('adhd')) {
      return {
        status: 'Valid',
        disability_type: 'ADHD',
        recommended_features: ['extraTime', 'fontSize'],
        confidence: 0.87,
      };
    } else {
      return {
        status: 'Invalid',
        disability_type: 'None',
        recommended_features: [],
        confidence: 0.45,
      };
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PDF or image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    toast.info('Analyzing certificate with AI...');

    try {
      const result = await simulateAIVerification(file);
      setVerificationResult(result);

      if (result.status === 'Valid' && profile) {
        const updatedProfile = {
          ...profile,
          disabilityType: result.disability_type.toLowerCase().replace(' ', '-') as any,
          verificationStatus: 'verified' as const,
          certificateUrl: URL.createObjectURL(file),
          recommendedFeatures: result.recommended_features,
        };

        setProfile(updatedProfile);
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        
        // Apply recommended features
        applyRecommendedFeatures(result.recommended_features);

        toast.success(`Verified: ${result.disability_type}. Accessibility features activated!`);
      } else {
        if (profile) {
          const updatedProfile = {
            ...profile,
            verificationStatus: 'rejected' as const,
          };
          setProfile(updatedProfile);
          localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        }
        toast.error('Certificate could not be verified. Standard interface will be used.');
      }
    } catch (error) {
      toast.error('Error processing certificate. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = () => {
    if (!profile) return null;

    switch (profile.verificationStatus) {
      case 'verified':
        return (
          <Badge className="bg-verified text-verified-foreground">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-pending text-pending-foreground">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-rejected text-rejected-foreground">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <AlertCircle className="h-3 w-3 mr-1" />
            Not Submitted
          </Badge>
        );
    }
  };

  return (
    <div className="container max-w-4xl py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">Accessibility Profile</h1>
      <p className="text-muted-foreground mb-8">
        Upload your medical certificate for AI verification and personalized accessibility features
      </p>

      <div className="grid gap-6">
        {/* Profile Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Profile Information</CardTitle>
              {getStatusBadge()}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Name</Label>
                <p className="font-medium">{profile?.name}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Email</Label>
                <p className="font-medium">{profile?.email}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Disability Type</Label>
                <p className="font-medium capitalize">
                  {profile?.disabilityType === 'none' ? 'Not Verified' : profile?.disabilityType.replace('-', ' ')}
                </p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Role</Label>
                <p className="font-medium capitalize">{profile?.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Certificate Upload Card */}
        <Card className="border-2 border-dashed">
          <CardHeader>
            <CardTitle>Medical Certificate Verification</CardTitle>
            <CardDescription>
              Upload an official medical certificate or disability documentation for AI-powered verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-muted rounded-lg hover:border-primary/50 transition-smooth">
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <Label
                htmlFor="certificate-upload"
                className="cursor-pointer text-sm font-medium hover:text-primary transition-smooth"
              >
                Click to upload or drag and drop
              </Label>
              <Input
                id="certificate-upload"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
                aria-label="Upload medical certificate"
              />
              <p className="text-xs text-muted-foreground mt-2">
                PDF, JPG, PNG (max 5MB)
              </p>
            </div>

            {uploading && (
              <div className="flex items-center justify-center p-4 bg-primary/5 rounded-lg animate-pulse">
                <p className="text-sm text-primary">Analyzing certificate with AI...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Verification Result Card */}
        {verificationResult && (
          <Card className={verificationResult.status === 'Valid' ? 'border-verified' : 'border-rejected'}>
            <CardHeader>
              <div className="flex items-center gap-2">
                {verificationResult.status === 'Valid' ? (
                  <CheckCircle2 className="h-5 w-5 text-verified" />
                ) : (
                  <XCircle className="h-5 w-5 text-rejected" />
                )}
                <CardTitle>Verification Result</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <p className="font-medium">{verificationResult.status}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Confidence</Label>
                  <p className="font-medium">{(verificationResult.confidence * 100).toFixed(0)}%</p>
                </div>
              </div>

              {verificationResult.status === 'Valid' && (
                <>
                  <div>
                    <Label className="text-sm text-muted-foreground">Detected Disability</Label>
                    <p className="font-medium">{verificationResult.disability_type}</p>
                  </div>

                  <div>
                    <Label className="text-sm text-muted-foreground mb-2 block">
                      Recommended Accessibility Features
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {verificationResult.recommended_features.map((feature) => (
                        <Badge key={feature} variant="secondary">
                          {feature.replace(/([A-Z])/g, ' $1').trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                    <p className="text-sm text-success-foreground">
                      ✓ Your accessibility features have been automatically activated based on your verified needs.
                    </p>
                  </div>
                </>
              )}

              {verificationResult.status === 'Invalid' && (
                <div className="p-4 bg-rejected/10 border border-rejected/20 rounded-lg">
                  <p className="text-sm text-rejected-foreground">
                    The certificate could not be verified. Please ensure you upload an official medical document 
                    or contact support for assistance. You will have access to the standard exam interface.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {profile?.verificationStatus === 'verified' && (
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle>Try Your Accessibility Settings</CardTitle>
              <CardDescription>
                Launch a short practice quiz to verify that font, contrast, TTS, and timing feel right.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4 flex-wrap">
              <p className="text-sm text-muted-foreground">
                You can retake this practice anytime without affecting your real exams.
              </p>
              <Button onClick={() => navigate('/student/exam/practice')}>
                <PlayCircle className="h-4 w-4 mr-2" /> Start Practice Quiz
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
