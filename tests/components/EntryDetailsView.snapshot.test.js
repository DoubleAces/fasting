/**
 * EntryDetailsView Snapshot Tests
 * 
 * Feature: 025-entry-details-enhancement
 * Task: T012 - Snapshot test for glassmorphic styling
 * 
 * Ensures visual consistency of glassmorphic design system.
 */

import React from 'react';
import { render } from '@testing-library/react';
import EntryDetailsView from '@/components/organisms/EntryDetailsView';

// Mock child components for consistent snapshots
jest.mock('@/components/atoms/Badge', () => {
  return function Badge({ children, variant }) {
    return <span data-testid="badge" data-variant={variant}>{children}</span>;
  };
});

jest.mock('@/components/atoms/TimeDisplay', () => {
  return function TimeDisplay({ time }) {
    return <span data-testid="time-display">{time}</span>;
  };
});

jest.mock('@/components/molecules/FastingTimeline', () => {
  return function FastingTimeline() {
    return <div data-testid="fasting-timeline">Timeline</div>;
  };
});

jest.mock('@/components/molecules/EntryMetadata', () => {
  return function EntryMetadata() {
    return <div data-testid="entry-metadata">Metadata</div>;
  };
});

jest.mock('@/components/organisms/EntryActions', () => {
  return function EntryActions() {
    return <div data-testid="entry-actions">Actions</div>;
  };
});

jest.mock('@/components/organisms/EntryInsights', () => {
  return function EntryInsights() {
    return <div data-testid="entry-insights">Insights</div>;
  };
});

describe('EntryDetailsView - Glassmorphic Styling Snapshots (US1)', () => {
  const mockEntry = {
    _id: '507f1f77bcf86cd799439011',
    userId: '507f1f77bcf86cd799439012',
    date: '2025-11-01T00:00:00.000Z',
    firstMealTime: '12:00',
    lastMealTime: '20:00',
    fastingDuration: 960,
    weight: 75,
    mood: 'Great',
    energyLevel: 'High',
    physicalActivity: 'Moderate',
    sleepQuality: 'Good',
    sleepHours: 8,
    foodNotes: 'Had a healthy salad for lunch',
    createdAt: '2025-11-01T08:00:00.000Z',
    updatedAt: '2025-11-01T08:00:00.000Z'
  };

  const mockSettings = {
    timeFormat: '24h',
    measurementSystem: 'metric'
  };

  const mockInsights = {
    averageDuration: 900,
    longestFast: 1200,
    totalEntries: 30
  };

  it('should match snapshot with standard entry', () => {
    const { container } = render(
      <EntryDetailsView 
        entry={mockEntry} 
        settings={mockSettings}
        insights={mockInsights}
      />
    );
    
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should match snapshot with extended fast (24+ hours)', () => {
    const extendedFastEntry = {
      ...mockEntry,
      fastingDuration: 1440
    };

    const { container } = render(
      <EntryDetailsView 
        entry={extendedFastEntry} 
        settings={mockSettings}
        insights={mockInsights}
      />
    );
    
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should match snapshot with minimal data (optional fields null)', () => {
    const minimalEntry = {
      ...mockEntry,
      weight: null,
      foodNotes: null,
      sleepHours: null,
      sleepQuality: null,
      physicalActivity: null
    };

    const { container } = render(
      <EntryDetailsView 
        entry={minimalEntry} 
        settings={mockSettings}
        insights={mockInsights}
      />
    );
    
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should match snapshot with imperial measurements', () => {
    const imperialSettings = {
      ...mockSettings,
      measurementSystem: 'imperial'
    };

    const { container } = render(
      <EntryDetailsView 
        entry={mockEntry} 
        settings={imperialSettings}
        insights={mockInsights}
      />
    );
    
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should match snapshot with 12-hour time format', () => {
    const twelveHourSettings = {
      ...mockSettings,
      timeFormat: '12h'
    };

    const { container } = render(
      <EntryDetailsView 
        entry={mockEntry} 
        settings={twelveHourSettings}
        insights={mockInsights}
      />
    );
    
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should match snapshot with long food notes', () => {
    const longNotesEntry = {
      ...mockEntry,
      foodNotes: 'This is a very long food note that exceeds 300 characters. '.repeat(10)
    };

    const { container } = render(
      <EntryDetailsView 
        entry={longNotesEntry} 
        settings={mockSettings}
        insights={mockInsights}
      />
    );
    
    expect(container.firstChild).toMatchSnapshot();
  });
});
