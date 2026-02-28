'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function StudentDashboard() {
  const { accessToken } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: () => api.get('/dashboard/student', accessToken!),
    enabled: !!accessToken,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No data available.</p>
      </div>
    );
  }

  const profileCompletion = data.profileCompletion || 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Student Dashboard</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="bg-primary h-3 rounded-full transition-all"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            <span className="text-sm font-medium">{profileCompletion}%</span>
          </div>
          {profileCompletion < 100 && (
            <p className="text-sm text-muted-foreground mt-2">
              Complete your profile to become eligible for more opportunities.{' '}
              <Link href="/profile" className="text-primary underline">
                Update Profile
              </Link>
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Eligible Opportunities</CardDescription>
            <CardTitle className="text-3xl">{data.eligibleDrives ?? 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/opportunities" className="text-sm text-primary underline">
              View Opportunities
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Applied</CardDescription>
            <CardTitle className="text-3xl">{data.appliedDrives ?? 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/applications" className="text-sm text-primary underline">
              View Applications
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Offer Status</CardDescription>
            <CardTitle className="text-xl">
              {data.offerStatus ? (
                <Badge variant="success">{data.offerStatus}</Badge>
              ) : (
                <span className="text-muted-foreground text-base">No offers yet</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Keep applying!</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            {data.interviews && data.interviews.length > 0 ? (
              <div className="space-y-3">
                {data.interviews.map((interview: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium text-sm">{interview.companyName}</p>
                      <p className="text-xs text-muted-foreground">{interview.roleTitle}</p>
                    </div>
                    <Badge variant="outline">{interview.round || interview.status}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming interviews.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            {data.announcements && data.announcements.length > 0 ? (
              <div className="space-y-3">
                {data.announcements.slice(0, 3).map((ann: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{ann.title}</p>
                      {ann.isPinned && <Badge variant="warning">Pinned</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{ann.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No announcements.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const { accessToken } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.get('/dashboard/admin', accessToken!),
    enabled: !!accessToken,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No data available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/students">Manage Students</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/opportunities/create">Create Opportunity</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Students</CardDescription>
            <CardTitle className="text-3xl">{data.totalStudents ?? 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Placed</CardDescription>
            <CardTitle className="text-3xl">{data.totalPlaced ?? 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Placement %</CardDescription>
            <CardTitle className="text-3xl">
              {data.placementPercentage != null
                ? `${Number(data.placementPercentage).toFixed(1)}%`
                : '0%'}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg CTC</CardDescription>
            <CardTitle className="text-3xl">
              {data.avgCTC != null ? `${Number(data.avgCTC).toFixed(1)} LPA` : '--'}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Branch-wise Placements</CardTitle>
          </CardHeader>
          <CardContent>
            {data.branchWise && data.branchWise.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.branchWise}>
                  <XAxis dataKey="branch" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" name="Total" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="placed" fill="hsl(142, 71%, 45%)" name="Placed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">No branch data available.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Company-wise Placements</CardTitle>
          </CardHeader>
          <CardContent>
            {data.companyWise && data.companyWise.length > 0 ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                <div className="grid grid-cols-3 text-xs font-medium text-muted-foreground border-b pb-2">
                  <span>Company</span>
                  <span className="text-center">Hired</span>
                  <span className="text-right">Avg CTC</span>
                </div>
                {data.companyWise.map((c: any, idx: number) => (
                  <div key={idx} className="grid grid-cols-3 text-sm py-1.5 border-b last:border-0">
                    <span className="font-medium truncate">{c.company}</span>
                    <span className="text-center">{c.count}</span>
                    <span className="text-right">{c.avgCTC ? `${Number(c.avgCTC).toFixed(1)} LPA` : '--'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No company data available.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Opportunities</CardDescription>
            <CardTitle className="text-3xl">{data.activeOpportunities ?? 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/admin/opportunities" className="text-sm text-primary underline">
              View All
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Upcoming Interviews</CardDescription>
            <CardTitle className="text-3xl">{data.upcomingInterviews ?? 0}</CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (user.role === 'STUDENT') {
    return <StudentDashboard />;
  }

  return <AdminDashboard />;
}
