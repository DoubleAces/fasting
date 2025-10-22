/**
 * Admin Dashboard Not Found Page Tests
 * 
 * Tests for custom 404 page within admin area.
 */

import { render, screen } from '@testing-library/react';
import AdminNotFound from '@/app/dashboard/not-found';

describe('Admin Dashboard Not Found Page', () => {
  it('should render 404 heading', () => {
    render(<AdminNotFound />);
    
    const heading = screen.getByRole('heading', { name: /404.*not found/i });
    expect(heading).toBeInTheDocument();
  });

  it('should display helpful error message', () => {
    render(<AdminNotFound />);
    
    const message = screen.getByText(/doesn't exist or hasn't been created yet/i);
    expect(message).toBeInTheDocument();
  });

  it('should include link back to dashboard', () => {
    render(<AdminNotFound />);
    
    const dashboardLink = screen.getByRole('link', { name: /back to dashboard/i });
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
  });

  it('should include link to homepage', () => {
    render(<AdminNotFound />);
    
    const homeLink = screen.getByRole('link', { name: /go to homepage/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('should have centered layout', () => {
    const { container } = render(<AdminNotFound />);
    
    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
  });

  it('should render icon element', () => {
    render(<AdminNotFound />);
    
    // Check for the search icon emoji
    const icon = screen.getByText('🔍');
    expect(icon).toBeInTheDocument();
  });
});
