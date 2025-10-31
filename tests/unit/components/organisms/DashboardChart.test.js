import React from 'react';
import { render, screen } from '@testing-library/react';
import DashboardChart from '@/components/organisms/DashboardChart';

// Mock Recharts components
jest.mock('recharts', () => ({
  LineChart: ({ children, data }) => <div data-testid="line-chart" data-chart-data={JSON.stringify(data)}>{children}</div>,
  Line: ({ dataKey, stroke }) => <div data-testid="line" data-datakey={dataKey} data-stroke={stroke} />,
  XAxis: ({ dataKey, tickFormatter }) => <div data-testid="x-axis" data-datakey={dataKey} />,
  YAxis: ({ label }) => <div data-testid="y-axis" data-label={JSON.stringify(label)} />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: ({ content: Content }) => <div data-testid="tooltip">{Content ? <Content /> : null}</div>,
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn((date, formatStr) => {
    if (formatStr === 'MMM d, yyyy') {
      return 'Jan 30, 2025';
    }
    if (formatStr === 'MMM d') {
      return 'Jan 30';
    }
    return 'formatted-date';
  }),
}));

// Mock GlassmorphicCard
jest.mock('@/components/atoms/GlassmorphicCard', () => {
  return function GlassmorphicCard({ children, className }) {
    return <div data-testid="glassmorphic-card" className={className}>{children}</div>;
  };
});

