import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare, TrendingUp, Users, Bot } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface AnalyticsData {
  totalMessages: number;
  totalConversations: number;
  totalUsers: number;
  intentBreakdown: { intent: string; count: number }[];
  recentActivity: any[];
}

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalMessages: 0,
    totalConversations: 0,
    totalUsers: 0,
    intentBreakdown: [],
    recentActivity: [],
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  const checkAdminAndLoadData = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Check if user is admin
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .single();

      if (!roles) {
        toast({
          title: "Access denied",
          description: "Admin privileges required",
          variant: "destructive",
        });
        navigate("/chat");
        return;
      }

      setIsAdmin(true);
      await loadAnalytics();
    } catch (error: any) {
      console.error("Error checking admin status:", error);
      navigate("/chat");
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      // Total messages
      const { count: messageCount } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true });

      // Total conversations
      const { count: conversationCount } = await supabase
        .from("conversations")
        .select("*", { count: "exact", head: true });

      // Total users
      const { count: userCount } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true });

      // Intent breakdown
      const { data: intentData } = await supabase
        .from("messages")
        .select("intent")
        .not("intent", "is", null);

      const intentCounts = intentData?.reduce((acc: any, curr: any) => {
        acc[curr.intent] = (acc[curr.intent] || 0) + 1;
        return acc;
      }, {});

      const intentBreakdown = Object.entries(intentCounts || {}).map(([intent, count]) => ({
        intent,
        count: count as number,
      }));

      // Recent activity
      const { data: recentActivity } = await supabase
        .from("analytics_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      setAnalytics({
        totalMessages: messageCount || 0,
        totalConversations: conversationCount || 0,
        totalUsers: userCount || 0,
        intentBreakdown: intentBreakdown || [],
        recentActivity: recentActivity || [],
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

  const seedFAQs = async () => {
    try {
      const { error } = await supabase.functions.invoke("seed-faqs");
      if (error) throw error;

      toast({
        title: "FAQs seeded successfully",
        description: "Real finance FAQs have been added to the database",
      });
    } catch (error: any) {
      console.error("Error seeding FAQs:", error);
      toast({
        title: "Failed to seed FAQs",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/50 p-6">
      <div className="container max-w-6xl mx-auto">
        <div className="mb-8">
          <Link to="/chat">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Chat
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-xl text-muted-foreground">Analytics and system management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalMessages}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversations</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalConversations}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Intent Types</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.intentBreakdown.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Intent Breakdown */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Intent Classification Breakdown</CardTitle>
            <CardDescription>Distribution of user query types</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.intentBreakdown.length === 0 ? (
              <p className="text-muted-foreground">No intent data available yet</p>
            ) : (
              <div className="space-y-2">
                {analytics.intentBreakdown
                  .sort((a, b) => b.count - a.count)
                  .map((item) => (
                    <div key={item.intent} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{item.intent}</Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${(item.count / analytics.totalMessages) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">{item.count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Actions</CardTitle>
            <CardDescription>System management and data operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">Seed FAQ Database</h4>
                  <p className="text-sm text-muted-foreground">
                    Add 50+ real finance FAQs to the database
                  </p>
                </div>
                <Button onClick={seedFAQs}>Seed FAQs</Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">View FAQs</h4>
                  <p className="text-sm text-muted-foreground">Browse the FAQ knowledge base</p>
                </div>
                <Link to="/faqs">
                  <Button variant="outline">View FAQs</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
