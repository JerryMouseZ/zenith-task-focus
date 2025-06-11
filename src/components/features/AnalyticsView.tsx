
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, CheckCircle, Target } from "lucide-react"; // Removed Zap and TrendingDown
import { useTasks } from "@/hooks/useTasks"; // Added useTasks import

export const AnalyticsView = () => {
  const { tasks, isLoading, error } = useTasks();

  if (isLoading) {
    return <p>Loading analytics...</p>;
  }

  if (error) {
    return <p>Error loading data.</p>;
  }

  const completedTasks = tasks.filter(task => task.status === 'completed');
  const tasksCompleted = completedTasks.length;
  const tasksTotal = tasks.length;
  const completionRate = tasksTotal > 0 ? (tasksCompleted / tasksTotal) * 100 : 0;

  const avgCompletionTime = completedTasks.length > 0
    ? completedTasks.reduce((sum, task) => sum + (task.actualTime || 0), 0) / completedTasks.length
    : 0;

  // --- Start of Weekly Data Calculation ---
  const getDayOfWeek = (date: Date): number => {
    // Sunday - 0, Monday - 1, ..., Saturday - 6
    // Adjust to Mon - 0, Sun - 6 for easier array indexing if needed
    const day = date.getDay();
    return day === 0 ? 6 : day - 1; // Mon:0, Tue:1, ..., Sun:6
  };

  const getStartOfWeek = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  };

  const today = new Date();
  const startOfWeek = getStartOfWeek(today);
  startOfWeek.setHours(0, 0, 0, 0); // Normalize to start of the day

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999); // Normalize to end of the day

  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const processedWeeklyData = dayLabels.map(label => ({
    day: label,
    planned: 0,
    completed: 0,
  }));

  tasks.forEach(task => {
    const taskDueDate = task.dueDate ? new Date(task.dueDate) : null;
    const taskUpdatedAt = task.updatedAt ? new Date(task.updatedAt) : null;

    // Check for planned tasks
    if (taskDueDate && taskDueDate >= startOfWeek && taskDueDate <= endOfWeek) {
      const dayIndex = getDayOfWeek(taskDueDate);
      if (processedWeeklyData[dayIndex]) {
        processedWeeklyData[dayIndex].planned++;
      }
    }

    // Check for completed tasks
    if (task.status === 'completed' && taskUpdatedAt && taskUpdatedAt >= startOfWeek && taskUpdatedAt <= endOfWeek) {
      const dayIndex = getDayOfWeek(taskUpdatedAt);
      if (processedWeeklyData[dayIndex]) {
        processedWeeklyData[dayIndex].completed++;
      }
    }
  });
  // --- End of Weekly Data Calculation ---

  // Use processedWeeklyData instead of mock weeklyData
  const weeklyData = processedWeeklyData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Analytics & Reports</h1>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Adjusted grid columns */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasksCompleted}/{tasksTotal}</div>
            {/* <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline w-3 h-3 mr-1" />
              +12% from last week
            </p> */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate.toFixed(0)}%</div>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgCompletionTime.toFixed(0)}min</div>
            {/* <p className="text-xs text-muted-foreground">
              <TrendingDown className="inline w-3 h-3 mr-1" />
              -5min from last week
            </p> */}
          </CardContent>
        </Card>
      </div>

      {/* Weekly Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Task Overview</CardTitle>
          <CardDescription>Tasks completed vs planned for this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weeklyData.map((day) => (
              <div key={day.day} className="flex items-center gap-4">
                <div className="w-12 text-sm font-medium">{day.day}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Completed: {day.completed}</span>
                    <span>Planned: {day.planned}</span>
                  </div>
                  <div className="relative">
                    {/* Max value for progress should be the max tasks on any day or a fixed sensible number */}
                    {/* For now, let's assume max planned/completed on a day won't exceed something like 10 for visualization */}
                    {/* Or, better, calculate progress as percentage of planned for that day */}
                    <Progress value={day.planned > 0 ? (day.planned / (day.planned + 5)) * 100 : 0} className="h-2" />
                    <Progress 
                      value={day.planned > 0 ? (day.completed / day.planned) * 100 : (day.completed > 0 ? 100 : 0)}
                      className="h-2 absolute top-0 bg-green-500" 
                    />
                  </div>
                </div>
                <Badge variant={day.completed >= day.planned && day.planned > 0 ? "default" : "secondary"}>
                  {day.planned > 0 ? `${Math.round((day.completed / day.planned) * 100)}%` : (day.completed > 0 ? '100%' : '0%')}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Productivity Insights section removed */}
    </div>
  );
};
