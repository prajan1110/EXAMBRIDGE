import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { Upload, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { certificateAPI } from '@/services/certificateAPI';

export const StudentProfile: React.FC = () => {
  const { profile, setProfile, applyRecommendedFeatures } = useAccessibility();
  const [uploading, setUploading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

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
    toast.info('Uploading and analyzing certificate...');

    try {
      // Use the certificate API to upload the file
      const result = await certificateAPI.uploadCertificate(file);
      setVerificationResult(result.verificationResult);

      if (result.verificationResult.status === 'Valid' && profile) {
        const updatedProfile = {
          ...profile,
          disabilityType: result.verificationResult.disability_type.toLowerCase().replace(' ', '-') as any,
          verificationStatus: 'verified' as const,
          recommendedFeatures: result.verificationResult.recommended_features,
        };

        setProfile(updatedProfile);
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        
        // Apply recommended features
        applyRecommendedFeatures(result.verificationResult.recommended_features);

        toast.success(`Verified: ${result.verificationResult.disability_type}. Accessibility features activated!`);
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
      console.error('Error uploading certificate:', error);
      toast.error(error.message || 'Error processing certificate. Please try again.');
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
                <p className="text-sm text-primary">Uploading and analyzing certificate...</p>
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
            <CardContent className="pt-6">
              <p className="text-sm">
                <strong>Note:</strong> You can use the accessibility toolbar at the bottom-right of any page 
                to customize your experience further. Try the demo exam to see how your interface adapts!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};