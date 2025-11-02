/**
 * EntryNavigationBar Component Tests
 * 
 * Feature: 025-entry-details-enhancement
 * Task: T073 - Unit test for EntryNavigationBar molecule
 * 
 * Tests navigation bar with previous/next buttons, entry position, and date display.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import EntryNavigationBar from '@/components/molecules/EntryNavigationBar';

describe('EntryNavigationBar - Molecule Component (US4)', () => {
  const mockNavigation = {
    currentPosition: 3,
    totalEntries: 8,
    previousEntry: { id: '507f1f77bcf86cd799439011', date: '2025-10-30' },
    nextEntry: { id: '507f1f77bcf86cd799439013', date: '2025-11-01' },
    currentDate: '2025-10-31'
  };

  it('should render entry position badge', () => {
    render(<EntryNavigationBar navigation={mockNavigation} />);
    
    expect(screen.getByText(/entry 3 of 8/i)).toBeInTheDocument();
  });

  it('should display current entry date', () => {
    render(<EntryNavigationBar navigation={mockNavigation} />);
    
    expect(screen.getByText(/oct 31, 2025/i)).toBeInTheDocument();
  });

  it('should render previous entry button when available', () => {
    render(<EntryNavigationBar navigation={mockNavigation} />);
    
    const prevButton = screen.getByRole('link', { name: /previous/i });
    expect(prevButton).toBeInTheDocument();
    expect(prevButton).toHaveAttribute('href', '/entries/507f1f77bcf86cd799439011');
  });

  it('should render next entry button when available', () => {
    render(<EntryNavigationBar navigation={mockNavigation} />);
    
    const nextButton = screen.getByRole('link', { name: /next/i });
    expect(nextButton).toBeInTheDocument();
    expect(nextButton).toHaveAttribute('href', '/entries/507f1f77bcf86cd799439013');
  });

  it('should disable previous button when no previous entry', () => {
    const firstEntryNav = {
      ...mockNavigation,
      currentPosition: 1,
      previousEntry: null
    };
    
    render(<EntryNavigationBar navigation={firstEntryNav} />);
    
    const prevButton = screen.getByRole('button', { name: /previous/i });
    expect(prevButton).toBeDisabled();
  });

  it('should disable next button when no next entry', () => {
    const lastEntryNav = {
      ...mockNavigation,
      currentPosition: 8,
      nextEntry: null
    };
    
    render(<EntryNavigationBar navigation={lastEntryNav} />);
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeDisabled();
  });

  it('should have sticky positioning', () => {
    const { container } = render(<EntryNavigationBar navigation={mockNavigation} />);
    
    const nav = container.firstChild;
    expect(nav.className).toMatch(/sticky/);
  });

  it('should have glassmorphic styling', () => {
    const { container } = render(<EntryNavigationBar navigation={mockNavigation} />);
    
    const nav = container.firstChild;
    expect(nav.className).toMatch(/backdrop-blur/);
  });

  it('should display navigation arrows', () => {
    const { container } = render(<EntryNavigationBar navigation={mockNavigation} />);
    
    // Check for arrow SVGs or icons
    const arrows = container.querySelectorAll('svg');
    expect(arrows.length).toBeGreaterThan(0);
  });

  it('should have proper spacing between elements', () => {
    const { container } = render(<EntryNavigationBar navigation={mockNavigation} />);

    // Check the inner container div for gap spacing
    const innerContainer = container.querySelector('.flex');
    expect(innerContainer.className).toMatch(/gap/);
  });

  it('should be responsive on mobile', () => {
    const { container } = render(<EntryNavigationBar navigation={mockNavigation} />);

    // Check the inner container div for responsive classes
    const innerContainer = container.querySelector('.flex');
    expect(innerContainer.className).toMatch(/flex-col/);
    expect(innerContainer.className).toMatch(/sm:flex-row/);
  });  it('should handle single entry gracefully', () => {
    const singleEntryNav = {
      currentPosition: 1,
      totalEntries: 1,
      previousEntry: null,
      nextEntry: null,
      currentDate: '2025-10-31'
    };
    
    render(<EntryNavigationBar navigation={singleEntryNav} />);
    
    expect(screen.getByText(/entry 1 of 1/i)).toBeInTheDocument();
    
    const prevButton = screen.getByRole('button', { name: /previous/i });
    const nextButton = screen.getByRole('button', { name: /next/i });
    
    expect(prevButton).toBeDisabled();
    expect(nextButton).toBeDisabled();
  });
});
