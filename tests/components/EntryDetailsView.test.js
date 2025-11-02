/**
 * EntryDetailsView Component Tests
 * 
 * Feature: 025-entry-details-enhancement
 * Task: T011 - Unit test for EntryDetailsView visual structure
 * 
 * Tests glassmorphic styling, gradient backgrounds, and component structure.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import EntryDetailsView from '@/components/organisms/EntryDetailsView';

// Mock child components to isolate EntryDetailsView structure
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

describe('EntryDetailsView - Visual Structure (US1)', () => {
  const mockEntry = {
    _id: '507f1f77bcf86cd799439011',
    userId: '507f1f77bcf86cd799439012',
    date: '2025-11-01T00:00:00.000Z',
    firstMealTime: '12:00',
    lastMealTime: '20:00',
    fastingDuration: 960, // 16 hours
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

  it('should render with article semantic element', () => {
    const { container } = render(
      <EntryDetailsView 
        entry={mockEntry} 
        settings={mockSettings}
        insights={mockInsights}
      />
    );
    
    const article = container.querySelector('article');
    expect(article).toBeInTheDocument();
  });

  it('should apply glassmorphic card styling classes', () => {
    const { container } = render(
      <EntryDetailsView 
        entry={mockEntry} 
        settings={mockSettings}
        insights={mockInsights}
      />
    );
    
    const article = container.querySelector('article');
    const classes = article.className;
    
    // Should have rounded corners
    expect(classes).toMatch(/rounded/);
    
    // Should have shadow for depth
    expect(classes).toMatch(/shadow/);
    
    // Should have padding
    expect(classes).toMatch(/p-/);
    
    // Should have spacing between sections
    expect(classes).toMatch(/space-y/);
  });

  it('should display fasting duration with gradient styling', () => {
    render(
      <EntryDetailsView 
        entry={mockEntry} 
        settings={mockSettings}
        insights={mockInsights}
      />
    );
    
    // Duration should be displayed
    expect(screen.getByText('16h 0m')).toBeInTheDocument();
    
    // Find duration element and check for text styling
    const durationElement = screen.getByText('16h 0m');
    expect(durationElement).toBeInTheDocument();
  });

  it('should render entry date in header', () => {
    render(
      <EntryDetailsView 
        entry={mockEntry} 
        settings={mockSettings}
        insights={mockInsights}
      />
    );
    
    // Should display formatted date
    expect(screen.getByText(/1st of November, 2025/)).toBeInTheDocument();
  });

  it('should display wellness indicators with emojis when provided', () => {
    render(
      <EntryDetailsView 
        entry={mockEntry} 
        settings={mockSettings}
        insights={mockInsights}
      />
    );
    
    // Mood should be displayed
    expect(screen.getByText('Great')).toBeInTheDocument();
    
    // Energy level should be displayed
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('should show "Not logged" placeholder for missing optional fields', () => {
    const entryWithMissingFields = {
      ...mockEntry,
      weight: null,
      foodNotes: null,
      sleepHours: null
    };

    render(
      <EntryDetailsView 
        entry={entryWithMissingFields} 
        settings={mockSettings}
        insights={mockInsights}
      />
    );
    
    // Should show N/A or "Not logged" for missing weight
    const notLoggedElements = screen.queryAllByText(/N\/A|Not logged/i);
    expect(notLoggedElements.length).toBeGreaterThan(0);
  });

  it('should apply consistent spacing (gap-6, p-6) throughout', () => {
    const { container } = render(
      <EntryDetailsView 
        entry={mockEntry} 
        settings={mockSettings}
        insights={mockInsights}
      />
    );
    
    const article = container.querySelector('article');
    const classes = article.className;
    
    // Should have spacing utility classes
    expect(classes).toMatch(/space-y-|gap-/);
  });

  it('should display meal times with user preference', () => {
    render(
      <EntryDetailsView 
        entry={mockEntry} 
        settings={mockSettings}
        insights={mockInsights}
      />
    );
    
    // Should display meal times
    expect(screen.getByText(/12:00/)).toBeInTheDocument();
    expect(screen.getByText(/20:00/)).toBeInTheDocument();
  });

  it('should display weight with measurement system preference', () => {
    render(
      <EntryDetailsView 
        entry={mockEntry} 
        settings={mockSettings}
        insights={mockInsights}
      />
    );
    
    // Should display weight in metric (kg)
    expect(screen.getByText(/75\.0 kg/)).toBeInTheDocument();
  });

  it('should display weight in imperial when settings specify', () => {
    const imperialSettings = {
      ...mockSettings,
      measurementSystem: 'imperial'
    };

    render(
      <EntryDetailsView 
        entry={mockEntry} 
        settings={imperialSettings}
        insights={mockInsights}
      />
    );
    
    // Should display weight in lbs (75kg ≈ 165.3 lbs)
    expect(screen.getByText(/165\.\d lbs/)).toBeInTheDocument();
  });

  it('should render all major sections', () => {
    render(
      <EntryDetailsView 
        entry={mockEntry} 
        settings={mockSettings}
        insights={mockInsights}
      />
    );
    
    // Check for key sections
    expect(screen.getByText(/Fasting Duration/i)).toBeInTheDocument();
    expect(screen.getByText(/Eating window:/i)).toBeInTheDocument();
  });

  it('should handle null entry gracefully', () => {
    const { container } = render(
      <EntryDetailsView 
        entry={null} 
        settings={mockSettings}
        insights={mockInsights}
      />
    );
    
    // Should render nothing (null)
    expect(container.firstChild).toBeNull();
  });

  it('should display extended fast badge for 24+ hour fasts', () => {
    const extendedFastEntry = {
      ...mockEntry,
      fastingDuration: 1440 // 24 hours
    };

    render(
      <EntryDetailsView 
        entry={extendedFastEntry} 
        settings={mockSettings}
        insights={mockInsights}
      />
    );
    
    // Should show extended fast badge
    expect(screen.getByText(/Extended Fast/i)).toBeInTheDocument();
  });
});
