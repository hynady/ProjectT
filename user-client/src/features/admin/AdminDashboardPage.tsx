import { useEffect, useState } from "react";
import { AdminDashboardLayout } from "./layouts/AdminDashboardLayout";
import { adminService } from "./services/admin.service";
import { OccaStatistics } from "./internal-types/admin.type";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/commons/components/card";
import { 
  Calendar,
  Ticket,
  Users,
  Clock,
  ArrowUp,
  ArrowUpRight,
  CheckCircle2,
  Clock4,
  XCircle
} from "lucide-react";
import { Skeleton } from "@/commons/components/skeleton";
import { ScrollArea } from "@/commons/components/scroll-area";
import { Badge } from "@/commons/components/badge";

const AdminDashboardPage = () => {
  const [stats, setStats] = useState<OccaStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await adminService.getDashboardStatistics();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Format date for activity items
  const formatActivityDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get activity badge variant
  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'occa_approved':
        return <Badge variant="success" className="ml-2">Approved</Badge>;
      case 'occa_rejected':
        return <Badge variant="destructive" className="ml-2">Rejected</Badge>;
      case 'occa_submitted':
        return <Badge variant="warning" className="ml-2">Pending</Badge>;
      case 'user_registered':
        return <Badge variant="outline" className="ml-2">New User</Badge>;
      default:
        return <Badge variant="secondary" className="ml-2">{type}</Badge>;
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to the admin dashboard</p>
        </header>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Total Events Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                  {loading ? (
                    <Skeleton className="h-9 w-16" />
                  ) : (
                    <p className="text-3xl font-bold">{stats?.totalOccas}</p>
                  )}
                </div>
                <div className="bg-primary/10 p-2 rounded-full">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-sm">
                <div className="text-green-500 flex items-center font-medium">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  <span>12%</span>
                </div>
                <span className="text-muted-foreground ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          {/* Total Users Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  {loading ? (
                    <Skeleton className="h-9 w-16" />
                  ) : (
                    <p className="text-3xl font-bold">{stats?.totalUsers}</p>
                  )}
                </div>
                <div className="bg-blue-500/10 p-2 rounded-full">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-sm">
                <div className="text-green-500 flex items-center font-medium">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span>8%</span>
                </div>
                <span className="text-muted-foreground ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          {/* Tickets Sold */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Tickets Sold</p>
                  {loading ? (
                    <Skeleton className="h-9 w-20" />
                  ) : (
                    <p className="text-3xl font-bold">{stats?.ticketsSold?.toLocaleString()}</p>
                  )}
                </div>
                <div className="bg-orange-500/10 p-2 rounded-full">
                  <Ticket className="w-5 h-5 text-orange-500" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-sm">
                <div className="text-green-500 flex items-center font-medium">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  <span>18%</span>
                </div>
                <span className="text-muted-foreground ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          {/* Total Revenue */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  {loading ? (
                    <Skeleton className="h-9 w-28" />
                  ) : (
                    <p className="text-3xl font-bold">
                      {stats?.totalRevenue 
                        ? stats.totalRevenue.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
                        : '0 ₫'}
                    </p>
                  )}
                </div>
                <div className="bg-green-500/10 p-2 rounded-full">
                  <div className="text-green-500">₫</div>
                </div>
              </div>
              <div className="mt-3 flex items-center text-sm">
                <div className="text-green-500 flex items-center font-medium">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span>24%</span>
                </div>
                <span className="text-muted-foreground ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Event Status Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pending Events */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="flex items-center text-sm font-medium text-amber-500">
                    <Clock4 className="h-4 w-4 mr-1" />
                    Pending Approval
                  </p>
                  {loading ? (
                    <Skeleton className="h-9 w-16" />
                  ) : (
                    <p className="text-2xl font-bold">{stats?.pendingOccas}</p>
                  )}
                </div>
                <div className="bg-amber-500/10 p-2 rounded-full">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
              </div>
              <div className="mt-3 text-sm">
                <span className="text-muted-foreground">Needs review</span>
              </div>
            </CardContent>
          </Card>

          {/* Approved Events */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="flex items-center text-sm font-medium text-green-500">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Approved Events
                  </p>
                  {loading ? (
                    <Skeleton className="h-9 w-16" />
                  ) : (
                    <p className="text-2xl font-bold">{stats?.approvedOccas}</p>
                  )}
                </div>
                <div className="bg-green-500/10 p-2 rounded-full">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
              </div>
              <div className="mt-3 text-sm">
                <span className="text-muted-foreground">Live on site</span>
              </div>
            </CardContent>
          </Card>

          {/* Rejected Events */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="flex items-center text-sm font-medium text-red-500">
                    <XCircle className="h-4 w-4 mr-1" />
                    Rejected Events
                  </p>
                  {loading ? (
                    <Skeleton className="h-9 w-16" />
                  ) : (
                    <p className="text-2xl font-bold">{stats?.rejectedOccas}</p>
                  )}
                </div>
                <div className="bg-red-500/10 p-2 rounded-full">
                  <XCircle className="w-5 h-5 text-red-500" />
                </div>
              </div>
              <div className="mt-3 text-sm">
                <span className="text-muted-foreground">Not approved</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            ) : (
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-6">
                  {stats?.recentActivity?.length ? (
                    stats.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex flex-col space-y-1">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <span className="font-medium">{activity.title}</span>
                            {getActivityBadge(activity.type)}
                          </div>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>by {activity.actor}</span>
                          <span>{formatActivityDate(activity.timestamp)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No recent activity</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminDashboardPage;
