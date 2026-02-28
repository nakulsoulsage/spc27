'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Briefcase, Building2, TrendingUp } from 'lucide-react';

export default function AnalyticsPage() {
  const { accessToken } = useAuthStore();

  const { data: studentsData } = useQuery({
    queryKey: ['analytics-students'],
    queryFn: () => api.get('/students?limit=1', accessToken!),
  });

  const { data: jobsData } = useQuery({
    queryKey: ['analytics-jobs'],
    queryFn: () => api.get('/jobs?limit=1', accessToken!),
  });

  const { data: companiesData } = useQuery({
    queryKey: ['analytics-companies'],
    queryFn: () => api.get('/companies?limit=1', accessToken!),
  });

  const studentCount = studentsData?.data?.meta?.total || studentsData?.meta?.total || 0;
  const jobCount = jobsData?.data?.meta?.total || jobsData?.meta?.total || 0;
  const companyCount = companiesData?.data?.meta?.total || companiesData?.meta?.total || 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>

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
            <CardTitle className="text-sm font-medium">Total Drives</CardTitle>
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
            <div className="text-2xl font-bold">{companyCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Placement Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Placement Trends</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
          Charts and detailed analytics will be added here.
        </CardContent>
      </Card>
    </div>
  );
}
