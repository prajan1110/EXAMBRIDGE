/**
 * Utility functions for color manipulation and accessibility
 */

// Define standard color palettes for accessibility
export type ColorPalette = {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
};

export const accessibilityPalettes: ColorPalette[] = [
  {
    name: 'Default',
    primary: 'hsl(237 83% 28%)',
    secondary: 'hsl(178 60% 45%)',
    accent: 'hsl(25 95% 53%)',
    background: 'hsl(0 0% 100%)',
    foreground: 'hsl(222 47% 11%)',
  },
  {
    name: 'High Contrast',
    primary: 'hsl(0 0% 0%)',
    secondary: 'hsl(0 0% 30%)',
    accent: 'hsl(0 100% 50%)',
    background: 'hsl(0 0% 100%)',
    foreground: 'hsl(0 0% 0%)',
  },
  {
    name: 'Gentle',
    primary: 'hsl(210 70% 50%)',
    secondary: 'hsl(150 50% 50%)',
    accent: 'hsl(30 80% 60%)',
    background: 'hsl(0 0% 98%)',
    foreground: 'hsl(210 50% 30%)',
  },
  {
    name: 'Soft',
    primary: 'hsl(250 50% 60%)',
    secondary: 'hsl(190 60% 60%)',
    accent: 'hsl(40 90% 70%)',
    background: 'hsl(250 30% 98%)',
    foreground: 'hsl(250 30% 30%)',
  },
  {
    name: 'Calm',
    primary: 'hsl(160 50% 40%)',
    secondary: 'hsl(200 60% 50%)',
    accent: 'hsl(350 70% 60%)',
    background: 'hsl(180 20% 97%)',
    foreground: 'hsl(200 30% 20%)',
  },
];

// Apply a color palette to the document
export function applyColorPalette(palette: ColorPalette): void {
  // Convert HSL colors to RGB for CSS variables
  document.documentElement.style.setProperty('--color-primary', palette.primary);
  document.documentElement.style.setProperty('--color-secondary', palette.secondary);
  document.documentElement.style.setProperty('--color-accent', palette.accent);
  document.documentElement.style.setProperty('--color-background', palette.background);
  document.documentElement.style.setProperty('--color-foreground', palette.foreground);
  
  // Save the current palette name to localStorage
  localStorage.setItem('preferredColorPalette', palette.name);
}

// Utility to get luminance from an RGB color
export function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// Calculate contrast ratio between two colors
export function getContrastRatio(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const l1 = getLuminance(rgb1[0], rgb1[1], rgb1[2]);
  const l2 = getLuminance(rgb2[0], rgb2[1], rgb2[2]);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// Check if contrast ratio meets WCAG AA standards
export function isWCAGCompliant(
  foreground: [number, number, number], 
  background: [number, number, number],
  level: 'AA' | 'AAA' = 'AA'
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
}