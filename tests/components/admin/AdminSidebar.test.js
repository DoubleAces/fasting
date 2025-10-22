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
  const mockUser = {
    name: 'Test Admin',
    email: 'test@admin.com',
    picture: 'https://example.com/avatar.jpg'
  };

  it('should render navigation element', () => {
    render(<AdminSidebar user={mockUser} />);
    
    const nav = screen.getByRole('navigation', { name: /admin navigation/i });
    expect(nav).toBeInTheDocument();
  });
  
  it('should render dashboard navigation link', () => {
    render(<AdminSidebar user={mockUser} />);
    
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
  });
  
  it('should have fixed positioning for sidebar', () => {
    const { container } = render(<AdminSidebar user={mockUser} />);
    
    const sidebar = container.firstChild;
    // Check for fixed positioning classes
    expect(sidebar).toHaveClass('fixed');
  });
  
  it('should display user info', () => {
    render(<AdminSidebar user={mockUser} />);
    
    // Check for user name and email
    expect(screen.getByText('Test Admin')).toBeInTheDocument();
    expect(screen.getByText('test@admin.com')).toBeInTheDocument();
  });
  
  it('should render with proper width for desktop layout', () => {
    const { container } = render(<AdminSidebar user={mockUser} />);
    
    const sidebar = container.firstChild;
    // Sidebar should have w-64 (256px) or similar width class
    expect(sidebar.className).toMatch(/w-/);
  });
});
