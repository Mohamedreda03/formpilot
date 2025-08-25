"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Workflow,
  FileText,
  BarChart3,
  Users,
  Zap,
  TrendingUp,
  Settings,
  LogOut,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const stats = [
    {
      title: "Total Forms",
      value: "8",
      change: "+2 this month",
      icon: <FileText className="h-6 w-6" />,
      trend: "up",
    },
    {
      title: "Active Workflows",
      value: "3",
      change: "+1 this week",
      icon: <Workflow className="h-6 w-6" />,
      trend: "up",
    },
    {
      title: "Total Submissions",
      value: "847",
      change: "+127 this week",
      icon: <BarChart3 className="h-6 w-6" />,
      trend: "up",
    },
    {
      title: "Team Members",
      value: "5",
      change: "+1 this month",
      icon: <Users className="h-6 w-6" />,
      trend: "up",
    },
  ];

  const quickActions = [
    {
      title: "Create New Form",
      description: "Build a new form from scratch",
      icon: <Plus className="h-8 w-8" />,
      href: "/create-form",
      color: "bg-blue-500",
    },
    {
      title: "Manage Workflows",
      description: "Configure automation workflows",
      icon: <Workflow className="h-8 w-8" />,
      href: "/wf",
      color: "bg-purple-500",
    },
    {
      title: "View Analytics",
      description: "Analyze form performance",
      icon: <BarChart3 className="h-8 w-8" />,
      href: "/analytics",
      color: "bg-green-500",
    },
    {
      title: "Team Settings",
      description: "Manage team and permissions",
      icon: <Users className="h-8 w-8" />,
      href: "/settings",
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-xl font-bold">FormPilot</h1>
              <p className="text-xs text-muted-foreground">SaaS Platform</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Welcome back, {user.name}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome to FormPilot
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create powerful forms, automate workflows, and analyze results - all
            in one platform
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <div className="flex items-center gap-1 text-sm">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-green-600">{stat.change}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded-full">{stat.icon}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Quick Actions</h2>
            <p className="text-muted-foreground">
              Get started with these common tasks
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary"
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div
                    className={`${action.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto text-white group-hover:scale-110 transition-transform`}
                  >
                    {action.icon}
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                  <Button asChild className="w-full">
                    <Link href={action.href}>Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="p-2 bg-blue-100 rounded-full">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">New form created</p>
                  <p className="text-sm text-muted-foreground">
                    "Contact Form" was created 2 hours ago
                  </p>
                </div>
                <Badge>New</Badge>
              </div>

              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Workflow className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Workflow triggered</p>
                  <p className="text-sm text-muted-foreground">
                    "Email Notification" workflow ran successfully
                  </p>
                </div>
                <Badge variant="outline">Success</Badge>
              </div>

              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="p-2 bg-green-100 rounded-full">
                  <BarChart3 className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">New submissions</p>
                  <p className="text-sm text-muted-foreground">
                    12 new form submissions received today
                  </p>
                </div>
                <Badge variant="secondary">Today</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card className="bg-gradient-to-r from-primary/10 to-purple-600/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Next Steps
            </CardTitle>
            <CardDescription>
              Complete these actions to get the most out of FormPilot
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <h4 className="font-medium">Account Setup</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your account is ready to use!
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm">1</span>
                  </div>
                  <h4 className="font-medium">Create Your First Form</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Start building forms with our drag-and-drop editor
                </p>
                <Button size="sm" asChild>
                  <Link href="/create-form">Create Form</Link>
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 text-sm">2</span>
                  </div>
                  <h4 className="font-medium">Set Up Workflows</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Automate your form processing
                </p>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/wf">Manage Workflows</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
