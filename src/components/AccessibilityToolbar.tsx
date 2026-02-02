import React from 'react';
import { 
  Settings, 
  Type, 
  Eye, 
  Moon, 
  Sun, 
  Volume2, 
  Maximize2, 
  Minimize2,
  LineChart, 
  Ruler, 
  Palette, 
  ZoomIn,
  TextQuote,
  PenTool
} from 'lucide-react';
import { accessibilityPalettes } from '@/lib/color-utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { certificateAPI } from '@/services/certificateAPI';
import { toast } from 'sonner';

export const AccessibilityToolbar: React.FC = () => {
  const { features, updateFeature, profile } = useAccessibility();
  const safeProfile = profile ?? ({ verificationStatus: 'none', disabilityType: 'none', role: 'student' } as any);
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleTTSToggle = () => {
    updateFeature('tts', !features.tts);
    toast.info(features.tts ? 'Text-to-Speech disabled' : 'Text-to-Speech enabled');
  };

  // Demo actions removed per request

  // STT toggle removed

  // Make toolbar available to all users (including not logged in)

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 bg-card border border-border rounded-lg shadow-lg"
      role="toolbar"
      aria-label="Accessibility Controls"
    >
      <div className="flex items-center gap-2 p-3">

        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="icon"
              aria-label="Accessibility Settings"
              className="shrink-0"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-80 bg-popover/95 backdrop-blur-sm" 
            side="top" 
            align="end"
            sideOffset={8}
          >
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2" aria-label="Accessibility Settings Menu">
              <h3 className="font-semibold text-sm sticky top-0 bg-popover/95 backdrop-blur-sm py-1 z-10">Accessibility Features</h3>
              
              {!safeProfile || safeProfile.disabilityType === 'none' ? (
                <div className="p-2 bg-muted rounded-md border border-border">
                  <p className="text-xs text-muted-foreground">
                    Standard Mode - Basic features available
                  </p>
                </div>
              ) : safeProfile?.verificationStatus === 'verified' ? (
                <div className="p-2 bg-success/10 rounded-md border border-success/20">
                  <p className="text-xs text-success-foreground">
                    ✓ Verified: {safeProfile?.disabilityType}
                  </p>
                </div>
              ) : safeProfile?.verificationStatus === 'pending' ? (
                <div className="p-2 bg-warning/10 rounded-md border border-warning/20">
                  <p className="text-xs text-warning-foreground">
                    Pending Verification - Please upload your certificate
                  </p>
                </div>
              ) : null}

                              <div className="space-y-3">
                {safeProfile?.verificationStatus === 'verified' && (
                  <>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <Label htmlFor="dyslexic-font" className="text-sm">OpenDyslexic Font</Label>
                      <Switch
                        id="dyslexic-font"
                        checked={features.dyslexicFont}
                        onCheckedChange={(checked) => updateFeature('dyslexicFont', checked)}
                        className="flex-shrink-0"
                      />
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <Label htmlFor="high-contrast" className="text-sm">High Contrast</Label>
                      <Switch
                        id="high-contrast"
                        checked={features.highContrast}
                        onCheckedChange={(checked) => updateFeature('highContrast', checked)}
                        className="flex-shrink-0"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="font-size" className="text-sm flex items-center gap-2 flex-wrap">
                    <span>Font Size: {features.fontSize}px</span>
                  </Label>
                  <Slider
                    id="font-size"
                    min={14}
                    max={24}
                    step={2}
                    value={[features.fontSize]}
                    onValueChange={([value]) => updateFeature('fontSize', value)}
                  />
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2">
                  <Label htmlFor="dark-mode" className="text-sm flex items-center gap-2 flex-wrap">
                    {features.darkMode ? <Moon className="h-4 w-4 flex-shrink-0" /> : <Sun className="h-4 w-4 flex-shrink-0" />}
                    <span>Dark Mode</span>
                  </Label>
                  <Switch
                    id="dark-mode"
                    checked={features.darkMode}
                    onCheckedChange={(checked) => updateFeature('darkMode', checked)}
                    className="flex-shrink-0"
                  />
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2">
                  <Label htmlFor="tts" className="text-sm">Text-to-Speech</Label>
                  <Switch
                    id="tts"
                    checked={features.tts}
                    onCheckedChange={() => handleTTSToggle()}
                    className="flex-shrink-0"
                  />
                </div>

                {safeProfile?.verificationStatus === 'verified' && (
                  <>
                    {/* Enhanced Accessibility Features */}
                    <div className="pt-2 border-t border-border">
                      <h4 className="text-sm font-medium mb-2 sticky top-0 bg-popover/95 backdrop-blur-sm py-1 z-10">Enhanced Accessibility</h4>
                      
                      {/* Word Spacing */}
                      <div className="space-y-2 mt-3">
                        <Label htmlFor="word-spacing" className="text-sm flex items-center gap-2 flex-wrap">
                          <Ruler className="h-4 w-4" />
                          <span>Word Spacing: {features.wordSpacing}px</span>
                        </Label>
                        <Slider
                          id="word-spacing"
                          min={0}
                          max={8}
                          step={1}
                          value={[features.wordSpacing]}
                          onValueChange={([value]) => updateFeature('wordSpacing', value)}
                        />
                      </div>
                      
                      {/* Color Theme */}
                      <div className="space-y-3 mt-3">
                        <Label htmlFor="color-theme" className="text-sm flex items-center gap-2 flex-wrap">
                          <Palette className="h-4 w-4" />
                          <span>Color Blind Theme</span>
                        </Label>
                        
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <Button
                            variant={features.colorTheme === 'default' ? 'default' : 'outline'}
                            size="sm"
                            className="flex items-center justify-center text-wrap h-auto py-2"
                            onClick={() => updateFeature('colorTheme', 'default')}
                          >
                            <span className="mr-2 w-3 h-3 bg-primary rounded-full flex-shrink-0"></span> 
                            <span>Default</span>
                          </Button>
                          
                          <Button
                            variant={features.colorTheme === 'protanopia' ? 'default' : 'outline'}
                            size="sm"
                            className="flex items-center justify-center text-wrap h-auto py-2"
                            onClick={() => updateFeature('colorTheme', 'protanopia')}
                          >
                            <span className="mr-2 w-3 h-3 rounded-full flex-shrink-0" style={{background: "#0072B2"}}></span> 
                            <span>Protanopia</span>
                          </Button>
                          
                          <Button
                            variant={features.colorTheme === 'deuteranopia' ? 'default' : 'outline'}
                            size="sm"
                            className="flex items-center justify-center text-wrap h-auto py-2"
                            onClick={() => updateFeature('colorTheme', 'deuteranopia')}
                          >
                            <span className="mr-2 w-3 h-3 rounded-full flex-shrink-0" style={{background: "#0072B2"}}></span> 
                            <span>Deuteranopia</span>
                          </Button>
                          
                          <Button
                            variant={features.colorTheme === 'tritanopia' ? 'default' : 'outline'}
                            size="sm"
                            className="flex items-center justify-center text-wrap h-auto py-2"
                            onClick={() => updateFeature('colorTheme', 'tritanopia')}
                          >
                            <span className="mr-2 w-3 h-3 rounded-full flex-shrink-0" style={{background: "#0072B2"}}></span> 
                            <span>Tritanopia</span>
                          </Button>
                          
                          <Button
                            variant={features.colorTheme === 'monochrome' ? 'default' : 'outline'}
                            size="sm"
                            className="flex items-center justify-center col-span-2 text-wrap h-auto py-2"
                            onClick={() => updateFeature('colorTheme', 'monochrome')}
                          >
                            <span className="mr-2 w-3 h-3 rounded-full bg-black flex-shrink-0"></span> 
                            <span>Monochrome</span>
                          </Button>
                        </div>
                        
                        <div className="p-2 bg-muted mt-1 rounded-md">
                          <p className="text-xs text-muted-foreground">
                            Color blind themes add patterns and custom colors optimized for different types of color vision deficiency.
                          </p>
                        </div>
                      </div>
                      
                      {/* Line Focus Mode */}
                      <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                        <Label htmlFor="line-focus" className="text-sm flex items-center gap-2 flex-wrap">
                          <LineChart className="h-4 w-4 flex-shrink-0" />
                          <span>Line Focus Mode</span>
                        </Label>
                        <Switch
                          id="line-focus"
                          checked={features.lineFocusMode}
                          onCheckedChange={(checked) => updateFeature('lineFocusMode', checked)}
                          className="flex-shrink-0"
                        />
                      </div>
                      
                      {/* Screen Magnifier */}
                      <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                        <Label htmlFor="screen-magnifier" className="text-sm flex items-center gap-2 flex-wrap">
                          <ZoomIn className="h-4 w-4 flex-shrink-0" />
                          <span>Screen Magnifier</span>
                        </Label>
                        <Switch
                          id="screen-magnifier"
                          checked={features.screenMagnifier}
                          onCheckedChange={(checked) => updateFeature('screenMagnifier', checked)}
                          className="flex-shrink-0"
                        />
                      </div>
                      
                      {/* Line Height Control */}
                      <div className="space-y-2 mt-3">
                        <Label htmlFor="line-height" className="text-sm flex items-center gap-2 flex-wrap">
                          <TextQuote className="h-4 w-4 flex-shrink-0" />
                          <span>Line Height: {(features.lineHeight ?? 1.5).toFixed(1)}</span>
                        </Label>
                        <Slider
                          id="line-height"
                          min={1}
                          max={3}
                          step={0.1}
                          value={[typeof features.lineHeight === 'number' ? features.lineHeight : 1.5]}
                          onValueChange={([value]) => updateFeature('lineHeight', value)}
                        />
                      </div>
                      
                      {/* Custom Color Palette */}
                      <div className="space-y-2 mt-3">
                        <Label htmlFor="color-palette" className="text-sm flex items-center gap-2 flex-wrap">
                          <PenTool className="h-4 w-4 flex-shrink-0" />
                          <span>Color Palette</span>
                        </Label>
                        <Select
                          value={features.customColorPalette}
                          onValueChange={(value: any) => updateFeature('customColorPalette', value)}
                        >
                          <SelectTrigger className="w-full" id="color-palette">
                            <SelectValue placeholder="Select palette" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[30vh] overflow-y-auto">
                            {accessibilityPalettes.map(palette => (
                              <SelectItem key={palette.name} value={palette.name}>
                                <div className="flex items-center flex-wrap gap-2">
                                  <div 
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: palette.primary }}
                                  />
                                  <span className="truncate">{palette.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <div className="flex items-center gap-1">
          {safeProfile?.verificationStatus === 'verified' && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => updateFeature('dyslexicFont', !features.dyslexicFont)}
                aria-label="Toggle Dyslexic Font"
                className={features.dyslexicFont ? 'bg-primary/10' : ''}
              >
                <Type className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => updateFeature('highContrast', !features.highContrast)}
                aria-label="Toggle High Contrast"
                className={features.highContrast ? 'bg-primary/10' : ''}
              >
                <Eye className="h-4 w-4" />
              </Button>
              
              {/* Quick access buttons for new features */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => updateFeature('lineFocusMode', !features.lineFocusMode)}
                aria-label="Toggle Line Focus Mode"
                className={features.lineFocusMode ? 'bg-primary/10' : ''}
              >
                <LineChart className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => updateFeature('screenMagnifier', !features.screenMagnifier)}
                aria-label="Toggle Screen Magnifier"
                className={features.screenMagnifier ? 'bg-primary/10' : ''}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => updateFeature('darkMode', !features.darkMode)}
            aria-label="Toggle Dark Mode"
          >
            {features.darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>

          {/* Demo UI removed */}
        </div>
      </div>
    </div>
  );
};
