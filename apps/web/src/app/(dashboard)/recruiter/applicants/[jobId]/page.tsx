'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function ApplicantsPage() {
  const params = useParams();
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['applicants', params.jobId],
    queryFn: () => api.get(`/applications/job/${params.jobId}`, accessToken!),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/applications/${id}/status`, { status }, accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicants', params.jobId] });
    },
  });

  const applications = data?.data?.data || data?.data || [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Applicants</h1>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left font-medium">Name</th>
                <th className="p-3 text-left font-medium">Branch</th>
                <th className="p-3 text-left font-medium">CGPA</th>
                <th className="p-3 text-left font-medium">Status</th>
                <th className="p-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app: any) => (
                <tr key={app.id} className="border-b">
                  <td className="p-3">
                    {app.studentProfile?.user?.firstName} {app.studentProfile?.user?.lastName}
                  </td>
                  <td className="p-3">{app.studentProfile?.branch}</td>
                  <td className="p-3">{app.studentProfile?.cgpa}</td>
                  <td className="p-3">
                    <Badge>{app.status}</Badge>
                  </td>
                  <td className="p-3 space-x-2">
                    {app.status === 'APPLIED' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateMutation.mutate({ id: app.id, status: 'SHORTLISTED' })}
                        >
                          Shortlist
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateMutation.mutate({ id: app.id, status: 'REJECTED' })}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {app.status === 'SHORTLISTED' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateMutation.mutate({ id: app.id, status: 'SELECTED' })}
                        >
                          Select
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateMutation.mutate({ id: app.id, status: 'REJECTED' })}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {app.status === 'SELECTED' && (
                      <Button
                        size="sm"
                        onClick={() => updateMutation.mutate({ id: app.id, status: 'OFFERED' })}
                      >
                        Send Offer
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {applications.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">No applicants yet.</div>
          )}
        </div>
      )}
    </div>
  );
}
