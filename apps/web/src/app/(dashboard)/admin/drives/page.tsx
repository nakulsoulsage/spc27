'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';

export default function AdminDrivesPage() {
  const { accessToken } = useAuthStore();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-drives', search],
    queryFn: () => api.get(`/jobs?search=${search}&limit=50`, accessToken!),
  });

  const jobs = data?.data?.data || data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Placement Drives</h1>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search drives..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left font-medium">Title</th>
                <th className="p-3 text-left font-medium">Company</th>
                <th className="p-3 text-left font-medium">Type</th>
                <th className="p-3 text-left font-medium">Status</th>
                <th className="p-3 text-left font-medium">Applicants</th>
                <th className="p-3 text-left font-medium">Deadline</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job: any) => (
                <tr key={job.id} className="border-b hover:bg-muted/30">
                  <td className="p-3">
                    <Link href={`/jobs/${job.id}`} className="text-primary hover:underline font-medium">
                      {job.title}
                    </Link>
                  </td>
                  <td className="p-3">{job.company?.name}</td>
                  <td className="p-3">
                    <Badge variant="secondary">{job.jobType}</Badge>
                  </td>
                  <td className="p-3">
                    <Badge variant={job.status === 'OPEN' ? 'success' : job.status === 'CLOSED' ? 'destructive' : 'secondary'}>
                      {job.status}
                    </Badge>
                  </td>
                  <td className="p-3">{job._count?.applications || 0}</td>
                  <td className="p-3">{job.deadline ? new Date(job.deadline).toLocaleDateString() : '--'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {jobs.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">No drives found.</div>
          )}
        </div>
      )}
    </div>
  );
}
