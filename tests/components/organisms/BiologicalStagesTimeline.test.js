/**
 * Unit tests for BiologicalStagesTimeline organism component
 * Tests timeline rendering, stage highlighting, and null handling
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import BiologicalStagesTimeline from '@/components/organisms/BiologicalStagesTimeline';

// Mock the useStageCalculation hook
jest.mock('@/hooks/useStageCalculation', () => ({
  useStageCalculation: jest.fn(),
}));

// Mock the FASTING_STAGES constant (7 stages)
jest.mock('@/lib/constants/fastingStages', () => ({
  FASTING_STAGES: [
    {
      id: 0,
      hourRangeStart: 0,
      hourRangeEnd: 4,
      title: '',
      description: 'Body processing your last meal',
      biologicalProcesses: [],
      scientificSources: [],
    },
    {
      id: 1,
      hourRangeStart: 4,
      hourRangeEnd: 8,
      title: '',
      description: 'Insulin dropping, using stored glucose',
      biologicalProcesses: [],
      scientificSources: [],
    },
    {
      id: 2,
      hourRangeStart: 8,
      hourRangeEnd: 16,
      title: '',
      description: 'Glycogen stores depleting, switching to fat',
      biologicalProcesses: [],
      scientificSources: [],
    },
    {
      id: 3,
      hourRangeStart: 16,
      hourRangeEnd: 24,
      title: '',
      description: 'Early ketone production beginning',
      biologicalProcesses: [],
      scientificSources: [],
    },
    {
      id: 4,
      hourRangeStart: 24,
      hourRangeEnd: 48,
      title: '',
      description: 'Running on ketones, fat burning optimized',
      biologicalProcesses: [],
      scientificSources: [],
    },
    {
      id: 5,
      hourRangeStart: 48,
      hourRangeEnd: 72,
      title: '',
      description: 'Extended fat burning, cellular cleanup active',
      biologicalProcesses: [],
      scientificSources: [],
    },
    {
      id: 6,
      hourRangeStart: 72,
      hourRangeEnd: null,
      title: '',
      description: 'Prolonged fasting state',
      biologicalProcesses: [],
      scientificSources: [],
    },
  ],
}));

import { useStageCalculation } from '@/hooks/useStageCalculation';
import { FASTING_STAGES } from '@/lib/constants/fastingStages';

describe('BiologicalStagesTimeline', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = jest.fn();
  });

  test('should render all 7 stages', () => {
    // Mock timeline state for 14-hour fast (stage 2: 8-16hrs)
    useStageCalculation.mockReturnValue({
      currentStageIndex: 2,
      elapsedHours: 12,
      progressWithinStage: 0.5,
      hoursIntoStage: 4,
      stagesCompleted: [FASTING_STAGES[0], FASTING_STAGES[1]],
      stagesUpcoming: [FASTING_STAGES[3], FASTING_STAGES[4], FASTING_STAGES[5], FASTING_STAGES[6]],
      currentStage: FASTING_STAGES[2],
    });

    render(<BiologicalStagesTimeline elapsedMs={12 * 60 * 60 * 1000} />);
    
    // Check that all 7 stages are rendered with correct data
    expect(screen.getByTestId('stage-card-0')).toBeInTheDocument();
    expect(screen.getByTestId('stage-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('stage-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('stage-card-3')).toBeInTheDocument();
    expect(screen.getByTestId('stage-card-4')).toBeInTheDocument();
    expect(screen.getByTestId('stage-card-5')).toBeInTheDocument();
    expect(screen.getByTestId('stage-card-6')).toBeInTheDocument();
    
    // Verify completed stages have checkmarks
    const stage0 = screen.getByTestId('stage-card-0');
    expect(stage0).toHaveTextContent('✓');
    
    const stage1 = screen.getByTestId('stage-card-1');
    expect(stage1).toHaveTextContent('✓');
    
    // Verify current stage does NOT have checkmark
    const stage2 = screen.getByTestId('stage-card-2');
    expect(stage2).not.toHaveTextContent('✓');
  });

  test('should highlight current stage', () => {
    useStageCalculation.mockReturnValue({
      currentStageIndex: 1,
      elapsedHours: 6,
      progressWithinStage: 0.5,
      hoursIntoStage: 2,
      stagesCompleted: [FASTING_STAGES[0]],
      stagesUpcoming: [FASTING_STAGES[2]],
      currentStage: FASTING_STAGES[1],
    });

    const { container } = render(<BiologicalStagesTimeline elapsedMs={6 * 60 * 60 * 1000} />);
    
    // Current stage (Early Fasting) should have progress bar
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    // Current stage should have highlighted styling (left border)
    const earlyFastingCard = screen.getByTestId('stage-card-1');
    expect(earlyFastingCard).toHaveClass('border-l-4');
    expect(earlyFastingCard).toHaveClass('border-purple-500');
  });

  test('should return null when elapsedMs is null (no active fast)', () => {
    useStageCalculation.mockReturnValue(null);

    const { container } = render(<BiologicalStagesTimeline elapsedMs={null} />);
    
    // Component should render nothing when no active fast
    expect(container.firstChild).toBeNull();
  });

  test('should call scrollIntoView on mount for current stage', () => {
    const mockScrollIntoView = jest.fn();
    Element.prototype.scrollIntoView = mockScrollIntoView;

    useStageCalculation.mockReturnValue({
      currentStageIndex: 1,
      elapsedHours: 6,
      progressWithinStage: 0.5,
      hoursIntoStage: 2,
      stagesCompleted: [FASTING_STAGES[0]],
      stagesUpcoming: [FASTING_STAGES[2]],
      currentStage: FASTING_STAGES[1],
    });

    render(<BiologicalStagesTimeline elapsedMs={6 * 60 * 60 * 1000} />);
    
    // scrollIntoView should be called once on mount
    expect(mockScrollIntoView).toHaveBeenCalledTimes(1);
    expect(mockScrollIntoView).toHaveBeenCalledWith(
      expect.objectContaining({
        behavior: expect.any(String),
        block: 'center',
      })
    );
  });
});
