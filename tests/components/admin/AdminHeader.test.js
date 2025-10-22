/**
 * AdminHeader Component Tests
 * 
 * Tests for the admin header with user info display.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from '@jest/globals';
import AdminHeader from '@/components/admin/AdminHeader';

describe('AdminHeader Component', () => {
  const mockUser = {
    name: 'John Admin',
    email: 'john@admin.com',
    picture: '/avatar.jpg',
  };
  
  it('should render header element', () => {
    render(<AdminHeader user={mockUser} />);
    
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });
  
  it('should display user name', () => {
    render(<AdminHeader user={mockUser} />);
    
    expect(screen.getByText('John Admin')).toBeInTheDocument();
  });
  
  it('should display user email', () => {
    render(<AdminHeader user={mockUser} />);
    
    expect(screen.getByText('john@admin.com')).toBeInTheDocument();
  });
  
  it('should display user avatar if picture provided', () => {
    render(<AdminHeader user={mockUser} />);
    
    const avatar = screen.getByAltText(/john admin|avatar/i);
    expect(avatar).toBeInTheDocument();
    // Next.js Image component transforms the src with optimization params and URL encoding
    expect(avatar.getAttribute('src')).toContain('avatar.jpg');
  });
  
  it('should display default avatar if no picture provided', () => {
    const userWithoutPicture = {
      name: 'Jane Admin',
      email: 'jane@admin.com',
    };
    
    render(<AdminHeader user={userWithoutPicture} />);
    
    // Should show initials
    const initials = screen.getAllByText(/JA/i).find(el => el.tagName === 'SPAN');
    expect(initials).toBeInTheDocument();
  });
  
  it('should handle missing user data gracefully', () => {
    render(<AdminHeader user={null} />);
    
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });
  
  it('should have proper styling for desktop header', () => {
    const { container } = render(<AdminHeader user={mockUser} />);
    
    const header = container.firstChild;
    // Header should have flex and padding classes
    expect(header).toHaveClass('flex');
  });
});
