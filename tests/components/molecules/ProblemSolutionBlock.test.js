import { render, screen } from '@testing-library/react';
import ProblemSolutionBlock from '@/components/molecules/ProblemSolutionBlock';

describe('ProblemSolutionBlock', () => {
  const mockProblemSolution = {
    problem: "Tired of complicated health apps with features you'll never use?",
    solution: 'We built the simplest fasting tracker possible. Just logging, streaks, and insights.',
    icon: '🎯',
  };

  it('renders problem text', () => {
    render(<ProblemSolutionBlock problemSolution={mockProblemSolution} />);
    expect(screen.getByText(/Tired of complicated health apps/i)).toBeInTheDocument();
  });

  it('renders solution text', () => {
    render(<ProblemSolutionBlock problemSolution={mockProblemSolution} />);
    expect(screen.getByText(/We built the simplest fasting tracker/i)).toBeInTheDocument();
  });

  it('displays icon', () => {
    const { container } = render(<ProblemSolutionBlock problemSolution={mockProblemSolution} />);
    expect(container.textContent).toContain('🎯');
  });

  it('applies vertical layout by default', () => {
    const { container } = render(<ProblemSolutionBlock problemSolution={mockProblemSolution} />);
    const block = container.firstChild;
    expect(block.className).toContain('flex-col');
  });

  it('applies horizontal layout when specified', () => {
    const { container } = render(<ProblemSolutionBlock problemSolution={mockProblemSolution} layout="horizontal" />);
    const block = container.firstChild;
    expect(block.className).toContain('flex-row');
  });

  it('applies custom className', () => {
    const { container } = render(<ProblemSolutionBlock problemSolution={mockProblemSolution} className="custom-block" />);
    expect(container.firstChild.className).toContain('custom-block');
  });

  it('renders problem text with bold styling', () => {
    render(<ProblemSolutionBlock problemSolution={mockProblemSolution} />);
    const problem = screen.getByText(/Tired of complicated health apps/i);
    expect(problem.className).toContain('font-bold');
  });

  it('renders problem text larger than solution', () => {
    render(<ProblemSolutionBlock problemSolution={mockProblemSolution} />);
    const problem = screen.getByText(/Tired of complicated health apps/i);
    const solution = screen.getByText(/We built the simplest fasting tracker/i);
    expect(problem.className).toContain('text-xl');
    expect(solution.className).not.toContain('text-xl');
  });

  it('renders icon with large size', () => {
    const { container } = render(<ProblemSolutionBlock problemSolution={mockProblemSolution} />);
    const icon = container.querySelector('[aria-hidden="true"]');
    expect(icon).toBeInTheDocument();
    expect(icon.className).toContain('text-4xl');
  });

  it('centers content in vertical layout', () => {
    const { container } = render(<ProblemSolutionBlock problemSolution={mockProblemSolution} layout="vertical" />);
    const block = container.firstChild;
    expect(block.className).toContain('text-center');
  });

  it('does not center content in horizontal layout', () => {
    const { container } = render(<ProblemSolutionBlock problemSolution={mockProblemSolution} layout="horizontal" />);
    const block = container.firstChild;
    expect(block.className).not.toContain('text-center');
  });

  it('has proper spacing between elements', () => {
    const { container } = render(<ProblemSolutionBlock problemSolution={mockProblemSolution} />);
    const block = container.firstChild;
    expect(block.className).toContain('gap');
  });
});
