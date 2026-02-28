'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function RecruiterJobsPage() {
  const { accessToken } = useAuthStore();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['recruiter-jobs', search],
    queryFn: () => api.get(`/jobs?search=${search}`, accessToken!),
  });

  const jobs = data?.data?.data || data?.data || [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Job Postings</h1>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search jobs..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job: any) => (
            <Card key={job.id}>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <Link href={`/jobs/${job.id}`} className="text-lg font-semibold text-primary hover:underline">
                    {job.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {job.company?.name} - {job.location || 'Remote'}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="secondary">{job.jobType}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {job._count?.applications || 0} applicants
                    </span>
                  </div>
                </div>
                <Badge variant={job.status === 'OPEN' ? 'success' : job.status === 'CLOSED' ? 'destructive' : 'secondary'}>
                  {job.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
          {jobs.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">No job postings yet.</div>
          )}
        </div>
      )}
    </div>
  );
}
