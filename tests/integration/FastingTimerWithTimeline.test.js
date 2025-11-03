/**
 * Integration tests for FastingTimer with BiologicalStagesTimeline
 * Tests the interaction between timer updates and timeline progress display
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FastingTimer from '@/components/organisms/FastingTimer';
import { FastingGoalProvider } from '@/contexts/FastingGoalContext';

// Mock the useFastingTimer hook to control elapsed time
jest.mock('@/hooks/useFastingTimer', () => ({
  useFastingTimer: jest.fn()
}));

// Mock the useFastingGoal hook
jest.mock('@/contexts/FastingGoalContext', () => ({
  ...jest.requireActual('@/contexts/FastingGoalContext'),
  useFastingGoal: jest.fn(() => ({
    goalMinutes: 960, // 16 hours
    setGoalMinutes: jest.fn(),
    loading: false
  }))
}));

const { useFastingTimer } = require('@/hooks/useFastingTimer');

describe('FastingTimer with BiologicalStagesTimeline Integration', () => {
  const mockLastMealTime = new Date('2025-11-03T08:00:00Z');
  const mockDate = new Date('2025-11-03T22:00:00Z'); // 14 hours later

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Story 2: Progress Updates', () => {
    it('should display progress bar that updates when elapsed time changes', async () => {
      // Initial state: 14 hours elapsed (2 hours into 12-16hr stage = 50%)
      const initialElapsedMs = 14 * 60 * 60 * 1000;
      useFastingTimer.mockReturnValue({
        elapsedMs: initialElapsedMs,
        formattedTime: '14:00:00',
        currentMilestone: { hours: 14, title: '14 hours' }
      });

      const { rerender } = render(
        <FastingGoalProvider>
          <FastingTimer 
            lastMealTime={mockLastMealTime} 
            date={mockDate}
            isActive={true}
          />
        </FastingGoalProvider>
      );

      // Verify initial progress bar exists
      const progressBars = screen.getAllByRole('progressbar');
      expect(progressBars.length).toBeGreaterThan(0);
      
      // Find the progress bar in Early Ketosis stage (should be visible)
      const earlyKetosisCard = screen.getByText('Early Ketosis').closest('article');
      expect(earlyKetosisCard).toBeInTheDocument();
      
      const earlyKetosisProgressBar = earlyKetosisCard.querySelector('[role="progressbar"]');
      expect(earlyKetosisProgressBar).toBeInTheDocument();
      
      // Verify initial progress is ~50%
      const initialProgress = parseInt(earlyKetosisProgressBar.getAttribute('aria-valuenow'));
      expect(initialProgress).toBeGreaterThan(45);
      expect(initialProgress).toBeLessThan(55);

      // Update elapsed time to 14.5 hours (2.5 hours into stage = 62.5%)
      const updatedElapsedMs = 14.5 * 60 * 60 * 1000;
      useFastingTimer.mockReturnValue({
        elapsedMs: updatedElapsedMs,
        formattedTime: '14:30:00',
        currentMilestone: { hours: 14, title: '14 hours' }
      });

      rerender(
        <FastingGoalProvider>
          <FastingTimer 
            lastMealTime={mockLastMealTime} 
            date={new Date('2025-11-03T22:30:00Z')}
            isActive={true}
          />
        </FastingGoalProvider>
      );

      // Verify progress bar updated to ~62.5%
      await waitFor(() => {
        const updatedCard = screen.getByText('Early Ketosis').closest('article');
        const updatedProgressBar = updatedCard.querySelector('[role="progressbar"]');
        const updatedProgress = parseInt(updatedProgressBar.getAttribute('aria-valuenow'));
        expect(updatedProgress).toBeGreaterThan(60);
        expect(updatedProgress).toBeLessThan(65);
      });
    });

    it('should calculate progress percentage within 1% accuracy', () => {
      // Test various elapsed times and verify progress calculation accuracy
      const testCases = [
        { hours: 12, stageName: 'Early Ketosis', expectedProgress: 0 },
        { hours: 13, stageName: 'Early Ketosis', expectedProgress: 25 },
        { hours: 14, stageName: 'Early Ketosis', expectedProgress: 50 },
        { hours: 15, stageName: 'Early Ketosis', expectedProgress: 75 },
        { hours: 16, stageName: 'Full Ketosis', expectedProgress: 0 },
      ];

      testCases.forEach(({ hours, stageName, expectedProgress }) => {
        const elapsedMs = hours * 60 * 60 * 1000;
        useFastingTimer.mockReturnValue({
          elapsedMs,
          formattedTime: `${hours}:00:00`,
          currentMilestone: { hours, title: `${hours} hours` }
        });

        const { unmount } = render(
          <FastingGoalProvider>
            <FastingTimer 
              lastMealTime={mockLastMealTime} 
              date={new Date(mockLastMealTime.getTime() + elapsedMs)}
              isActive={true}
            />
          </FastingGoalProvider>
        );

        const stageCard = screen.getByText(stageName).closest('article');
        expect(stageCard).toBeInTheDocument();
        
        const progressBar = stageCard.querySelector('[role="progressbar"]');
        
        if (progressBar) {
          const actualProgress = parseInt(progressBar.getAttribute('aria-valuenow'));
          // Verify within 1% accuracy
          expect(Math.abs(actualProgress - expectedProgress)).toBeLessThanOrEqual(1);
        }

        unmount();
      });
    });

    it('should hide progress bar for non-current stages', () => {
      // 14 hours elapsed - Early Ketosis is current
      const elapsedMs = 14 * 60 * 60 * 1000;
      useFastingTimer.mockReturnValue({
        elapsedMs,
        formattedTime: '14:00:00',
        currentMilestone: { hours: 14, title: '14 hours' }
      });

      render(
        <FastingGoalProvider>
          <FastingTimer 
            lastMealTime={mockLastMealTime} 
            date={mockDate}
            isActive={true}
          />
        </FastingGoalProvider>
      );

      // Verify Early Ketosis (current) has progress bar
      const currentStageCard = screen.getByText('Early Ketosis').closest('article');
      const currentProgressBar = currentStageCard.querySelector('[role="progressbar"]');
      expect(currentProgressBar).toBeInTheDocument();

      // Verify Fed State (completed) does NOT have progress bar
      const completedStageCard = screen.getByText('Fed State').closest('article');
      const completedProgressBar = completedStageCard.querySelector('[role="progressbar"]');
      expect(completedProgressBar).not.toBeInTheDocument();

      // Verify Full Ketosis (upcoming) does NOT have progress bar
      const upcomingStageCard = screen.getByText('Full Ketosis').closest('article');
      const upcomingProgressBar = upcomingStageCard.querySelector('[role="progressbar"]');
      expect(upcomingProgressBar).not.toBeInTheDocument();
    });

    it('should handle stage transitions correctly', () => {
      // Test transition from Early Ketosis (15.9hr) to Full Ketosis (16.1hr)
      
      // Before transition: 15.9 hours (3.9 hours into 12-16hr stage)
      const beforeTransitionMs = 15.9 * 60 * 60 * 1000;
      useFastingTimer.mockReturnValue({
        elapsedMs: beforeTransitionMs,
        formattedTime: '15:54:00',
        currentMilestone: { hours: 15, title: '15 hours' }
      });

      const { rerender } = render(
        <FastingGoalProvider>
          <FastingTimer 
            lastMealTime={mockLastMealTime} 
            date={new Date(mockLastMealTime.getTime() + beforeTransitionMs)}
            isActive={true}
          />
        </FastingGoalProvider>
      );

      // Verify Early Ketosis is current with high progress
      let earlyKetosisCard = screen.getByText('Early Ketosis').closest('article');
      expect(earlyKetosisCard).toHaveClass(/border-2/);
      
      let progressBar = earlyKetosisCard.querySelector('[role="progressbar"]');
      let progress = parseInt(progressBar.getAttribute('aria-valuenow'));
      expect(progress).toBeGreaterThan(95);

      // After transition: 16.1 hours (just entered Full Ketosis)
      const afterTransitionMs = 16.1 * 60 * 60 * 1000;
      useFastingTimer.mockReturnValue({
        elapsedMs: afterTransitionMs,
        formattedTime: '16:06:00',
        currentMilestone: { hours: 16, title: '16 hours' }
      });

      rerender(
        <FastingGoalProvider>
          <FastingTimer 
            lastMealTime={mockLastMealTime} 
            date={new Date(mockLastMealTime.getTime() + afterTransitionMs)}
            isActive={true}
          />
        </FastingGoalProvider>
      );

      // Verify Full Ketosis is now current with low progress
      const fullKetosisCard = screen.getByText('Full Ketosis').closest('article');
      expect(fullKetosisCard).toHaveClass(/border-2/);
      
      progressBar = fullKetosisCard.querySelector('[role="progressbar"]');
      progress = parseInt(progressBar.getAttribute('aria-valuenow'));
      expect(progress).toBeLessThan(5);

      // Verify Early Ketosis is no longer highlighted
      earlyKetosisCard = screen.getByText('Early Ketosis').closest('article');
      expect(earlyKetosisCard).not.toHaveClass(/border-2/);
    });
  });
});
