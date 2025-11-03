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

// Mock the FASTING_STAGES constant (10 stages)
jest.mock('@/lib/constants/fastingStages', () => ({
  FASTING_STAGES: [
    {
      id: 0,
      hourRangeStart: 0,
      hourRangeEnd: 4,
      title: 'Post-Meal Spike',
      description: 'Insulin is at its highest, processing and directing glucose into storage',
      biologicalProcesses: [],
      scientificSources: [],
    },
    {
      id: 1,
      hourRangeStart: 4,
      hourRangeEnd: 8,
      title: 'Insulin Shift',
      description: 'Insulin levels begin their descent, closing the door on bulk energy storage',
      biologicalProcesses: [],
      scientificSources: [],
    },
    {
      id: 2,
      hourRangeStart: 8,
      hourRangeEnd: 12,
      title: 'Glycogen Utilization',
      description: 'Liver glycogen becomes the primary fuel source to maintain stable blood glucose',
      biologicalProcesses: [],
      scientificSources: [],
    },
    {
      id: 3,
      hourRangeStart: 12,
      hourRangeEnd: 18,
      title: 'Fatty Acid Release',
      description: 'Fat breakdown accelerates (lipolysis) to release fatty acids for energy',
      biologicalProcesses: [],
      scientificSources: [],
    },
    {
      id: 4,
      hourRangeStart: 18,
      hourRangeEnd: 24,
      title: 'Adrenaline Boost',
      description: 'Norepinephrine (Adrenaline) levels rise to maintain alertness and metabolic rate',
      biologicalProcesses: [],
      scientificSources: [],
    },
    {
      id: 5,
      hourRangeStart: 24,
      hourRangeEnd: 36,
      title: 'Gluconeogenesis Peak',
      description: 'Glucose creation from fat (glycerol) and protein becomes the main source of glucose',
      biologicalProcesses: [],
      scientificSources: [],
    },
    {
      id: 6,
      hourRangeStart: 36,
      hourRangeEnd: 48,
      title: 'Early HGH Surge',
      description: 'Growth Hormone (HGH) levels ramp up, initiating the anti-catabolic defense',
      biologicalProcesses: [],
      scientificSources: [],
    },
    {
      id: 7,
      hourRangeStart: 48,
      hourRangeEnd: 72,
      title: 'Ketosis and HGH Peak',
      description: 'Ketone production is established, and HGH surges dramatically (up to 500% increase)',
      biologicalProcesses: [],
      scientificSources: [],
    },
    {
      id: 8,
      hourRangeStart: 72,
      hourRangeEnd: 120,
      title: 'Autophagy Activation',
      description: 'Cellular cleanup (autophagy) reaches full activity for maximized systemic repair',
      biologicalProcesses: [],
      scientificSources: [],
    },
    {
      id: 9,
      hourRangeStart: 120,
      hourRangeEnd: null,
      title: 'Protein Conservation',
      description: 'The body enters the maximal protein-sparing state, conserving lean mass',
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

  test('should render all 10 stages', () => {
    // Mock timeline state for 14-hour fast (stage 3: 12-18hrs)
    useStageCalculation.mockReturnValue({
      currentStageIndex: 3,
      elapsedHours: 14,
      progressWithinStage: 0.33,
      hoursIntoStage: 2,
      stagesCompleted: [FASTING_STAGES[0], FASTING_STAGES[1], FASTING_STAGES[2]],
      stagesUpcoming: [FASTING_STAGES[4], FASTING_STAGES[5], FASTING_STAGES[6], FASTING_STAGES[7], FASTING_STAGES[8], FASTING_STAGES[9]],
      currentStage: FASTING_STAGES[3],
    });

    render(<BiologicalStagesTimeline elapsedMs={14 * 60 * 60 * 1000} />);
    
    // Check that all 10 stages are rendered
    expect(screen.getByTestId('stage-card-0')).toBeInTheDocument();
    expect(screen.getByTestId('stage-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('stage-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('stage-card-3')).toBeInTheDocument();
    expect(screen.getByTestId('stage-card-4')).toBeInTheDocument();
    expect(screen.getByTestId('stage-card-5')).toBeInTheDocument();
    expect(screen.getByTestId('stage-card-6')).toBeInTheDocument();
    expect(screen.getByTestId('stage-card-7')).toBeInTheDocument();
    expect(screen.getByTestId('stage-card-8')).toBeInTheDocument();
    expect(screen.getByTestId('stage-card-9')).toBeInTheDocument();
    
    // Verify completed stages have checkmarks
    const stage0 = screen.getByTestId('stage-card-0');
    expect(stage0).toHaveTextContent('✓');
    
    const stage1 = screen.getByTestId('stage-card-1');
    expect(stage1).toHaveTextContent('✓');
    
    const stage2 = screen.getByTestId('stage-card-2');
    expect(stage2).toHaveTextContent('✓');
    
    // Verify current stage does NOT have checkmark
    const stage3 = screen.getByTestId('stage-card-3');
    expect(stage3).not.toHaveTextContent('✓');
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
