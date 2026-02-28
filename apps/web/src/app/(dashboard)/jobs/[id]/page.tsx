'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, DollarSign, Clock, Building2 } from 'lucide-react';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['job', params.id],
    queryFn: () => api.get(`/jobs/${params.id}`, accessToken!),
  });

  const applyMutation = useMutation({
    mutationFn: () => api.post('/applications', { jobPostingId: params.id }, accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', params.id] });
    },
  });

  const job = data?.data || data;

  if (isLoading) return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  if (!job) return <div className="text-center py-12 text-muted-foreground">Job not found</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{job.title}</h1>
          <div className="flex items-center space-x-2 mt-2 text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span>{job.company?.name}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={job.jobType === 'INTERNSHIP' ? 'secondary' : 'default'}>
            {job.jobType}
          </Badge>
          <Badge variant={job.status === 'OPEN' ? 'success' : 'destructive'}>
            {job.status}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {job.location && (
          <Card>
            <CardContent className="flex items-center space-x-2 pt-4">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{job.location}</span>
            </CardContent>
          </Card>
        )}
        {job.salary && (
          <Card>
            <CardContent className="flex items-center space-x-2 pt-4">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>{job.salary}</span>
            </CardContent>
          </Card>
        )}
        {job.deadline && (
          <Card>
            <CardContent className="flex items-center space-x-2 pt-4">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{job.description}</p>
        </CardContent>
      </Card>

      {job.eligibilityCriteria && (
        <Card>
          <CardHeader>
            <CardTitle>Eligibility Criteria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {job.eligibilityCriteria.minCgpa && (
              <p>Minimum CGPA: <strong>{job.eligibilityCriteria.minCgpa}</strong></p>
            )}
            {job.eligibilityCriteria.maxBacklogs !== undefined && (
              <p>Maximum Backlogs: <strong>{job.eligibilityCriteria.maxBacklogs}</strong></p>
            )}
            {job.eligibilityCriteria.branches?.length > 0 && (
              <p>Branches: <strong>{job.eligibilityCriteria.branches.join(', ')}</strong></p>
            )}
          </CardContent>
        </Card>
      )}

      {job.rounds?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recruitment Rounds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {job.rounds.map((round: any, i: number) => (
                <div key={round.id} className="flex items-center space-x-3 rounded-lg border p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {round.roundNumber}
                  </div>
                  <div>
                    <p className="font-medium">{round.title || round.roundType}</p>
                    <p className="text-sm text-muted-foreground">{round.roundType}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {user?.role === 'STUDENT' && job.status === 'OPEN' && (
        <Button
          size="lg"
          className="w-full"
          onClick={() => applyMutation.mutate()}
          disabled={applyMutation.isPending}
        >
          {applyMutation.isPending ? 'Applying...' : applyMutation.isSuccess ? 'Applied!' : 'Apply Now'}
        </Button>
      )}

      {applyMutation.isError && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {(applyMutation.error as any)?.message || 'Failed to apply'}
        </div>
      )}
    </div>
  );
}
