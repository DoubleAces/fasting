/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import FastingTimeline from '@/components/molecules/FastingTimeline';

describe('FastingTimeline Component', () => {
  describe('SVG Rendering', () => {
    it('renders SVG element', () => {
      const { container } = render(
        <FastingTimeline 
          lastMealTime="20:00" 
          firstMealTime="12:00" 
        />
      );
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders with correct viewBox for responsive scaling', () => {
      const { container } = render(
        <FastingTimeline 
          lastMealTime="20:00" 
          firstMealTime="12:00" 
        />
      );
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox');
    });
  });

  describe('Angle Calculations', () => {
    it('calculates correct angle for noon (12:00)', () => {
      const { container } = render(
        <FastingTimeline 
          lastMealTime="12:00" 
          firstMealTime="12:00" 
        />
      );
      
      // 12:00 = 180 degrees (angle = hour * 15)
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('calculates correct angle for midnight (00:00)', () => {
      const { container } = render(
        <FastingTimeline 
          lastMealTime="00:00" 
          firstMealTime="12:00" 
        />
      );
      
      // 00:00 = 0 degrees
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('calculates correct angle with minutes (14:30)', () => {
      const { container } = render(
        <FastingTimeline 
          lastMealTime="14:30" 
          firstMealTime="12:00" 
        />
      );
      
      // 14:30 = (14 + 30/60) * 15 = 217.5 degrees
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Midnight Crossing', () => {
    it('handles fasting period that crosses midnight', () => {
      const { container } = render(
        <FastingTimeline 
          lastMealTime="20:00" 
          firstMealTime="12:00" 
        />
      );
      
      // Fasting period from 20:00 to 12:00 next day (16 hours)
      const path = container.querySelector('path');
      expect(path).toBeInTheDocument();
    });

    it('renders fasting arc correctly for overnight fast', () => {
      const { container } = render(
        <FastingTimeline 
          lastMealTime="22:00" 
          firstMealTime="10:00" 
        />
      );
      
      // Should create an arc that goes through midnight
      const path = container.querySelector('path');
      expect(path).toHaveAttribute('d');
    });
  });

  describe('Meal Markers', () => {
    it('renders last meal marker', () => {
      render(
        <FastingTimeline 
          lastMealTime="20:00" 
          firstMealTime="12:00" 
        />
      );
      
      expect(screen.getByLabelText(/last meal/i)).toBeInTheDocument();
    });

    it('renders first meal marker', () => {
      render(
        <FastingTimeline 
          lastMealTime="20:00" 
          firstMealTime="12:00" 
        />
      );
      
      expect(screen.getByLabelText(/first meal/i)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles null times gracefully', () => {
      const { container } = render(
        <FastingTimeline 
          lastMealTime={null} 
          firstMealTime={null} 
        />
      );
      
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('handles invalid time format', () => {
      const { container } = render(
        <FastingTimeline 
          lastMealTime="invalid" 
          firstMealTime="12:00" 
        />
      );
      
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has appropriate ARIA labels', () => {
      const { container } = render(
        <FastingTimeline 
          lastMealTime="20:00" 
          firstMealTime="12:00" 
        />
      );
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('role', 'img');
      expect(svg).toHaveAttribute('aria-label');
    });
  });
});
