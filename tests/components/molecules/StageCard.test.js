/**
 * Unit tests for StageCard molecule component
 * Tests stage card rendering with different states (current, completed, upcoming)
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import StageCard from '@/components/molecules/StageCard';

const mockStage = {
  id: 3,
  hourRangeStart: 16,
  hourRangeEnd: 24,
  title: 'Ketosis Starting',
  description: 'Early ketone production beginning',
  biologicalProcesses: [],
  scientificSources: [],
};

describe('StageCard', () => {
  test('should render stage hour range and description', () => {
    render(<StageCard stage={mockStage} isCurrent={false} progress={null} />);
    
    expect(screen.getByText(/Early ketone production beginning/)).toBeInTheDocument();
    expect(screen.getByText(/16-24 Hours/)).toBeInTheDocument();
  });

  test('should highlight current stage with darker styling', () => {
    const { container } = render(
      <StageCard stage={mockStage} isCurrent={true} progress={0.5} hoursIntoStage={4} />
    );
    
    const card = container.firstChild;
    
    // Check for current stage styling (purple background and border)
    expect(card).toHaveClass('bg-purple-500/10');
    expect(card).toHaveClass('border-l-4');
    expect(card).toHaveClass('border-purple-500');
  });

  test('should show progress bar when current stage', () => {
    render(<StageCard stage={mockStage} isCurrent={true} progress={0.5} />);
    
    // Progress bar should be visible
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '50');
  });

  test('should hide progress bar when not current stage', () => {
    render(<StageCard stage={mockStage} isCurrent={false} progress={null} />);
    
    // Progress bar should not be present
    const progressBar = screen.queryByRole('progressbar');
    expect(progressBar).not.toBeInTheDocument();
  });

  describe('User Story 2: Progress Text Indicators', () => {
    test('should display hours into stage text for current stage', () => {
      // 2 hours into a 4-hour stage (50% progress)
      render(
        <StageCard 
          stage={mockStage} 
          isCurrent={true} 
          progress={0.5} 
          hoursIntoStage={2.0}
        />
      );
      
      // Should display hours into stage (compact format: "2.0h in")
      expect(screen.getByText(/2\.0h in/i)).toBeInTheDocument();
    });

    test('should display percentage through stage for current stage', () => {
      render(
        <StageCard 
          stage={mockStage} 
          isCurrent={true} 
          progress={0.5} 
          hoursIntoStage={2.0}
        />
      );
      
      // Should display percentage (compact format: "50%")
      expect(screen.getByText(/50%/i)).toBeInTheDocument();
    });

    test('should display 0% when just entered stage', () => {
      render(
        <StageCard 
          stage={mockStage} 
          isCurrent={true} 
          progress={0.0} 
          hoursIntoStage={0.0}
        />
      );
      
      expect(screen.getByText(/0\.0h in/i)).toBeInTheDocument();
      expect(screen.getByText(/0%/i)).toBeInTheDocument();
    });

    test('should display 95% when near end of stage', () => {
      render(
        <StageCard 
          stage={mockStage} 
          isCurrent={true} 
          progress={0.95} 
          hoursIntoStage={3.8}
        />
      );
      
      expect(screen.getByText(/3\.8h in/i)).toBeInTheDocument();
      expect(screen.getByText(/95%/i)).toBeInTheDocument();
    });

    test('should round percentage to nearest whole number', () => {
      // 0.527 should round to 53%
      render(
        <StageCard 
          stage={mockStage} 
          isCurrent={true} 
          progress={0.527} 
          hoursIntoStage={2.1}
        />
      );
      
      expect(screen.getByText(/53%/i)).toBeInTheDocument();
    });

    test('should not display progress text for non-current stages', () => {
      render(
        <StageCard 
          stage={mockStage} 
          isCurrent={false} 
          progress={null} 
          hoursIntoStage={null}
        />
      );
      
      // Should not have progress indicator on right side
      expect(screen.queryByText(/h in/i)).not.toBeInTheDocument();
    });
  });
});
