'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MapPin, Clock, DollarSign, Building2, Search } from 'lucide-react';

export default function JobsPage() {
  const { user, accessToken } = useAuthStore();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const isStudent = user?.role === 'STUDENT';

  const { data, isLoading } = useQuery({
    queryKey: ['jobs', search, isStudent],
    queryFn: () =>
      isStudent
        ? api.get('/jobs/eligible', accessToken!)
        : api.get(`/jobs?search=${search}`, accessToken!),
  });

  const applyMutation = useMutation({
    mutationFn: (jobPostingId: string) =>
      api.post('/applications', { jobPostingId }, accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
    },
  });

  const jobs = isStudent
    ? (data?.data || data || [])
    : (data?.data?.data || data?.data || []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {isStudent ? 'Eligible Jobs' : 'Job Postings'}
        </h1>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading jobs...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.isArray(jobs) && jobs.map((job: any) => (
            <Card key={job.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      <Link href={`/jobs/${job.id}`} className="hover:underline">
                        {job.title}
                      </Link>
                    </CardTitle>
                    <div className="flex items-center space-x-1 mt-1 text-sm text-muted-foreground">
                      <Building2 className="h-3 w-3" />
                      <span>{job.company?.name}</span>
                    </div>
                  </div>
                  <Badge variant={job.jobType === 'INTERNSHIP' ? 'secondary' : 'default'}>
                    {job.jobType}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2 text-sm text-muted-foreground">
                  {job.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{job.location}</span>
                    </div>
                  )}
                  {job.salary && (
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-3 w-3" />
                      <span>{job.salary}</span>
                    </div>
                  )}
                  {job.deadline && (
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {job._count?.applications || 0} applicants
                  </span>
                  {isStudent && (
                    <Button
                      size="sm"
                      onClick={() => applyMutation.mutate(job.id)}
                      disabled={applyMutation.isPending}
                    >
                      Apply
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {Array.isArray(jobs) && jobs.length === 0 && !isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          No jobs found.
        </div>
      )}
    </div>
  );
}
