import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, TrendingUp, Clock, Target, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

interface AnalyticsTabProps {
  userId: string;
}

const COLORS = ["hsl(221, 83%, 53%)", "hsl(142, 76%, 36%)", "hsl(199, 89%, 48%)", "hsl(0, 84%, 60%)", "hsl(280, 65%, 60%)"];

const AnalyticsTab = ({ userId }: AnalyticsTabProps) => {
  const [stats, setStats] = useState({
    totalConversations: 0,
    totalMessages: 0,
    avgMessagesPerConvo: 0,
    intentDistribution: [] as { name: string; value: number }[],
    dailyActivity: [] as { date: string; messages: number }[],
  });
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, [userId]);

  const loadAnalytics = async () => {
    try {
      // Get total conversations
      const { count: conversationCount } = await supabase
        .from("conversations")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      // Get all messages
      const { data: messages, error: messagesError } = await supabase
        .from("messages")
        .select("*, conversations!inner(user_id)")
        .eq("conversations.user_id", userId);

      if (messagesError) throw messagesError;

      const totalMessages = messages?.length || 0;
      const avgMessages = conversationCount ? totalMessages / conversationCount : 0;

      // Intent distribution
      const intentCounts: { [key: string]: number } = {};
      messages?.forEach((msg) => {
        if (msg.intent) {
          intentCounts[msg.intent] = (intentCounts[msg.intent] || 0) + 1;
        }
      });

      const intentDistribution = Object.entries(intentCounts).map(([name, value]) => ({
        name: name.replace(/_/g, " "),
        value,
      }));

      // Daily activity (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split("T")[0];
      });

      const dailyActivity = last7Days.map((date) => {
        const count = messages?.filter((msg) => msg.created_at.startsWith(date)).length || 0;
        return {
          date: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
          messages: count,
        };
      });

      setStats({
        totalConversations: conversationCount || 0,
        totalMessages,
        avgMessagesPerConvo: Number(avgMessages.toFixed(1)),
        intentDistribution,
        dailyActivity,
      });
    } catch (error: any) {
      console.error("Error loading analytics:", error);
      toast({
        title: "Failed to load analytics",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-background via-primary/5 to-secondary/5 p-6 overflow-auto">
      <div className="container max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">Track your AI assistant performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="shadow-elevated border-border/50 hover:shadow-card transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Conversations
                </CardTitle>
                <MessageSquare className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalConversations}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="shadow-elevated border-border/50 hover:shadow-card transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Messages
                </CardTitle>
                <TrendingUp className="w-4 h-4 text-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalMessages}</div>
              <p className="text-xs text-muted-foreground mt-1">Sent & received</p>
            </CardContent>
          </Card>

          <Card className="shadow-elevated border-border/50 hover:shadow-card transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg Messages
                </CardTitle>
                <BarChart3 className="w-4 h-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.avgMessagesPerConvo}</div>
              <p className="text-xs text-muted-foreground mt-1">Per conversation</p>
            </CardContent>
          </Card>

          <Card className="shadow-elevated border-border/50 hover:shadow-card transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Top Intent
                </CardTitle>
                <Target className="w-4 h-4 text-destructive" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold truncate">
                {stats.intentDistribution[0]?.name || "N/A"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.intentDistribution[0]?.value || 0} queries
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Activity */}
          <Card className="shadow-elevated border-border/50">
            <CardHeader>
              <CardTitle>Daily Activity</CardTitle>
              <CardDescription>Messages sent over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.dailyActivity}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="messages" 
                    stroke="hsl(221, 83%, 53%)" 
                    strokeWidth={3}
                    dot={{ fill: "hsl(221, 83%, 53%)", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Intent Distribution */}
          <Card className="shadow-elevated border-border/50">
            <CardHeader>
              <CardTitle>Intent Distribution</CardTitle>
              <CardDescription>Breakdown of query types</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.intentDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.intentDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.intentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No intent data available yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Intent Breakdown */}
          <Card className="shadow-elevated border-border/50 lg:col-span-2">
            <CardHeader>
              <CardTitle>Intent Breakdown</CardTitle>
              <CardDescription>Detailed view of all query intents</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.intentDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.intentDistribution}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {stats.intentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No intent data available yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;
