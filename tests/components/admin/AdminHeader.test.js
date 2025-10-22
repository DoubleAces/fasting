/**
 * AdminHeader Component Tests
 * 
 * Tests for the simplified admin header.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from '@jest/globals';
import AdminHeader from '@/components/admin/AdminHeader';

describe('AdminHeader Component', () => {
  it('should render header element', () => {
    render(<AdminHeader />);
    
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });
  
  it('should display page title', () => {
    render(<AdminHeader />);
    
    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
  });
  
  it('should have clean minimal styling', () => {
    const { container } = render(<AdminHeader />);
    
    const header = container.firstChild;
    expect(header).toHaveClass('bg-white', 'border-b');
  });
});
