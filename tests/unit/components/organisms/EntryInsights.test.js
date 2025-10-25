import { render, screen } from '@testing-library/react';
import EntryInsights from '@/components/organisms/EntryInsights';

describe('EntryInsights', () => {
  const mockInsightsWithData = {
    isLongestThisMonth: true,
    rank: 5,
    totalEntries: 25,
    averageDuration: 900, // 15 hours in minutes
    comparisonToAverage: 60, // +1 hour vs average
    typicalBreakfastTime: '09:00',
    contributesToStreak: true,
    isBestDay: true,
  };

  const mockInsightsInsufficientData = {
    isLongestThisMonth: false,
    rank: 1,
    totalEntries: 3,
    averageDuration: null,
    comparisonToAverage: null,
    typicalBreakfastTime: null,
    contributesToStreak: false,
    isBestDay: false,
  };

  it('should render all insight cards when data is sufficient', () => {
    render(<EntryInsights insights={mockInsightsWithData} />);

    // Should show multiple insights
    expect(screen.getByText(/Historical Rank/i)).toBeInTheDocument();
    expect(screen.getByText(/Average Duration/i)).toBeInTheDocument();
    expect(screen.getByText(/Typical Breakfast/i)).toBeInTheDocument();
  });

  it('should display longest this month badge', () => {
    render(<EntryInsights insights={mockInsightsWithData} />);

    expect(screen.getByText(/Longest.*month/i)).toBeInTheDocument();
  });

  it('should display streak contribution', () => {
    render(<EntryInsights insights={mockInsightsWithData} />);

    expect(screen.getByText(/Contributes to current streak/i)).toBeInTheDocument();
  });

  it('should display best day badge when applicable', () => {
    render(<EntryInsights insights={mockInsightsWithData} />);

    // Badge component renders "Best Day" text
    const badge = screen.getByText('Best Day');
    expect(badge).toBeInTheDocument();
  });

  it('should not display best day badge when not applicable', () => {
    const insights = { ...mockInsightsWithData, isBestDay: false };
    render(<EntryInsights insights={insights} />);

    expect(screen.queryByText(/Best Day/i)).not.toBeInTheDocument();
  });

  it('should show insufficient data message when fewer than 7 entries', () => {
    render(<EntryInsights insights={mockInsightsInsufficientData} />);

    // Check for the message content
    expect(screen.getByText(/Need more data/i)).toBeInTheDocument();
    expect(screen.getByText(/at least 7 entries/i)).toBeInTheDocument();
  });

  it('should still show rank when data insufficient', () => {
    render(<EntryInsights insights={mockInsightsInsufficientData} />);

    // Should show rank even with insufficient data
    expect(screen.getByText(/#1/)).toBeInTheDocument();
  });

  it('should format duration correctly (hours and minutes)', () => {
    render(<EntryInsights insights={mockInsightsWithData} />);

    // 900 minutes = 15 hours
    expect(screen.getByText(/15h/)).toBeInTheDocument();
  });

  it('should format comparison correctly with + or -', () => {
    const insightsPositive = { ...mockInsightsWithData, comparisonToAverage: 75 };
    const { rerender, container } = render(<EntryInsights insights={insightsPositive} />);

    // 75 minutes = 1h 15m - check if it's in the document
    expect(container.textContent).toContain('+1h 15m vs average');

    const insightsNegative = { ...mockInsightsWithData, comparisonToAverage: -45 };
    rerender(<EntryInsights insights={insightsNegative} />);

    // -45 minutes
    expect(container.textContent).toContain('-45m vs average');
  });

  it('should format time in 12-hour format', () => {
    render(<EntryInsights insights={mockInsightsWithData} />);

    expect(screen.getByText(/9:00 AM/i)).toBeInTheDocument();
  });

  it('should handle null insights gracefully', () => {
    render(<EntryInsights insights={null} />);

    // Should show some message or empty state
    expect(screen.getByText(/no insights/i)).toBeInTheDocument();
  });

  it('should handle missing insights properties', () => {
    const partialInsights = {
      rank: 10,
      totalEntries: 50,
    };

    render(<EntryInsights insights={partialInsights} />);

    // Should not crash
    expect(screen.getByText(/#10/)).toBeInTheDocument();
  });

  it('should display percentage or context for rank', () => {
    const { container } = render(<EntryInsights insights={mockInsightsWithData} />);

    // Rank 5 out of 25 = top 20%
    // This is shown as comparison text in the Historical Rank card
    expect(container.textContent).toContain('Top 20%');
  });

  it('should have proper grid layout on desktop', () => {
    const { container } = render(<EntryInsights insights={mockInsightsWithData} />);

    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('md:grid-cols-2');
  });

  it('should be accessible with proper headings', () => {
    render(<EntryInsights insights={mockInsightsWithData} />);

    const heading = screen.getByRole('heading', { name: /insights/i });
    expect(heading).toBeInTheDocument();
  });
});
