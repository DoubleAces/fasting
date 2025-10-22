/**
 * AdminSidebar Component Tests
 * 
 * Tests for the admin sidebar navigation.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from '@jest/globals';
import AdminSidebar from '@/components/admin/AdminSidebar';

describe('AdminSidebar Component', () => {
  it('should render navigation element', () => {
    render(<AdminSidebar />);
    
    const nav = screen.getByRole('navigation', { name: /admin sidebar/i });
    expect(nav).toBeInTheDocument();
  });
  
  it('should render dashboard navigation link', () => {
    render(<AdminSidebar />);
    
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
  });
  
  it('should have fixed positioning for sidebar', () => {
    const { container } = render(<AdminSidebar />);
    
    const sidebar = container.firstChild;
    // Check for fixed positioning classes
    expect(sidebar).toHaveClass('fixed');
  });
  
  it('should display admin branding or logo', () => {
    render(<AdminSidebar />);
    
    // Check for admin area identifier
    expect(screen.getByText(/admin/i)).toBeInTheDocument();
  });
  
  it('should render with proper width for desktop layout', () => {
    const { container } = render(<AdminSidebar />);
    
    const sidebar = container.firstChild;
    // Sidebar should have w-64 (256px) or similar width class
    expect(sidebar.className).toMatch(/w-/);
  });
});
