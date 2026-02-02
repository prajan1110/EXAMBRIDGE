import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Eye, Type, Contrast, Ear, MousePointer } from 'lucide-react';
import { DisabilityType } from '@/contexts/AccessibilityContext';

export const AccessibilityPreview: React.FC = () => {
  const [previewMode, setPreviewMode] = useState<DisabilityType>('none');

  const modes: { value: DisabilityType; label: string; icon: any; features: string[] }[] = [
    {
      value: 'none',
      label: 'Standard View',
      icon: Eye,
      features: ['Default interface', 'No special accommodations'],
    },
    {
      value: 'dyslexia',
      label: 'Dyslexia',
      icon: Type,
      features: ['OpenDyslexic font', 'Text-to-Speech', 'Increased font size', 'Extra time'],
    },
    {
      value: 'low-vision',
      label: 'Low Vision',
      icon: Contrast,
      features: ['High contrast mode', 'Large fonts', 'Text-to-Speech', 'Extra time'],
    },
    {
      value: 'hearing',
      label: 'Hearing Impairment',
      icon: Ear,
      features: ['Visual captions', 'Text alternatives', 'Extra time'],
    },
    {
      value: 'motor',
      label: 'Motor Disability',
      icon: MousePointer,
      features: ['Keyboard-only navigation', 'Speech-to-Text', 'Extra time', 'Larger click targets'],
    },
  ];

  const selectedMode = modes.find(m => m.value === previewMode);

  return (
    <div className="container max-w-6xl py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">Accessibility Preview Mode</h1>
      <p className="text-muted-foreground mb-8">
        Simulate how your quiz appears for students with different accessibility needs
      </p>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Mode Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Select Preview Mode</CardTitle>
              <CardDescription>Choose a disability type to simulate</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={previewMode} onValueChange={(v) => setPreviewMode(v as DisabilityType)}>
                <div className="space-y-3">
                  {modes.map((mode) => (
                    <div
                      key={mode.value}
                      className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-smooth cursor-pointer ${
                        previewMode === mode.value ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'
                      }`}
                      onClick={() => setPreviewMode(mode.value)}
                    >
                      <RadioGroupItem value={mode.value} id={mode.value} />
                      <Label htmlFor={mode.value} className="flex-1 cursor-pointer flex items-center gap-2">
                        <mode.icon className="h-4 w-4" />
                        {mode.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {selectedMode && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Active Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedMode.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-success" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-2">
          <Card className="border-2 border-dashed">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Preview: Sample Quiz Question</CardTitle>
                <Badge variant="secondary">{selectedMode?.label}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div
                className={`space-y-4 transition-all ${
                  previewMode === 'dyslexia' ? 'font-dyslexic' : ''
                } ${previewMode === 'low-vision' ? 'text-lg' : ''}`}
                style={{
                  fontSize: previewMode === 'low-vision' ? '20px' : undefined,
                  filter: previewMode === 'low-vision' ? 'contrast(150%)' : undefined,
                }}
              >
                <div className={previewMode === 'low-vision' ? 'high-contrast' : ''}>
                  <h3 className="font-semibold text-lg mb-4">
                    What is the primary purpose of ARIA labels in web development?
                  </h3>

                  <div className="space-y-3">
                    {[
                      'To improve SEO rankings',
                      'To provide accessibility information for screen readers',
                      'To style HTML elements',
                      'To create animations',
                    ].map((option, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-2 transition-smooth hover:border-primary ${
                          previewMode === 'motor' ? 'min-h-[60px] cursor-pointer' : ''
                        }`}
                      >
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="radio" name="preview-question" className="h-5 w-5" />
                          <span>{option}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {previewMode === 'hearing' && (
                  <div className="mt-6 p-4 bg-muted rounded-lg border-2 border-primary/50">
                    <p className="text-sm font-semibold mb-2">🔊 Audio Transcript / Caption:</p>
                    <p className="text-sm text-muted-foreground">
                      "Question: What is the primary purpose of ARIA labels in web development? 
                      Four options are provided. Option 1: To improve SEO rankings..."
                    </p>
                  </div>
                )}

                {previewMode === 'dyslexia' && (
                  <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-sm">
                      ✓ OpenDyslexic font active for improved readability
                    </p>
                  </div>
                )}

                {previewMode === 'motor' && (
                  <div className="mt-6 p-4 bg-secondary/5 rounded-lg border border-secondary/20">
                    <p className="text-sm">
                      ✓ Larger click targets and full keyboard navigation enabled
                    </p>
                  </div>
                )}

                {previewMode === 'low-vision' && (
                  <div className="mt-6 p-4 bg-warning/5 rounded-lg border border-warning/20">
                    <p className="text-sm">
                      ✓ High contrast mode and larger text for improved visibility
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6 bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">Preview Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                • This preview demonstrates how your quiz adapts for students with verified accessibility needs
              </p>
              <p>
                • Features are automatically activated based on AI certificate verification
              </p>
              <p>
                • Unverified students see the standard interface (no accessibility aids)
              </p>
              <p>
                • All modifications maintain exam integrity while ensuring equal access
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
