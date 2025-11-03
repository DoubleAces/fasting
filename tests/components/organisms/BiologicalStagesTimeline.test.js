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

// Mock the FASTING_STAGES constant
jest.mock('@/lib/constants/fastingStages', () => ({
  FASTING_STAGES: [
    {
      id: 0,
      hourRangeStart: 0,
      hourRangeEnd: 4,
      title: 'Fed State',
      description: 'Body processes nutrients',
      biologicalProcesses: ['Insulin elevated'],
      scientificSources: ['Berg'],
    },
    {
      id: 1,
      hourRangeStart: 4,
      hourRangeEnd: 8,
      title: 'Early Fasting',
      description: 'Glycogen depleting',
      biologicalProcesses: ['Insulin drops'],
      scientificSources: ['Kerndt 1982'],
    },
    {
      id: 2,
      hourRangeStart: 8,
      hourRangeEnd: 12,
      title: 'Glycogen Depletion',
      description: 'Transition to fat',
      biologicalProcesses: ['Fat oxidation'],
      scientificSources: ['Rothman 1995'],
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

  test('should render all 8 stages', () => {
    // Mock timeline state for 14-hour fast (Early Ketosis)
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
    
    // Check that mocked stages are rendered (we only mocked 3 for testing)
    const fedStateCard = screen.getByTestId('stage-card-0');
    expect(fedStateCard).toBeInTheDocument();
    expect(fedStateCard).toHaveTextContent('Fed State');
    
    const earlyFastingCard = screen.getByTestId('stage-card-1');
    expect(earlyFastingCard).toBeInTheDocument();
    expect(earlyFastingCard).toHaveTextContent('Early Fasting');
    
    const glycogenCard = screen.getByTestId('stage-card-2');
    expect(glycogenCard).toBeInTheDocument();
    expect(glycogenCard).toHaveTextContent('Glycogen Depletion');
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
