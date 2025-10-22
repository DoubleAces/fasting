/**
 * EmptyDashboard Component Tests
 * 
 * Tests for the empty dashboard welcome screen with "Coming Soon" placeholder cards.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from '@jest/globals';
import EmptyDashboard from '@/components/admin/EmptyDashboard';

describe('EmptyDashboard Component', () => {
  it('should render welcome message', () => {
    render(<EmptyDashboard />);
    
    expect(screen.getByText(/welcome/i)).toBeInTheDocument();
  });
  
  it('should display admin dashboard title', () => {
    render(<EmptyDashboard />);
    
    expect(screen.getByRole('heading', { name: /admin dashboard/i })).toBeInTheDocument();
  });
  
  it('should show "Coming Soon" placeholder cards', () => {
    render(<EmptyDashboard />);
    
    const comingSoonElements = screen.getAllByText(/coming soon/i);
    expect(comingSoonElements.length).toBeGreaterThan(0);
  });
  
  it('should render multiple feature placeholder cards', () => {
    render(<EmptyDashboard />);
    
    // Should have at least 3 placeholder cards
    const cards = screen.getAllByText(/coming soon/i);
    expect(cards.length).toBeGreaterThanOrEqual(3);
  });
  
  it('should have proper grid layout for cards', () => {
    const { container } = render(<EmptyDashboard />);
    
    // Check for grid classes
    const gridContainer = container.querySelector('[class*="grid"]');
    expect(gridContainer).toBeInTheDocument();
  });
  
  it('should display helpful message about upcoming features', () => {
    render(<EmptyDashboard />);
    
    expect(screen.getByText(/features will be added/i)).toBeInTheDocument();
  });
});
