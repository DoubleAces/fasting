/**
 * Unit tests for StageProgressBar atom component
 * Tests progress bar rendering with different progress values and ARIA attributes
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import StageProgressBar from '@/components/atoms/StageProgressBar';

describe('StageProgressBar', () => {
  test('should render progress bar with 0% progress', () => {
    render(<StageProgressBar progress={0} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });

  test('should render progress bar with 50% progress', () => {
    render(<StageProgressBar progress={0.5} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '50');
    
    // Visual progress indicator should be ~50% width
    const progressFill = progressBar.querySelector('[data-testid="progress-fill"]');
    expect(progressFill).toHaveStyle({ width: '50%' });
  });

  test('should render progress bar with 100% progress', () => {
    render(<StageProgressBar progress={1.0} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    
    const progressFill = progressBar.querySelector('[data-testid="progress-fill"]');
    expect(progressFill).toHaveStyle({ width: '100%' });
  });
});
