/**
 * Utility functions for enhanced accessibility features
 */

import { useEffect, useState } from 'react';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { accessibilityPalettes, applyColorPalette } from '@/lib/color-utils';

// Types
type SpeechCommand = {
  command: string;
  action: () => void;
  feedback?: string;
};

/**
 * Hook to implement text highlighting functionality
 * @param selector CSS selector for elements that should be highlightable
 */


/**
 * Hook to implement line focus mode
 */
export function useLineFocusMode() {
  const { features } = useAccessibility();

  useEffect(() => {
    // No additional setup needed as this is handled by CSS
  }, [features.lineFocusMode]);
}

/**
 * Hook to implement screen magnifier
 */
export function useScreenMagnifier() {
  const { features } = useAccessibility();

  useEffect(() => {
    if (!features.screenMagnifier) return;
    
    // Create magnifier elements if they don't exist
    let magnifier = document.querySelector('.screen-magnifier');
    let magnifierContent = document.querySelector('.screen-magnifier-content');
    
    if (!magnifier) {
      magnifier = document.createElement('div');
      magnifier.className = 'screen-magnifier';
      document.body.appendChild(magnifier);
      
      magnifierContent = document.createElement('div');
      magnifierContent.className = 'screen-magnifier-content';
      magnifier.appendChild(magnifierContent);
    }

    // Function to update magnifier position and content
    const updateMagnifier = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      
      // Position the magnifier at the mouse coordinates
      (magnifier as HTMLElement).style.left = `${x}px`;
      (magnifier as HTMLElement).style.top = `${y}px`;
      
      // Get elements at the current position
      const target = document.elementFromPoint(x, y);
      if (!target || target.classList.contains('screen-magnifier')) return;
      
      // Clone and style the content under the magnifier
      const rect = target.getBoundingClientRect();
      const offsetX = x - rect.left;
      const offsetY = y - rect.top;
      
      (magnifierContent as HTMLElement).style.backgroundImage = `url(${document.documentElement.outerHTML})`;
      (magnifierContent as HTMLElement).style.backgroundPosition = `-${x - offsetX}px -${y - offsetY}px`;
    };

    // Add mouse move event listener
    document.addEventListener('mousemove', updateMagnifier);

    return () => {
      // Clean up
      document.removeEventListener('mousemove', updateMagnifier);
      if (magnifier && magnifier.parentNode) {
        magnifier.parentNode.removeChild(magnifier);
      }
    };
  }, [features.screenMagnifier]);
}

/**
 * Hook to implement voice commands
 */

/**
 * Hook to ensure keyboard navigation works correctly
 */
/**
 * Hook for using custom color palettes
 */
export function useColorPalette() {
  const { features } = useAccessibility();
  const [currentPalette, setCurrentPalette] = useState(features.customColorPalette);
  
  useEffect(() => {
    // Only apply custom palette when not using a color blind theme
    if (features.colorTheme === 'default') {
      const selectedPalette = accessibilityPalettes.find(p => p.name === features.customColorPalette);
      
      if (selectedPalette) {
        applyColorPalette(selectedPalette);
        setCurrentPalette(features.customColorPalette);
        
        // Add a subtle indication that a custom palette is active
        const paletteIndicator = document.getElementById('palette-indicator') || 
          document.createElement('div');
        
        if (!document.getElementById('palette-indicator')) {
          paletteIndicator.id = 'palette-indicator';
          paletteIndicator.style.position = 'fixed';
          paletteIndicator.style.bottom = '0';
          paletteIndicator.style.left = '0';
          paletteIndicator.style.width = '100%';
          paletteIndicator.style.height = '3px';
          paletteIndicator.style.background = selectedPalette.primary;
          paletteIndicator.style.zIndex = '9999';
          document.body.appendChild(paletteIndicator);
        } else {
          paletteIndicator.style.background = selectedPalette.primary;
        }
      }
    } else {
      // Remove palette indicator if using color blind theme
      const indicator = document.getElementById('palette-indicator');
      if (indicator) indicator.remove();
    }
    
    return () => {
      if (features.colorTheme !== 'default') {
        const indicator = document.getElementById('palette-indicator');
        if (indicator) indicator.remove();
      }
    };
  }, [features.customColorPalette, features.colorTheme]);
  
  return currentPalette;
}

export function useKeyboardNavigation(
  selector: string = '.quiz-option, button, input, select, textarea, [tabindex="0"]'
) {
  const { features } = useAccessibility();

  useEffect(() => {
    // Mark all focusable elements
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      el.setAttribute('tabindex', '0');
    });

    // Handle keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        // Add a visual focus class in addition to the browser's focus
        const focusedElement = document.activeElement;
        if (focusedElement) {
          focusedElement.classList.add('keyboard-focus');
        }
      }
    };

    // Handle focus change
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      target.classList.add('keyboard-focus');
    };

    const handleFocusOut = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      target.classList.remove('keyboard-focus');
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      // Clean up
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, [features.keyboardOnly, selector]);
}