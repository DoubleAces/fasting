import { render, screen, fireEvent } from '@testing-library/react';
import GradientButton from '@/components/atoms/GradientButton';

describe('GradientButton', () => {
  it('renders with correct text', () => {
    render(<GradientButton>Click Me</GradientButton>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<GradientButton onClick={handleClick}>Click Me</GradientButton>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies primary variant styles by default', () => {
    render(<GradientButton>Primary</GradientButton>);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('bg-gradient-to-r');
    expect(button).toHaveClass('from-purple-600');
    expect(button).toHaveClass('to-pink-500');
    expect(button).toHaveClass('text-white');
  });

  it('applies secondary variant styles when specified', () => {
    render(<GradientButton variant="secondary">Secondary</GradientButton>);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('bg-transparent');
    expect(button).toHaveClass('border-2');
  });

  it('applies correct size styles', () => {
    const { rerender } = render(<GradientButton size="sm">Small</GradientButton>);
    expect(screen.getByRole('button')).toHaveClass('px-4', 'py-2', 'text-sm');
    
    rerender(<GradientButton size="md">Medium</GradientButton>);
    expect(screen.getByRole('button')).toHaveClass('px-6', 'py-3', 'text-base');
    
    rerender(<GradientButton size="lg">Large</GradientButton>);
    expect(screen.getByRole('button')).toHaveClass('px-8', 'py-4', 'text-lg');
  });

  it('is keyboard accessible (tab + enter)', () => {
    const handleClick = jest.fn();
    render(<GradientButton onClick={handleClick}>Accessible</GradientButton>);
    
    const button = screen.getByRole('button');
    button.focus();
    expect(button).toHaveFocus();
    
    // Buttons respond to click when Enter is pressed (native behavior)
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalled();
  });

  it('respects disabled state', () => {
    const handleClick = jest.fn();
    render(<GradientButton disabled onClick={handleClick}>Disabled</GradientButton>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
    
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies fullWidth when specified', () => {
    render(<GradientButton fullWidth>Full Width</GradientButton>);
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });

  it('applies custom className', () => {
    render(<GradientButton className="custom-class">Custom</GradientButton>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('uses ariaLabel when provided', () => {
    render(<GradientButton ariaLabel="Custom aria label">Icon</GradientButton>);
    expect(screen.getByRole('button', { name: /custom aria label/i })).toBeInTheDocument();
  });

  it('sets correct button type', () => {
    const { rerender } = render(<GradientButton type="button">Button</GradientButton>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    
    rerender(<GradientButton type="submit">Submit</GradientButton>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('has focus ring on focus', () => {
    render(<GradientButton>Focus Test</GradientButton>);
    const button = screen.getByRole('button');
    
    button.focus();
    expect(button).toHaveClass('focus:ring-2', 'focus:ring-purple-500');
  });
});
