import { render, screen, fireEvent } from '@testing-library/react';
import GlassmorphicCard from '@/components/atoms/GlassmorphicCard';

describe('GlassmorphicCard', () => {
  it('renders children correctly', () => {
    render(
      <GlassmorphicCard>
        <p>Card content</p>
      </GlassmorphicCard>
    );
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies glassmorphism base styles', () => {
    const { container } = render(<GlassmorphicCard>Content</GlassmorphicCard>);
    const card = container.firstChild;
    
    // Verify component renders with the proper glassmorphism structure
    expect(card).toBeTruthy();
    expect(card).toHaveTextContent('Content');
    expect(card.tagName).toBe('DIV');
    
    // Verify all required glassmorphism classes are present in className attribute
    const classAttr = card.getAttribute('class');
    expect(classAttr).toContain('bg-white/10');
    expect(classAttr).toContain('backdrop-saturate-150');
    expect(classAttr).toContain('border');
    expect(classAttr).toContain('border-white/20');
    expect(classAttr).toContain('rounded-2xl');
  });

  it('applies blur levels correctly', () => {
    const { rerender, container } = render(<GlassmorphicCard blur="sm">Content</GlassmorphicCard>);
    let card = container.firstChild;
    expect(card.getAttribute('class')).toContain('backdrop-blur-sm');
    
    rerender(<GlassmorphicCard blur="md">Content</GlassmorphicCard>);
    card = container.firstChild;
    expect(card.getAttribute('class')).toContain('backdrop-blur-md');
    
    rerender(<GlassmorphicCard blur="lg">Content</GlassmorphicCard>);
    card = container.firstChild;
    expect(card.getAttribute('class')).toContain('backdrop-blur-lg');
  });

  it('applies elevation levels correctly', () => {
    const { rerender, container } = render(<GlassmorphicCard elevation="low">Content</GlassmorphicCard>);
    let card = container.firstChild;
    expect(card.getAttribute('class')).toContain('shadow-md');
    
    rerender(<GlassmorphicCard elevation="medium">Content</GlassmorphicCard>);
    card = container.firstChild;
    expect(card.getAttribute('class')).toContain('shadow-lg');
    
    rerender(<GlassmorphicCard elevation="high">Content</GlassmorphicCard>);
    card = container.firstChild;
    expect(card.getAttribute('class')).toContain('shadow-2xl');
  });

  it('applies padding variants correctly', () => {
    const { rerender, container } = render(<GlassmorphicCard padding="none">Content</GlassmorphicCard>);
    let card = container.firstChild;
    expect(card.getAttribute('class')).toContain('p-0');
    
    rerender(<GlassmorphicCard padding="sm">Content</GlassmorphicCard>);
    card = container.firstChild;
    expect(card.getAttribute('class')).toContain('p-4');
    
    rerender(<GlassmorphicCard padding="md">Content</GlassmorphicCard>);
    card = container.firstChild;
    expect(card.getAttribute('class')).toContain('p-6');
    
    rerender(<GlassmorphicCard padding="lg">Content</GlassmorphicCard>);
    card = container.firstChild;
    expect(card.getAttribute('class')).toContain('p-8');
  });

  it('handles click if onClick provided', () => {
    const handleClick = jest.fn();
    const { container } = render(<GlassmorphicCard onClick={handleClick}>Clickable</GlassmorphicCard>);
    
    const card = container.firstChild;
    fireEvent.click(card);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders with correct HTML element using as prop', () => {
    const { rerender, container } = render(<GlassmorphicCard as="div">Div</GlassmorphicCard>);
    expect(container.querySelector('div')).toBeInTheDocument();
    
    rerender(<GlassmorphicCard as="article">Article</GlassmorphicCard>);
    expect(container.querySelector('article')).toBeInTheDocument();
    
    rerender(<GlassmorphicCard as="section">Section</GlassmorphicCard>);
    expect(container.querySelector('section')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<GlassmorphicCard className="custom-class">Content</GlassmorphicCard>);
    const card = container.firstChild;
    expect(card.getAttribute('class')).toContain('custom-class');
  });

  it('applies hover effect when onClick is provided', () => {
    const { container } = render(<GlassmorphicCard onClick={() => {}}>Hover me</GlassmorphicCard>);
    const card = container.firstChild;
    const classAttr = card.getAttribute('class');
    expect(classAttr).toContain('cursor-pointer');
    expect(classAttr).toContain('hover:shadow-xl');
  });

  it('uses default values when props not specified', () => {
    const { container } = render(<GlassmorphicCard>Default</GlassmorphicCard>);
    const card = container.firstChild;
    
    // Default: blur="md", padding="md", elevation="medium"
    const classAttr = card.getAttribute('class');
    expect(classAttr).toContain('backdrop-blur-md');
    expect(classAttr).toContain('p-6');
    expect(classAttr).toContain('shadow-lg');
  });
});
