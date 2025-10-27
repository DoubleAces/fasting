/**
 * @jest-environment jsdom
 */

import { describe, it, expect, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import FastingTimerCard from '@/components/organisms/FastingTimerCard';

// Mock the FastingTimer component
jest.mock('@/components/organisms/FastingTimer');
import FastingTimer from '@/components/organisms/FastingTimer';

describe('FastingTimerCard', () => {
  beforeEach(() => {
    FastingTimer.mockImplementation(({ lastMealTime, isActive }) => (
      <div data-testid="fasting-timer">
        Timer: {lastMealTime} (Active: {isActive ? 'Yes' : 'No'})
      </div>
    ));
  });

  it('should render FastingTimer with correct props', () => {
    render(<FastingTimerCard lastMealTime="10:00" isActive={true} />);

    expect(screen.getByTestId('fasting-timer')).toBeInTheDocument();
    expect(screen.getByText(/10:00/)).toBeInTheDocument();
    expect(screen.getByText(/Active: Yes/)).toBeInTheDocument();
  });

  it('should apply card styling with Tailwind classes', () => {
    const { container } = render(<FastingTimerCard lastMealTime="10:00" isActive={true} />);

    const card = container.firstChild;
    expect(card).toHaveClass(); // Should have Tailwind classes
  });

  it('should have proper spacing and layout', () => {
    const { container } = render(<FastingTimerCard lastMealTime="10:00" isActive={true} />);

    const card = container.firstChild;
    // Card should have padding, margin, or other spacing classes
    expect(card.className).toMatch(/p-|m-|space-/);
  });

  it('should pass isActive prop to FastingTimer', () => {
    render(<FastingTimerCard lastMealTime="10:00" isActive={false} />);

    expect(FastingTimer).toHaveBeenCalledWith(
      expect.objectContaining({
        lastMealTime: '10:00',
        isActive: false
      }),
      expect.anything()
    );
  });

  it('should pass lastMealTime prop to FastingTimer', () => {
    render(<FastingTimerCard lastMealTime="14:30" isActive={true} />);

    expect(FastingTimer).toHaveBeenCalledWith(
      expect.objectContaining({
        lastMealTime: '14:30',
        isActive: true
      }),
      expect.anything()
    );
  });

  it('should render nothing when lastMealTime is null', () => {
    FastingTimer.mockImplementation(() => null);

    const { container } = render(<FastingTimerCard lastMealTime={null} isActive={false} />);

    expect(container.firstChild).toBeTruthy(); // Card wrapper exists
    expect(screen.queryByTestId('fasting-timer')).not.toBeInTheDocument();
  });

  it('should have accessible card structure', () => {
    const { container } = render(<FastingTimerCard lastMealTime="10:00" isActive={true} />);

    const card = container.firstChild;
    expect(card).toBeInTheDocument();
    expect(card.tagName.toLowerCase()).toMatch(/div|section|article/);
  });

  it('should apply background and border styling', () => {
    const { container } = render(<FastingTimerCard lastMealTime="10:00" isActive={true} />);

    const card = container.firstChild;
    // Should have background and border classes
    expect(card.className).toMatch(/bg-|border/);
  });

  it('should apply rounded corners', () => {
    const { container } = render(<FastingTimerCard lastMealTime="10:00" isActive={true} />);

    const card = container.firstChild;
    expect(card.className).toMatch(/rounded/);
  });

  it('should apply shadow for depth', () => {
    const { container } = render(<FastingTimerCard lastMealTime="10:00" isActive={true} />);

    const card = container.firstChild;
    expect(card.className).toMatch(/shadow/);
  });
});