describe('DashboardChart Component', () => {
  // Test data
  const createMockEntries = (count) => {
    const entries = [];
    for (let i = 0; i < count; i++) {
      entries.push({
        _id: `entry-${i}`,
        date: `2025-01-${String(i + 1).padStart(2, '0')}`,
        fastingDuration: 960 + (i * 30), // 16 hours + incremental
      });
    }
    return entries;
  };

  describe('Rendering', () => {
    it('should render the component with title', () => {
      const entries = createMockEntries(10);
      render(<DashboardChart entries={entries} />);
      
      expect(screen.getByText('Progress Chart')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      const entries = createMockEntries(10);
      const { container } = render(<DashboardChart entries={entries} className="custom-class" />);
      
      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('should handle undefined entries gracefully', () => {
      render(<DashboardChart entries={undefined} />);
      
      expect(screen.getByText('Progress Chart')).toBeInTheDocument();
      expect(screen.getByText(/Track Your Progress/i)).toBeInTheDocument();
    });

    it('should handle null entries gracefully', () => {
      render(<DashboardChart entries={null} />);
      
      expect(screen.getByText('Progress Chart')).toBeInTheDocument();
      expect(screen.getByText(/Track Your Progress/i)).toBeInTheDocument();
    });

    it('should handle empty entries array', () => {
      render(<DashboardChart entries={[]} />);
      
      expect(screen.getByText('Progress Chart')).toBeInTheDocument();
      expect(screen.getByText(/Track Your Progress/i)).toBeInTheDocument();
    });
  });

  describe('Chart Display (>=7 entries)', () => {
    it('should render Recharts components when there are 7+ entries', () => {
      const entries = createMockEntries(10);
      render(<DashboardChart entries={entries} />);
      
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getByTestId('line')).toBeInTheDocument();
      expect(screen.getByTestId('x-axis')).toBeInTheDocument();
      expect(screen.getByTestId('y-axis')).toBeInTheDocument();
      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });

    it('should render chart with exactly 7 entries', () => {
      const entries = createMockEntries(7);
      render(<DashboardChart entries={entries} />);
      
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
      expect(screen.queryByText(/Track Your Progress/i)).not.toBeInTheDocument();
    });

    it('should render chart with 30 entries', () => {
      const entries = createMockEntries(30);
      render(<DashboardChart entries={entries} />);
      
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should apply gradient to line stroke', () => {
      const entries = createMockEntries(10);
      render(<DashboardChart entries={entries} />);
      
      const line = screen.getByTestId('line');
      expect(line).toHaveAttribute('data-stroke', 'url(#lineGradient)');
    });

    it('should set hours as dataKey for Line', () => {
      const entries = createMockEntries(10);
      render(<DashboardChart entries={entries} />);
      
      const line = screen.getByTestId('line');
      expect(line).toHaveAttribute('data-datakey', 'hours');
    });

    it('should set date as dataKey for XAxis', () => {
      const entries = createMockEntries(10);
      render(<DashboardChart entries={entries} />);
      
      const xAxis = screen.getByTestId('x-axis');
      expect(xAxis).toHaveAttribute('data-datakey', 'date');
    });
  });

  describe('Empty State (<7 entries)', () => {
    it('should render empty state when there are fewer than 7 entries', () => {
      const entries = createMockEntries(5);
      render(<DashboardChart entries={entries} />);
      
      expect(screen.getByText(/Track Your Progress/i)).toBeInTheDocument();
      expect(screen.getByText(/Create 7\+ entries to see your fasting trends/i)).toBeInTheDocument();
      expect(screen.queryByTestId('responsive-container')).not.toBeInTheDocument();
    });

    it('should render empty state with 0 entries', () => {
      render(<DashboardChart entries={[]} />);
      
      expect(screen.getByText(/Track Your Progress/i)).toBeInTheDocument();
      expect(screen.getByText(/Start logging your fasts to visualize your progress/i)).toBeInTheDocument();
    });

    it('should show entry count when there are some entries but <7', () => {
      const entries = createMockEntries(3);
      render(<DashboardChart entries={entries} />);
      
      expect(screen.getByText(/You have 3 entries\. Keep going!/i)).toBeInTheDocument();
    });

    it('should show singular "entry" for 1 entry', () => {
      const entries = createMockEntries(1);
      render(<DashboardChart entries={entries} />);
      
      expect(screen.getByText(/You have 1 entry\. Keep going!/i)).toBeInTheDocument();
    });

    it('should render chart emoji in empty state', () => {
      const entries = createMockEntries(5);
      render(<DashboardChart entries={entries} />);
      
      expect(screen.getByText('📈')).toBeInTheDocument();
    });
  });

  describe('Data Transformation', () => {
    it('should convert fastingDuration from minutes to hours', () => {
      const entries = [
        { _id: '1', date: '2025-01-01', fastingDuration: 960 }, // 16 hours
        { _id: '2', date: '2025-01-02', fastingDuration: 720 }, // 12 hours
        { _id: '3', date: '2025-01-03', fastingDuration: 480 }, // 8 hours
        { _id: '4', date: '2025-01-04', fastingDuration: 1440 }, // 24 hours
        { _id: '5', date: '2025-01-05', fastingDuration: 600 }, // 10 hours
        { _id: '6', date: '2025-01-06', fastingDuration: 840 }, // 14 hours
        { _id: '7', date: '2025-01-07', fastingDuration: 1080 }, // 18 hours
      ];
      
      render(<DashboardChart entries={entries} />);
      
      const lineChart = screen.getByTestId('line-chart');
      const chartData = JSON.parse(lineChart.getAttribute('data-chart-data'));
      
      expect(chartData[0].hours).toBe(16.0);
      expect(chartData[1].hours).toBe(12.0);
      expect(chartData[2].hours).toBe(8.0);
      expect(chartData[3].hours).toBe(24.0);
      expect(chartData[4].hours).toBe(10.0);
      expect(chartData[5].hours).toBe(14.0);
      expect(chartData[6].hours).toBe(18.0);
    });

    it('should handle fractional hours correctly', () => {
      const entries = [
        { _id: '1', date: '2025-01-01', fastingDuration: 990 }, // 16.5 hours
        { _id: '2', date: '2025-01-02', fastingDuration: 750 }, // 12.5 hours
        { _id: '3', date: '2025-01-03', fastingDuration: 810 }, // 13.5 hours
        { _id: '4', date: '2025-01-04', fastingDuration: 930 }, // 15.5 hours
        { _id: '5', date: '2025-01-05', fastingDuration: 870 }, // 14.5 hours
        { _id: '6', date: '2025-01-06', fastingDuration: 1050 }, // 17.5 hours
        { _id: '7', date: '2025-01-07', fastingDuration: 1110 }, // 18.5 hours
      ];
      
      render(<DashboardChart entries={entries} />);
      
      const lineChart = screen.getByTestId('line-chart');
      const chartData = JSON.parse(lineChart.getAttribute('data-chart-data'));
      
      expect(chartData[0].hours).toBe(16.5);
      expect(chartData[1].hours).toBe(12.5);
      expect(chartData[2].hours).toBe(13.5);
    });

    it('should filter out entries with null fastingDuration', () => {
      const entries = [
        { _id: '1', date: '2025-01-01', fastingDuration: 960 },
        { _id: '2', date: '2025-01-02', fastingDuration: null },
        { _id: '3', date: '2025-01-03', fastingDuration: 720 },
        { _id: '4', date: '2025-01-04', fastingDuration: 480 },
        { _id: '5', date: '2025-01-05', fastingDuration: 600 },
        { _id: '6', date: '2025-01-06', fastingDuration: undefined },
        { _id: '7', date: '2025-01-07', fastingDuration: 840 },
        { _id: '8', date: '2025-01-08', fastingDuration: 1080 },
      ];
      
      render(<DashboardChart entries={entries} />);
      
      const lineChart = screen.getByTestId('line-chart');
      const chartData = JSON.parse(lineChart.getAttribute('data-chart-data'));
      
      // Should have 6 entries (8 minus 2 null/undefined)
      expect(chartData.length).toBe(6);
      expect(chartData.every(item => item.duration !== null && item.duration !== undefined)).toBe(true);
    });

    it('should sort chart data by date ascending', () => {
      const entries = [
        { _id: '1', date: '2025-01-05', fastingDuration: 600 },
        { _id: '2', date: '2025-01-01', fastingDuration: 960 },
        { _id: '3', date: '2025-01-07', fastingDuration: 1080 },
        { _id: '4', date: '2025-01-03', fastingDuration: 720 },
        { _id: '5', date: '2025-01-06', fastingDuration: 840 },
        { _id: '6', date: '2025-01-02', fastingDuration: 480 },
        { _id: '7', date: '2025-01-04', fastingDuration: 1440 },
      ];
      
      render(<DashboardChart entries={entries} />);
      
      const lineChart = screen.getByTestId('line-chart');
      const chartData = JSON.parse(lineChart.getAttribute('data-chart-data'));
      
      expect(chartData[0].date).toBe('2025-01-01');
      expect(chartData[1].date).toBe('2025-01-02');
      expect(chartData[2].date).toBe('2025-01-03');
      expect(chartData[3].date).toBe('2025-01-04');
      expect(chartData[4].date).toBe('2025-01-05');
      expect(chartData[5].date).toBe('2025-01-06');
      expect(chartData[6].date).toBe('2025-01-07');
    });
  });

  describe('GlassmorphicCard Usage', () => {
    it('should wrap chart in GlassmorphicCard when displaying chart', () => {
      const entries = createMockEntries(10);
      render(<DashboardChart entries={entries} />);
      
      const cards = screen.getAllByTestId('glassmorphic-card');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should wrap empty state in GlassmorphicCard', () => {
      const entries = createMockEntries(5);
      render(<DashboardChart entries={entries} />);
      
      expect(screen.getByTestId('glassmorphic-card')).toBeInTheDocument();
    });
  });
});
