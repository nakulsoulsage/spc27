'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const statusBadgeVariant = (status: string) => {
  switch (status) {
    case 'APPLIED': return 'default' as const;
    case 'SHORTLISTED': return 'warning' as const;
    case 'ROUND1':
    case 'ROUND2':
    case 'ROUND3': return 'secondary' as const;
    case 'OFFERED': return 'success' as const;
    case 'REJECTED': return 'destructive' as const;
    default: return 'outline' as const;
  }
};

const statusLabel = (status: string) => {
  switch (status) {
    case 'APPLIED': return 'Applied';
    case 'SHORTLISTED': return 'Shortlisted';
    case 'ROUND1': return 'Round 1';
    case 'ROUND2': return 'Round 2';
    case 'ROUND3': return 'Round 3';
    case 'OFFERED': return 'Offered';
    case 'REJECTED': return 'Rejected';
    default: return status;
  }
};

export default function ApplicationsPage() {
  const { accessToken } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => api.get('/applications/me', accessToken!),
    enabled: !!accessToken,
  });

  const applications = data?.data || [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Applications</h1>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : applications.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No applications yet.{' '}
          <Link href="/opportunities" className="text-primary underline">
            Browse eligible opportunities
          </Link>{' '}
          to apply.
        </div>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left font-medium">Company</th>
                <th className="p-3 text-left font-medium">Role</th>
                <th className="p-3 text-left font-medium">Applied Date</th>
                <th className="p-3 text-left font-medium">Status</th>
                <th className="p-3 text-left font-medium">Current Round</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app: any) => {
                const opp = app.opportunity || {};
                return (
                  <tr key={app.id} className="border-b hover:bg-muted/30">
                    <td className="p-3 font-medium">{opp.companyName || '--'}</td>
                    <td className="p-3">{opp.roleTitle || '--'}</td>
                    <td className="p-3">
                      {app.createdAt
                        ? new Date(app.createdAt).toLocaleDateString()
                        : '--'}
                    </td>
                    <td className="p-3">
                      <Badge variant={statusBadgeVariant(app.status)}>
                        {statusLabel(app.status)}
                      </Badge>
                    </td>
                    <td className="p-3">
                      {app.currentRound != null ? `Round ${app.currentRound}` : '--'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {applications.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{applications.length}</p>
              <p className="text-xs text-muted-foreground">Total Applied</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">
                {applications.filter((a: any) => a.status === 'SHORTLISTED').length}
              </p>
              <p className="text-xs text-muted-foreground">Shortlisted</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {applications.filter((a: any) => a.status === 'OFFERED').length}
              </p>
              <p className="text-xs text-muted-foreground">Offers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">
                {applications.filter((a: any) =>
                  ['ROUND1', 'ROUND2', 'ROUND3', 'SHORTLISTED'].includes(a.status),
                ).length}
              </p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
