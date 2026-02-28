'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const statusColors: Record<string, string> = {
  APPLIED: 'secondary',
  SHORTLISTED: 'warning',
  REJECTED: 'destructive',
  SELECTED: 'success',
  OFFERED: 'success',
};

export default function ApplicationsPage() {
  const { accessToken } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => api.get('/applications/me', accessToken!),
  });

  const applications = data?.data?.data || data?.data || [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Applications</h1>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : applications.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No applications yet. Browse eligible jobs to apply.
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app: any) => (
            <Card key={app.id}>
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{app.jobPosting?.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {app.jobPosting?.company?.name} - {app.jobPosting?.location}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                    <span>{app.jobPosting?.jobType}</span>
                    {app.jobPosting?.salary && <span>{app.jobPosting.salary}</span>}
                    <span>Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
                  </div>
                  {app.roundResults?.length > 0 && (
                    <div className="flex items-center space-x-2 mt-3">
                      {app.roundResults.map((rr: any) => (
                        <Badge
                          key={rr.id}
                          variant={rr.passed ? 'success' : rr.passed === false ? 'destructive' : 'outline'}
                        >
                          {rr.round?.title || rr.round?.roundType}
                          {rr.score != null && ` (${rr.score})`}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Badge variant={(statusColors[app.status] as any) || 'secondary'}>
                  {app.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
