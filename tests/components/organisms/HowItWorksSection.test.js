import { render, screen } from '@testing-library/react';
import HowItWorksSection from '@/components/organisms/HowItWorksSection';

// Mock ProcessStep
jest.mock('@/components/molecules/ProcessStep', () => {
  return function ProcessStep({ step }) {
    return (
      <div data-testid="process-step">
        {step.number}. {step.title}
      </div>
    );
  };
});

describe('HowItWorksSection', () => {
  it('renders section heading', () => {
    render(<HowItWorksSection />);
    expect(screen.getByText(/How It Works/i)).toBeInTheDocument();
  });

  it('renders 3 process steps', () => {
    render(<HowItWorksSection />);
    const steps = screen.getAllByTestId('process-step');
    expect(steps).toHaveLength(3);
  });

  it('renders steps in correct order', () => {
    render(<HowItWorksSection />);
    const steps = screen.getAllByTestId('process-step');
    expect(steps[0].textContent).toContain('1.');
    expect(steps[1].textContent).toContain('2.');
    expect(steps[2].textContent).toContain('3.');
  });

  it('applies proper layout structure', () => {
    const { container } = render(<HowItWorksSection />);
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const { container } = render(<HowItWorksSection className="test-class" />);
    expect(container.firstChild.className).toContain('test-class');
  });

  it('applies proper padding', () => {
    const { container } = render(<HowItWorksSection />);
    expect(container.firstChild.className).toContain('py-20');
  });

  it('applies gap spacing between steps', () => {
    const { container } = render(<HowItWorksSection />);
    const stepsContainer = container.querySelector('[class*="gap"]');
    expect(stepsContainer).toBeInTheDocument();
  });
});
