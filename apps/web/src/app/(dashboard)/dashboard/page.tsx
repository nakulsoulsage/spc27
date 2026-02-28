'use client';

import { useAuthStore } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Users, FileText, Building2, TrendingUp } from 'lucide-react';

function StudentDashboard({ token }: { token: string }) {
  const { data: applications } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => api.get('/applications/me', token),
  });

  const { data: jobs } = useQuery({
    queryKey: ['eligible-jobs'],
    queryFn: () => api.get('/jobs/eligible', token),
  });

  const apps = applications?.data?.data || applications?.data || [];
  const eligibleJobs = jobs?.data || jobs || [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Student Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eligible Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Array.isArray(eligibleJobs) ? eligibleJobs.length : 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Array.isArray(apps) ? apps.length : 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offers</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.isArray(apps) ? apps.filter((a: any) => a.status === 'OFFERED').length : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {Array.isArray(apps) && apps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {apps.slice(0, 5).map((app: any) => (
                <div key={app.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{app.jobPosting?.title}</p>
                    <p className="text-sm text-muted-foreground">{app.jobPosting?.company?.name}</p>
                  </div>
                  <Badge variant={
                    app.status === 'OFFERED' ? 'success' :
                    app.status === 'REJECTED' ? 'destructive' :
                    app.status === 'SHORTLISTED' ? 'warning' : 'secondary'
                  }>
                    {app.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TPODashboard({ token, institutionId }: { token: string; institutionId: string }) {
  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: () => api.get('/students?limit=5', token),
  });

  const { data: jobs } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => api.get('/jobs?limit=5', token),
  });

  const studentCount = students?.data?.meta?.total || students?.meta?.total || 0;
  const jobCount = jobs?.data?.meta?.total || jobs?.meta?.total || 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">TPO Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Drives</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Placement Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function RecruiterDashboard({ token }: { token: string }) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Recruiter Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Job Postings</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offers Made</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, accessToken } = useAuthStore();

  if (!user || !accessToken) return null;

  switch (user.role) {
    case 'STUDENT':
      return <StudentDashboard token={accessToken} />;
    case 'TPO':
    case 'SUPER_ADMIN':
      return <TPODashboard token={accessToken} institutionId={user.institutionId} />;
    case 'RECRUITER':
      return <RecruiterDashboard token={accessToken} />;
    default:
      return (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Welcome, {user.firstName}!</h1>
          <p className="text-muted-foreground">Dashboard for {user.role} coming soon.</p>
        </div>
      );
  }
}
