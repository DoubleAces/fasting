/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import TimeDisplay from '@/components/atoms/TimeDisplay';

describe('TimeDisplay Component', () => {
  describe('12-hour Format', () => {
    it('formats morning time correctly with AM', () => {
      render(<TimeDisplay time="09:30" format="12h" />);
      
      expect(screen.getByText('9:30 AM')).toBeInTheDocument();
    });

    it('formats afternoon time correctly with PM', () => {
      render(<TimeDisplay time="14:45" format="12h" />);
      
      expect(screen.getByText('2:45 PM')).toBeInTheDocument();
    });

    it('formats midnight correctly', () => {
      render(<TimeDisplay time="00:00" format="12h" />);
      
      expect(screen.getByText('12:00 AM')).toBeInTheDocument();
    });

    it('formats noon correctly', () => {
      render(<TimeDisplay time="12:00" format="12h" />);
      
      expect(screen.getByText('12:00 PM')).toBeInTheDocument();
    });
  });

  describe('24-hour Format', () => {
    it('displays time as-is in 24h format', () => {
      render(<TimeDisplay time="14:45" format="24h" />);
      
      expect(screen.getByText('14:45')).toBeInTheDocument();
    });

    it('preserves leading zero for single-digit hours', () => {
      render(<TimeDisplay time="09:30" format="24h" />);
      
      expect(screen.getByText('09:30')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles null time', () => {
      render(<TimeDisplay time={null} format="12h" />);
      
      expect(screen.getByText('--:--')).toBeInTheDocument();
    });

    it('handles undefined time', () => {
      render(<TimeDisplay time={undefined} format="24h" />);
      
      expect(screen.getByText('--:--')).toBeInTheDocument();
    });

    it('handles invalid time format', () => {
      render(<TimeDisplay time="invalid" format="12h" />);
      
      expect(screen.getByText('--:--')).toBeInTheDocument();
    });

    it('defaults to 24h format when format not specified', () => {
      render(<TimeDisplay time="14:45" />);
      
      expect(screen.getByText('14:45')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('includes semantic time element', () => {
      render(<TimeDisplay time="14:45" format="12h" />);
      
      const timeElement = screen.getByText('2:45 PM').closest('time');
      expect(timeElement).toBeInTheDocument();
      expect(timeElement).toHaveAttribute('dateTime', '14:45');
    });
  });
});
