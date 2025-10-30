import { render, screen } from '@testing-library/react';
import ProblemSolutionSection from '@/components/organisms/ProblemSolutionSection';

// Mock child component
jest.mock('@/components/molecules/ProblemSolutionBlock', () => {
  return function ProblemSolutionBlock({ problemSolution }) {
    return (
      <div data-testid="problem-solution-block">
        {problemSolution.icon} {problemSolution.problem}
      </div>
    );
  };
});

describe('ProblemSolutionSection', () => {
  it('renders section heading', () => {
    render(<ProblemSolutionSection />);
    expect(screen.getByText(/Why Fasting Tracker\?/i)).toBeInTheDocument();
  });

  it('displays all problem/solution pairs', () => {
    render(<ProblemSolutionSection />);
    const blocks = screen.getAllByTestId('problem-solution-block');
    expect(blocks).toHaveLength(3);
  });

  it('applies grid layout', () => {
    const { container } = render(<ProblemSolutionSection />);
    const grid = container.querySelector('.grid');
    expect(grid).toBeInTheDocument();
  });

  it('applies responsive grid columns', () => {
    const { container } = render(<ProblemSolutionSection />);
    const grid = container.querySelector('.grid');
    expect(grid.className).toContain('md:grid-cols-2');
    expect(grid.className).toContain('lg:grid-cols-3');
  });

  it('applies custom className', () => {
    const { container } = render(<ProblemSolutionSection className="custom-section" />);
    expect(container.firstChild.className).toContain('custom-section');
  });

  it('renders section with padding', () => {
    const { container } = render(<ProblemSolutionSection />);
    const section = container.firstChild;
    expect(section.className).toContain('py-');
  });

  it('spaces problem blocks with gap', () => {
    const { container } = render(<ProblemSolutionSection />);
    const grid = container.querySelector('.grid');
    expect(grid.className).toContain('gap');
  });

  it('renders heading with appropriate text size', () => {
    render(<ProblemSolutionSection />);
    const heading = screen.getByText(/Why Fasting Tracker\?/i);
    expect(heading.className).toContain('text-');
  });
});
