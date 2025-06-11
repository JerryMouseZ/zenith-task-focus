import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AnalyticsView } from '../AnalyticsView';
import { useTasks } from '@/hooks/useTasks';

// Mock the useTasks hook
jest.mock('@/hooks/useTasks');

// Mock a specific date for consistent testing of weekly data
const MOCK_CURRENT_DATE = new Date('2024-07-15T10:00:00.000Z'); // This is a Monday

describe('AnalyticsView', () => {
  let originalDateNow: () => number;

  beforeEach(() => {
    // Mock Date.now() for consistent week calculation
    originalDateNow = Date.now;
    Date.now = jest.fn(() => MOCK_CURRENT_DATE.getTime());

    // Reset mocks for each test
    (useTasks as jest.Mock).mockClear();
  });

  afterEach(() => {
    // Restore original Date.now
    Date.now = originalDateNow;
  });

  test('renders loading state', () => {
    (useTasks as jest.Mock).mockReturnValue({
      tasks: [],
      isLoading: true,
      error: null,
    });
    render(<AnalyticsView />);
    expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
  });

  test('renders error state', () => {
    (useTasks as jest.Mock).mockReturnValue({
      tasks: [],
      isLoading: false,
      error: new Error('Failed to fetch'),
    });
    render(<AnalyticsView />);
    expect(screen.getByText('Error loading data.')).toBeInTheDocument();
  });

  describe('Statistics Calculations and Display', () => {
    test('calculates and displays basic stats correctly with no tasks', () => {
      (useTasks as jest.Mock).mockReturnValue({
        tasks: [],
        isLoading: false,
        error: null,
      });
      render(<AnalyticsView />);
      expect(screen.getByText('Tasks Completed')).toBeInTheDocument();
      expect(screen.getByText('0/0')).toBeInTheDocument();
      expect(screen.getByText('Completion Rate')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
      expect(screen.getByText('Avg. Time')).toBeInTheDocument();
      expect(screen.getByText('0min')).toBeInTheDocument();
    });

    test('calculates and displays stats for tasks with some completed', () => {
      const mockTasks = [
        { id: '1', title: 'Task 1', status: 'completed', actualTime: 30, dueDate: '2024-07-15', updatedAt: '2024-07-15' },
        { id: '2', title: 'Task 2', status: 'pending', actualTime: null, dueDate: '2024-07-16', updatedAt: '2024-07-15' },
        { id: '3', title: 'Task 3', status: 'completed', actualTime: 60, dueDate: '2024-07-17', updatedAt: '2024-07-17' },
        { id: '4', title: 'Task 4', status: 'completed', actualTime: null, dueDate: '2024-07-18', updatedAt: '2024-07-18' }, // Completed but no actual time
      ];
      (useTasks as jest.Mock).mockReturnValue({
        tasks: mockTasks,
        isLoading: false,
        error: null,
      });
      render(<AnalyticsView />);
      expect(screen.getByText('3/4')).toBeInTheDocument(); // Tasks Completed / Total
      expect(screen.getByText('75%')).toBeInTheDocument(); // Completion Rate (3/4 * 100)
      // Avg completion time: (30 + 60 + 0) / 3 = 30. (Task 4 has null actualTime)
      expect(screen.getByText('30min')).toBeInTheDocument(); // Avg. Time
    });

     test('calculates and displays stats with no completed tasks', () => {
      const mockTasks = [
        { id: '1', title: 'Task 1', status: 'pending', actualTime: null, dueDate: '2024-07-15', updatedAt: '2024-07-15' },
        { id: '2', title: 'Task 2', status: 'in_progress', actualTime: null, dueDate: '2024-07-16', updatedAt: '2024-07-15' },
      ];
      (useTasks as jest.Mock).mockReturnValue({
        tasks: mockTasks,
        isLoading: false,
        error: null,
      });
      render(<AnalyticsView />);
      expect(screen.getByText('0/2')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
      expect(screen.getByText('0min')).toBeInTheDocument();
    });
  });

  describe('Weekly Overview Calculations and Display', () => {
    // Helper to get dates for the mock week (July 15-21, 2024)
    const getDateForDay = (dayIndex: number) => { // 0 = Monday, 6 = Sunday
        const date = new Date(MOCK_CURRENT_DATE);
        date.setDate(MOCK_CURRENT_DATE.getDate() + dayIndex);
        return date.toISOString().split('T')[0];
    };

    const monday = getDateForDay(0); // 2024-07-15
    const wednesday = getDateForDay(2); // 2024-07-17
    const friday = getDateForDay(4); // 2024-07-19
    const nextMonday = getDateForDay(7); // 2024-07-22 (outside current week)


    test('processes weekly data correctly with various tasks', () => {
      const mockTasks = [
        // Planned & Completed in current week
        { id: '1', title: 'Mon Task P&C', status: 'completed', actualTime: 30, dueDate: monday, updatedAt: monday },
        // Planned in current week, not completed
        { id: '2', title: 'Wed Task P', status: 'pending', actualTime: null, dueDate: wednesday, updatedAt: wednesday },
        // Completed in current week, dueDate also in current week
        { id: '3', title: 'Fri Task C', status: 'completed', actualTime: 60, dueDate: friday, updatedAt: friday },
        // Planned for next week
        { id: '4', title: 'Next Mon P', status: 'pending', actualTime: null, dueDate: nextMonday, updatedAt: nextMonday },
        // Completed, but updatedAt is outside this week (e.g. last week)
        { id: '5', title: 'Old Completed', status: 'completed', actualTime: 50, dueDate: '2024-07-10', updatedAt: '2024-07-10'},
         // Planned for current week, completed on a different day in current week
        { id: '6', title: 'Mon Plan, Wed Comp', status: 'completed', actualTime: 40, dueDate: monday, updatedAt: wednesday },
      ];
      (useTasks as jest.Mock).mockReturnValue({
        tasks: mockTasks,
        isLoading: false,
        error: null,
      });
      render(<AnalyticsView />);

      // Check Monday
      const monRow = screen.getByText('Mon').closest('div.flex.items-center.gap-4');
      expect(monRow).toHaveTextContent('Completed: 1'); // Task 1 only (Task 6 completed on Wed)
      expect(monRow).toHaveTextContent('Planned: 2'); // Task 1, Task 6

      // Check Wednesday
      const wedRow = screen.getByText('Wed').closest('div.flex.items-center.gap-4');
      expect(wedRow).toHaveTextContent('Completed: 1'); // Task 6 (Task 3 is Fri)
      expect(wedRow).toHaveTextContent('Planned: 1'); // Task 2 (Task 6 planned for Mon)

      // Check Friday
      const friRow = screen.getByText('Fri').closest('div.flex.items-center.gap-4');
      expect(friRow).toHaveTextContent('Completed: 1');
      expect(friRow).toHaveTextContent('Planned: 1');

      // Check Tuesday (should be 0/0)
      const tueRow = screen.getByText('Tue').closest('div.flex.items-center.gap-4');
      expect(tueRow).toHaveTextContent('Completed: 0');
      expect(tueRow).toHaveTextContent('Planned: 0');

      // Check that "Next Mon P" and "Old Completed" didn't affect current week counts
      // This is implicitly tested by the specific day checks above being accurate.
    });

    test('handles empty task list for weekly overview', () => {
      (useTasks as jest.Mock).mockReturnValue({
        tasks: [],
        isLoading: false,
        error: null,
      });
      render(<AnalyticsView />);
      const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      dayLabels.forEach(label => {
        const dayRow = screen.getByText(label).closest('div.flex.items-center.gap-4');
        expect(dayRow).toHaveTextContent('Completed: 0');
        expect(dayRow).toHaveTextContent('Planned: 0');
      });
    });
  });
});
