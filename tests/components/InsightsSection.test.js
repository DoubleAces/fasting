/**
 * InsightsSection Component Integration Tests
 * 
 * Feature: 025-entry-details-enhancement
 * Task: T037 - Integration test for InsightsSection organism
 * 
 * Tests InsightsSection rendering with insights data and InsightCalloutBox integration.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import InsightsSection from '@/components/organisms/InsightsSection';

describe('InsightsSection Component (US2)', () => {
  const mockInsightsWithData = {
    historicalRanking: {
      rank: 8,
      percentile: 85,
      totalEntries: 50
    },
    weekendVsWeekdayPattern: {
      weekendAvg: 1020,
      weekdayAvg: 900
    },
    deviationFromTypical: {
      typicalDuration: 900,
      deviation: 60,
      percentDeviation: 7
    },
    streakContribution: {
      currentStreak: 7,
      continuesStreak: true
    }
  };

  const mockInsightsInsufficientData = null;

  describe('rendering with sufficient data', () => {
    it('should render InsightsSection with all insights', () => {
      render(<InsightsSection insights={mockInsightsWithData} />);

      // Check section heading
      expect(screen.getByText(/personalized insights/i)).toBeInTheDocument();
    });

    it('should render historical ranking insight', () => {
      render(<InsightsSection insights={mockInsightsWithData} />);

      expect(screen.getByText(/top 15%/i)).toBeInTheDocument();
    });

    it('should render weekend vs weekday pattern insight', () => {
      render(<InsightsSection insights={mockInsightsWithData} />);

      // Should show weekend pattern - use getAllByText since title and description both contain "weekend"
      const weekendText = screen.getAllByText(/weekend/i);
      expect(weekendText.length).toBeGreaterThan(0);
    });

    it('should render deviation from typical insight', () => {
      render(<InsightsSection insights={mockInsightsWithData} />);

      // Should show comparison to typical duration - use getAllByText since title and description both contain "typical"
      const typicalText = screen.getAllByText(/typical/i);
      expect(typicalText.length).toBeGreaterThan(0);
    });

    it('should render streak contribution insight', () => {
      render(<InsightsSection insights={mockInsightsWithData} />);

      // Use getAllByText since title and description both contain "streak"
      const streakText = screen.getAllByText(/streak/i);
      expect(streakText.length).toBeGreaterThan(0);
      expect(screen.getByText(/7-day/i)).toBeInTheDocument();
    });
  });

  describe('rendering with insufficient data', () => {
    it('should show "Log more entries" message when insights are null', () => {
      render(<InsightsSection insights={mockInsightsInsufficientData} />);

      expect(screen.getByText(/log more entries/i)).toBeInTheDocument();
    });

    it('should display helpful message about minimum entries', () => {
      render(<InsightsSection insights={mockInsightsInsufficientData} />);

      expect(screen.getByText(/10 entries/i)).toBeInTheDocument();
    });
  });

  describe('InsightCalloutBox integration', () => {
    it('should render multiple InsightCalloutBox components', () => {
      render(<InsightsSection insights={mockInsightsWithData} />);

      // Check for gradient-styled callout boxes
      const calloutBoxes = screen.getAllByRole('article');
      expect(calloutBoxes.length).toBeGreaterThan(0);
    });

    it('should pass correct props to InsightCalloutBox components', () => {
      const { container } = render(<InsightsSection insights={mockInsightsWithData} />);

      // Check for gradient classes (bg-gradient-to-br, not bg-gradient-to-r)
      const gradientElements = container.querySelectorAll('[class*="bg-gradient-to-br"]');
      expect(gradientElements.length).toBeGreaterThan(0);
    });

    it('should display icons in insight callouts', () => {
      render(<InsightsSection insights={mockInsightsWithData} />);

      // Should contain multiple emojis - check if any emoji icons exist
      const allText = screen.getByRole('region', { name: /insights/i }).textContent;
      expect(allText).toMatch(/[🏆📊📅🔥📈]/);
    });
  });

  describe('error handling', () => {
    it('should handle missing properties gracefully', () => {
      const partialInsights = {
        historicalRanking: {
          percentile: 85,
          totalEntries: 50
        }
        // Other properties missing
      };

      render(<InsightsSection insights={partialInsights} />);

      // Should render available insights without crashing
      expect(screen.getByText(/personalized insights/i)).toBeInTheDocument();
    });

    it('should handle zero values correctly', () => {
      const zeroInsights = {
        historicalRanking: {
          percentile: 0,
          totalEntries: 10
        },
        streakContribution: {
          currentStreak: 0,
          continuesStreak: false
        }
      };

      render(<InsightsSection insights={zeroInsights} />);

      // Should not crash with zero values
      expect(screen.getByText(/personalized insights/i)).toBeInTheDocument();
    });
  });

  describe('visual styling', () => {
    it('should have gradient background styling', () => {
      const { container } = render(<InsightsSection insights={mockInsightsWithData} />);

      const section = container.querySelector('section');
      expect(section).toHaveClass(/bg-gradient/);
    });

    it('should have glassmorphic styling', () => {
      const { container } = render(<InsightsSection insights={mockInsightsWithData} />);

      const section = container.querySelector('section');
      expect(section).toHaveClass(/backdrop-blur/);
    });

    it('should have proper spacing between insights', () => {
      const { container } = render(<InsightsSection insights={mockInsightsWithData} />);

      const section = container.querySelector('section');
      expect(section).toHaveClass(/space-y|gap/);
    });
  });

  describe('accessibility', () => {
    it('should have semantic HTML structure', () => {
      render(<InsightsSection insights={mockInsightsWithData} />);

      const section = screen.getByRole('region', { name: /insights/i });
      expect(section).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      const { container } = render(<InsightsSection insights={mockInsightsWithData} />);

      const heading = container.querySelector('h2, h3');
      expect(heading).toBeInTheDocument();
    });
  });
});
