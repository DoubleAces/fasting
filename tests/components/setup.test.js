import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

/**
 * Sample component test to verify React Testing Library setup
 * This test can be deleted once real components are implemented
 */

// Simple test component
function TestButton({ onClick, children }) {
  return (
    <button onClick={onClick} className="btn btn-primary">
      {children}
    </button>
  );
}

describe('React Testing Library Setup', () => {
  it('should render a component', () => {
    render(<TestButton>Click me</TestButton>);
    const button = screen.getByText('Click me');
    expect(button).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(<TestButton onClick={handleClick}>Click me</TestButton>);
    
    const button = screen.getByText('Click me');
    button.click();
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should apply CSS classes', () => {
    render(<TestButton>Styled Button</TestButton>);
    const button = screen.getByText('Styled Button');
    expect(button).toHaveClass('btn', 'btn-primary');
  });
});
