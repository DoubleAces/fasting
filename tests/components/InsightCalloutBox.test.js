/**
 * InsightCalloutBox Component Tests
 * 
 * Feature: 025-entry-details-enhancement
 * Task: T035 - Unit test for InsightCalloutBox component
 * 
 * Tests the molecule component for displaying individual insights with gradient styling.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import InsightCalloutBox from '@/components/molecules/InsightCalloutBox';

describe('InsightCalloutBox - Molecule Component (US2)', () => {
  it('should render with title and description', () => {
    render(
      <InsightCalloutBox
        title="Top 25% Performer"
        description="This fast ranks in your top 25% of all fasts"
        icon="🏆"
      />
    );
    
    expect(screen.getByText('Top 25% Performer')).toBeInTheDocument();
    expect(screen.getByText(/This fast ranks in your top 25%/)).toBeInTheDocument();
    expect(screen.getByText('🏆')).toBeInTheDocument();
  });

  it('should apply gradient styling classes', () => {
    const { container } = render(
      <InsightCalloutBox
        title="Test Insight"
        description="Test description"
      />
    );
    
    const calloutBox = container.firstChild;
    const classes = calloutBox.className;
    
    // Should have gradient background
    expect(classes).toMatch(/bg-gradient|from-|to-/);
    
    // Should have glassmorphic styling
    expect(classes).toMatch(/backdrop-blur|rounded/);
    
    // Should have border
    expect(classes).toMatch(/border/);
  });

  it('should render without icon', () => {
    render(
      <InsightCalloutBox
        title="No Icon Insight"
        description="This insight has no icon"
      />
    );
    
    expect(screen.getByText('No Icon Insight')).toBeInTheDocument();
    expect(screen.getByText('This insight has no icon')).toBeInTheDocument();
  });

  it('should render with custom className', () => {
    const { container } = render(
      <InsightCalloutBox
        title="Custom Class"
        description="Test"
        className="custom-class"
      />
    );
    
    expect(container.firstChild.className).toContain('custom-class');
  });

  it('should display multi-line description', () => {
    const longDescription = 'This is a very long description that spans multiple lines and should be displayed properly with proper text wrapping and spacing.';
    
    render(
      <InsightCalloutBox
        title="Long Description"
        description={longDescription}
      />
    );
    
    expect(screen.getByText(longDescription)).toBeInTheDocument();
  });

  it('should apply different variant styles', () => {
    const { container: container1 } = render(
      <InsightCalloutBox
        title="Success"
        description="Success message"
        variant="success"
      />
    );
    
    const { container: container2 } = render(
      <InsightCalloutBox
        title="Info"
        description="Info message"
        variant="info"
      />
    );
    
    // Different variants should have different styling
    expect(container1.firstChild.className).not.toBe(container2.firstChild.className);
  });

  it('should have proper spacing between title and description', () => {
    const { container } = render(
      <InsightCalloutBox
        title="Spacing Test"
        description="Check spacing"
      />
    );
    
    // Check the inner div that has the gap-3 class
    const innerDiv = container.querySelector('.flex.items-start.gap-3');
    expect(innerDiv).toBeInTheDocument();
  });

  it('should render with emoji icon properly', () => {
    render(
      <InsightCalloutBox
        title="Emoji Test"
        description="Test with emoji"
        icon="🎯"
      />
    );
    
    const emoji = screen.getByText('🎯');
    expect(emoji).toBeInTheDocument();
  });
});
