
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Clock, CheckCircle, Target, Zap } from "lucide-react";

export const AnalyticsView = () => {
  // Mock data for analytics
  const stats = {
    tasksCompleted: 24,
    tasksTotal: 32,
    completionRate: 75,
    avgCompletionTime: 45,
    energyLevel: 78,
    streakDays: 7,
  };

  const weeklyData = [
    { day: "Mon", completed: 4, planned: 5 },
    { day: "Tue", completed: 3, planned: 4 },
    { day: "Wed", completed: 5, planned: 6 },
    { day: "Thu", completed: 2, planned: 3 },
    { day: "Fri", completed: 6, planned: 7 },
    { day: "Sat", completed: 2, planned: 3 },
    { day: "Sun", completed: 2, planned: 4 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Analytics & Reports</h1>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tasksCompleted}/{stats.tasksTotal}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline w-3 h-3 mr-1" />
              +12% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <Progress value={stats.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgCompletionTime}min</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="inline w-3 h-3 mr-1" />
              -5min from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Energy Level</CardTitle>
            <Zap className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.energyLevel}%</div>
            <Progress value={stats.energyLevel} className="mt-2" />
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
                    <Progress value={(day.planned / 7) * 100} className="h-2" />
                    <Progress 
                      value={(day.completed / 7) * 100} 
                      className="h-2 absolute top-0 bg-green-500" 
                    />
                  </div>
                </div>
                <Badge variant={day.completed >= day.planned ? "default" : "secondary"}>
                  {Math.round((day.completed / day.planned) * 100)}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Energy Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Energy Trends</CardTitle>
            <CardDescription>Your energy levels throughout the week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => {
                const energy = Math.floor(Math.random() * 40) + 60; // Mock data
                return (
                  <div key={day} className="flex items-center gap-4">
                    <div className="w-12 text-sm font-medium">{day}</div>
                    <div className="flex-1">
                      <Progress value={energy} className="h-3" />
                    </div>
                    <div className="w-12 text-sm text-right">{energy}%</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productivity Insights</CardTitle>
            <CardDescription>AI-powered recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Great Progress!</p>
                    <p className="text-sm text-green-700">You're completing tasks 15% faster than last week.</p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Peak Hours</p>
                    <p className="text-sm text-blue-700">You're most productive between 10-12 AM.</p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-orange-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-800">Energy Tip</p>
                    <p className="text-sm text-orange-700">Consider scheduling lighter tasks after 3 PM.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
