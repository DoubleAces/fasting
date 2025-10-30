import { render, screen } from '@testing-library/react';
import ProcessStep from '@/components/molecules/ProcessStep';

// Mock Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }) => <img src={src} alt={alt} {...props} />,
}));

describe('ProcessStep', () => {
  const mockStep = {
    id: 'step-1',
    number: 1,
    title: 'Set Your Goal',
    description: 'Choose your fasting schedule (16:8, 18:6, or custom) and set your daily goal.',
    screenshot: '/images/homepage/steps/set-goal.png',
  };

  it('renders step number', () => {
    render(<ProcessStep step={mockStep} />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders step title', () => {
    render(<ProcessStep step={mockStep} />);
    expect(screen.getByText('Set Your Goal')).toBeInTheDocument();
  });

  it('renders step description', () => {
    render(<ProcessStep step={mockStep} />);
    expect(screen.getByText(/Choose your fasting schedule/i)).toBeInTheDocument();
  });

  it('renders screenshot when provided and showScreenshot is true', () => {
    render(<ProcessStep step={mockStep} showScreenshot={true} />);
    const img = screen.getByAltText('Set Your Goal process screenshot');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/images/homepage/steps/set-goal.png');
  });

  it('does not render screenshot when showScreenshot is false', () => {
    render(<ProcessStep step={mockStep} showScreenshot={false} />);
    const img = screen.queryByAltText('Set Your Goal process screenshot');
    expect(img).not.toBeInTheDocument();
  });

  it('does not render screenshot when not provided', () => {
    const stepWithoutScreenshot = { ...mockStep, screenshot: null };
    render(<ProcessStep step={stepWithoutScreenshot} />);
    const img = screen.queryByAltText('Set Your Goal process screenshot');
    expect(img).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<ProcessStep step={mockStep} className="test-class" />);
    expect(container.firstChild.className).toContain('test-class');
  });

  it('renders step number with distinctive styling', () => {
    render(<ProcessStep step={mockStep} />);
    const number = screen.getByText('1');
    expect(number.className).toContain('text-');
    expect(number.className).toContain('font-bold');
  });

  it('renders title with bold styling', () => {
    render(<ProcessStep step={mockStep} />);
    const title = screen.getByText('Set Your Goal');
    expect(title.tagName).toBe('H3');
    expect(title.className).toContain('font-bold');
  });

  it('renders description with readable styling', () => {
    render(<ProcessStep step={mockStep} />);
    const description = screen.getByText(/Choose your fasting schedule/i);
    expect(description.tagName).toBe('P');
    expect(description.className).toContain('text-gray');
  });
});
