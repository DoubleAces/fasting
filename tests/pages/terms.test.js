/**
 * Terms Page Tests
 * 
 * Tests for /terms page Server Component
 * Testing the actual implementation (not mocked)
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TermsPage, { metadata } from '@/app/terms/page';

describe('Terms Page', () => {
  it('should render the terms page with heading', () => {
    render(<TermsPage />);

    expect(screen.getByRole('heading', { name: /terms and conditions/i, level: 1 })).toBeInTheDocument();
  });

  it('should have correct metadata for SEO', () => {
    expect(metadata).toBeDefined();
    expect(metadata.title).toContain('Terms and Conditions');
    expect(metadata.description).toBeDefined();
    expect(metadata.description.length).toBeGreaterThan(50);
  });

  it('should be indexable by search engines', () => {
    expect(metadata.robots).toBeDefined();
    expect(metadata.robots.index).toBe(true);
    expect(metadata.robots.follow).toBe(true);
  });

  it('should be accessible to unauthenticated users', () => {
    // Server Component doesn't require authentication
    // This test confirms the page can be rendered without auth context
    const { container } = render(<TermsPage />);
    
    expect(container.querySelector('main')).toBeInTheDocument();
    expect(container.querySelector('article')).toBeInTheDocument();
  });

  // Integration tests for full page rendering
  // These verify the TermsContent organism is properly integrated
  it.todo('should render all 10 sections from TermsContent');
  it.todo('should include health disclaimer section with highlighting');
  it.todo('should include contact email');
  it.todo('should have proper semantic HTML structure');
});
