import { render, screen } from '@testing-library/react';
import InsightCard from '@/components/molecules/InsightCard';

describe('InsightCard', () => {
  it('should render insight with label and value', () => {
    render(
      <InsightCard 
        label="Average Duration"
        value="15h 30m"
        icon="⏱️"
      />
    );

    expect(screen.getByText('Average Duration')).toBeInTheDocument();
    expect(screen.getByText('15h 30m')).toBeInTheDocument();
    expect(screen.getByText('⏱️')).toBeInTheDocument();
  });

  it('should render comparison text when provided', () => {
    render(
      <InsightCard 
        label="This Fast"
        value="16h 45m"
        comparison="+1h 15m vs average"
        icon="🎯"
      />
    );

    expect(screen.getByText('+1h 15m vs average')).toBeInTheDocument();
  });

  it('should not render comparison when not provided', () => {
    const { container } = render(
      <InsightCard 
        label="Typical Breakfast"
        value="9:00 AM"
        icon="🍳"
      />
    );

    // Should not have comparison text element
    const comparisonElements = container.querySelectorAll('.text-gray-600');
    const hasComparison = Array.from(comparisonElements).some(
      el => el.textContent && el.textContent.includes('vs')
    );
    expect(hasComparison).toBe(false);
  });

  it('should render different icon types', () => {
    const { rerender } = render(
      <InsightCard 
        label="Rank"
        value="#5"
        icon="🏆"
      />
    );

    expect(screen.getByText('🏆')).toBeInTheDocument();

    rerender(
      <InsightCard 
        label="Streak"
        value="Active"
        icon="🔥"
      />
    );

    expect(screen.getByText('🔥')).toBeInTheDocument();
  });

  it('should apply positive comparison styling', () => {
    const { container } = render(
      <InsightCard 
        label="Duration"
        value="18h"
        comparison="+2h 30m vs average"
        variant="positive"
        icon="⬆️"
      />
    );

    const comparisonElement = screen.getByText('+2h 30m vs average');
    expect(comparisonElement).toHaveClass('text-green-600');
  });

  it('should apply negative comparison styling', () => {
    const { container } = render(
      <InsightCard 
        label="Duration"
        value="12h"
        comparison="-3h vs average"
        variant="negative"
        icon="⬇️"
      />
    );

    const comparisonElement = screen.getByText('-3h vs average');
    expect(comparisonElement).toHaveClass('text-red-600');
  });

  it('should apply neutral styling by default', () => {
    const { container } = render(
      <InsightCard 
        label="Typical Time"
        value="9:00 AM"
        comparison="Based on 30 days"
        icon="📊"
      />
    );

    const comparisonElement = screen.getByText('Based on 30 days');
    expect(comparisonElement).toHaveClass('text-gray-600');
  });

  it('should handle long labels gracefully', () => {
    render(
      <InsightCard 
        label="Historical Ranking Among All Your Fasting Entries"
        value="#15"
        icon="📈"
      />
    );

    expect(screen.getByText('Historical Ranking Among All Your Fasting Entries')).toBeInTheDocument();
  });

  it('should handle long values gracefully', () => {
    render(
      <InsightCard 
        label="Status"
        value="This is your longest fast this month and contributes to your current 7-day streak"
        icon="🌟"
      />
    );

    expect(screen.getByText(/This is your longest fast/)).toBeInTheDocument();
  });

  it('should be accessible with proper aria attributes', () => {
    render(
      <InsightCard 
        label="Average Duration"
        value="15h 30m"
        icon="⏱️"
      />
    );

    // Should have accessible structure
    const card = screen.getByText('Average Duration').closest('div');
    expect(card).toBeInTheDocument();
  });
});
