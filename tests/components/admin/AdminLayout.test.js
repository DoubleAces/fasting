/**
 * AdminLayout Component Tests
 * 
 * Tests for the admin layout wrapper that provides sidebar and header structure.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from '@jest/globals';
import AdminLayout from '@/components/admin/AdminLayout';

describe('AdminLayout Component', () => {
  it('should render children content', () => {
    render(
      <AdminLayout>
        <div data-testid="child-content">Test Content</div>
      </AdminLayout>
    );
    
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
  
  it('should render sidebar component', () => {
    render(
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>
    );
    
    // Check for sidebar presence (will be added when AdminSidebar is implemented)
    const sidebar = screen.queryByRole('navigation', { name: /admin sidebar/i });
    expect(sidebar).toBeInTheDocument();
  });
  
  it('should render header component', () => {
    render(
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>
    );
    
    // Check for header presence (will be added when AdminHeader is implemented)
    const header = screen.queryByRole('banner');
    expect(header).toBeInTheDocument();
  });
  
  it('should have proper layout structure with fixed sidebar', () => {
    render(
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>
    );
    
    // Admin layout should have a main content area
    const mainContent = screen.getByRole('main');
    expect(mainContent).toBeInTheDocument();
  });
  
  it('should apply admin-specific styling', () => {
    const { container } = render(
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>
    );
    
    // Check for layout classes (Tailwind)
    const layoutWrapper = container.firstChild;
    expect(layoutWrapper).toHaveClass('flex');
  });
});
