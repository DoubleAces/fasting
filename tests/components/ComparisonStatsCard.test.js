/**
 * ComparisonStatsCard Component Tests
 * 
 * Feature: 025-entry-details-enhancement
 * Task: T056 - Unit test for ComparisonStatsCard molecule
 * 
 * Tests comparison display of current entry vs This Month, Last Month, All Time averages.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import ComparisonStatsCard from '@/components/molecules/ComparisonStatsCard';

describe('ComparisonStatsCard - Molecule Component (US3)', () => {
  const mockComparison = {
    period: 'This Month',
    average: 900, // 15h 0m
    current: 960, // 16h 0m
    difference: 60, // +1h
    percentDifference: 6.67,
    count: 5
  };

  it('should render with period title', () => {
    render(<ComparisonStatsCard comparison={mockComparison} />);
    
    expect(screen.getByText('This Month')).toBeInTheDocument();
  });

  it('should display average duration formatted', () => {
    render(<ComparisonStatsCard comparison={mockComparison} />);
    
    expect(screen.getByText(/15h 0m/i)).toBeInTheDocument();
  });

  it('should display current duration formatted', () => {
    render(<ComparisonStatsCard comparison={mockComparison} />);
    
    expect(screen.getByText(/16h 0m/i)).toBeInTheDocument();
  });

  it('should show positive difference with + sign', () => {
    render(<ComparisonStatsCard comparison={mockComparison} />);
    
    expect(screen.getByText(/\+1h/i)).toBeInTheDocument();
  });

  it('should show negative difference with - sign', () => {
    const negativeComparison = {
      ...mockComparison,
      current: 840,
      difference: -60,
      percentDifference: -6.67
    };
    
    render(<ComparisonStatsCard comparison={negativeComparison} />);
    
    expect(screen.getByText(/-1h/i)).toBeInTheDocument();
  });

  it('should display percentage difference', () => {
    render(<ComparisonStatsCard comparison={mockComparison} />);
    
    expect(screen.getByText(/7%/i)).toBeInTheDocument();
  });

  it('should show entry count', () => {
    render(<ComparisonStatsCard comparison={mockComparison} />);
    
    expect(screen.getByText(/5 entries/i)).toBeInTheDocument();
  });

  it('should apply success variant for positive difference', () => {
    const { container } = render(<ComparisonStatsCard comparison={mockComparison} />);
    
    const card = container.firstChild;
    expect(card.className).toMatch(/green|success|emerald/i);
  });

  it('should apply warning variant for negative difference', () => {
    const negativeComparison = {
      ...mockComparison,
      difference: -60,
      percentDifference: -6.67
    };
    
    const { container } = render(<ComparisonStatsCard comparison={negativeComparison} />);
    
    const card = container.firstChild;
    expect(card.className).toMatch(/amber|orange|warning/i);
  });

  it('should apply info variant for neutral (within 5%)', () => {
    const neutralComparison = {
      ...mockComparison,
      difference: 30,
      percentDifference: 3.33
    };
    
    const { container } = render(<ComparisonStatsCard comparison={neutralComparison} />);
    
    const card = container.firstChild;
    expect(card.className).toMatch(/blue|purple|indigo|info/i);
  });

  it('should have glassmorphic styling', () => {
    const { container } = render(<ComparisonStatsCard comparison={mockComparison} />);
    
    const card = container.firstChild;
    expect(card.className).toMatch(/backdrop-blur/i);
  });

  it('should have gradient background', () => {
    const { container } = render(<ComparisonStatsCard comparison={mockComparison} />);
    
    const card = container.firstChild;
    expect(card.className).toMatch(/bg-gradient/i);
  });

  it('should display trend indicator icon', () => {
    render(<ComparisonStatsCard comparison={mockComparison} />);
    
    // Should show up arrow for positive
    const content = screen.getByText(/This Month/i).closest('div').textContent;
    expect(content).toMatch(/↑|▲|⬆/);
  });

  it('should handle zero entries gracefully', () => {
    const noDataComparison = {
      period: 'Last Month',
      average: null,
      current: 960,
      difference: null,
      percentDifference: null,
      count: 0
    };
    
    render(<ComparisonStatsCard comparison={noDataComparison} />);
    
    expect(screen.getByText(/no data|not available/i)).toBeInTheDocument();
  });
});
