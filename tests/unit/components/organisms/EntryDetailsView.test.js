/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import EntryDetailsView from '@/components/organisms/EntryDetailsView';

describe('EntryDetailsView Component', () => {
  const mockEntry = {
    _id: '673abc123def456789012345',
    date: new Date('2025-10-20'),
    firstMealTime: '12:30',
    lastMealTime: '20:00',
    fastingDuration: 990, // 16h 30m
    hoursOfSleep: 7.5,
    morningWeight: 75.2,
    hungerLevel: 'Medium',
    energyLevel: 'High Energy',
    wellBeing: 'Good',
    foodNotes: 'Had salad for lunch, pasta for dinner',
    createdAt: new Date('2025-10-20T08:15:00.000Z'),
    updatedAt: new Date('2025-10-20T08:15:00.000Z'),
  };

  const mockSettings = {
    timeFormat: '12h',
    measurementSystem: 'metric',
  };

  describe('All Sections Render', () => {
    it('renders fasting duration section', () => {
      render(<EntryDetailsView entry={mockEntry} settings={mockSettings} />);
      
      expect(screen.getByText(/16h 30m/i)).toBeInTheDocument();
    });

    it('renders timeline section', () => {
      render(<EntryDetailsView entry={mockEntry} settings={mockSettings} />);
      
      expect(screen.getByLabelText(/fasting timeline/i)).toBeInTheDocument();
    });

    it('renders meal times section', () => {
      render(<EntryDetailsView entry={mockEntry} settings={mockSettings} />);
      
      expect(screen.getByText(/12:30/)).toBeInTheDocument();
      expect(screen.getByText(/20:00/)).toBeInTheDocument();
    });

    it('renders health metrics section', () => {
      render(<EntryDetailsView entry={mockEntry} settings={mockSettings} />);
      
      expect(screen.getByText(/7.5/)).toBeInTheDocument();
      expect(screen.getByText(/75.2/)).toBeInTheDocument();
    });

    it('renders mood ratings section', () => {
      render(<EntryDetailsView entry={mockEntry} settings={mockSettings} />);
      
      expect(screen.getByText(/Medium/)).toBeInTheDocument();
      expect(screen.getByText(/High Energy/)).toBeInTheDocument();
      expect(screen.getByText(/Good/)).toBeInTheDocument();
    });

    it('renders food notes section', () => {
      render(<EntryDetailsView entry={mockEntry} settings={mockSettings} />);
      
      expect(screen.getByText(/Had salad for lunch/)).toBeInTheDocument();
    });

    it('renders metadata section', () => {
      render(<EntryDetailsView entry={mockEntry} settings={mockSettings} />);
      
      expect(screen.getByText(/created/i)).toBeInTheDocument();
    });
  });

  describe('Null Data Handling', () => {
    it('shows "not logged" for missing weight', () => {
      const entryNoWeight = { ...mockEntry, morningWeight: null };
      
      render(<EntryDetailsView entry={entryNoWeight} settings={mockSettings} />);
      
      expect(screen.getByText(/not logged/i)).toBeInTheDocument();
    });

    it('shows "not logged" for missing food notes', () => {
      const entryNoNotes = { ...mockEntry, foodNotes: null };
      
      render(<EntryDetailsView entry={entryNoNotes} settings={mockSettings} />);
      
      expect(screen.getByText(/no food notes/i)).toBeInTheDocument();
    });

    it('shows "N/A" for null fasting duration', () => {
      const entryNoDuration = { ...mockEntry, fastingDuration: null };
      
      render(<EntryDetailsView entry={entryNoDuration} settings={mockSettings} />);
      
      expect(screen.getByText(/N\/A/i)).toBeInTheDocument();
    });
  });

  describe('Responsive Layout', () => {
    it('applies mobile layout classes', () => {
      const { container } = render(
        <EntryDetailsView entry={mockEntry} settings={mockSettings} />
      );
      
      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('flex-col');
    });

    it('stacks sections vertically on mobile', () => {
      const { container } = render(
        <EntryDetailsView entry={mockEntry} settings={mockSettings} />
      );
      
      const sections = container.querySelectorAll('[class*="section"]');
      expect(sections.length).toBeGreaterThan(0);
    });
  });

  describe('Extended Fasts', () => {
    it('highlights extended fast (>24h)', () => {
      const extendedEntry = { ...mockEntry, fastingDuration: 1500 }; // 25 hours
      
      render(<EntryDetailsView entry={extendedEntry} settings={mockSettings} />);
      
      expect(screen.getByText(/extended fast/i)).toBeInTheDocument();
    });
  });

  describe('Measurement Units', () => {
    it('displays weight in kg for metric system', () => {
      render(<EntryDetailsView entry={mockEntry} settings={mockSettings} />);
      
      expect(screen.getByText(/kg/i)).toBeInTheDocument();
    });

    it('displays weight in lbs for imperial system', () => {
      const imperialSettings = { ...mockSettings, measurementSystem: 'imperial' };
      
      render(<EntryDetailsView entry={mockEntry} settings={imperialSettings} />);
      
      expect(screen.getByText(/lbs/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('uses semantic HTML structure', () => {
      const { container } = render(
        <EntryDetailsView entry={mockEntry} settings={mockSettings} />
      );
      
      expect(container.querySelector('article')).toBeInTheDocument();
    });

    it('has proper heading hierarchy', () => {
      const { container } = render(
        <EntryDetailsView entry={mockEntry} settings={mockSettings} />
      );
      
      const headings = container.querySelectorAll('h1, h2, h3');
      expect(headings.length).toBeGreaterThan(0);
    });
  });
});
