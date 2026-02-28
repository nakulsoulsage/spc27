'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Plus, Eye, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'OPEN', label: 'Open' },
  { value: 'CLOSED', label: 'Closed' },
];

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'FULLTIME', label: 'Full Time' },
];

export default function AdminOpportunitiesPage() {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-opportunities', page, status, type],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (status) params.set('status', status);
      if (type) params.set('type', type);
      return api.get(`/opportunities?${params.toString()}`, accessToken!);
    },
    enabled: !!accessToken,
  });

  const opportunities = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, limit: 20, totalPages: 1 };

  const closeMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/opportunities/${id}/close`, {}, accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-opportunities'] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Opportunities</h1>
        <Button asChild>
          <Link href="/admin/opportunities/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Opportunity
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select
          options={statusOptions}
          value={status}
          onChange={(v) => { setStatus(v); setPage(1); }}
          className="w-[160px]"
        />
        <Select
          options={typeOptions}
          value={type}
          onChange={(v) => { setType(v); setPage(1); }}
          className="w-[160px]"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left font-medium">Company</th>
                <th className="p-3 text-left font-medium">Role</th>
                <th className="p-3 text-left font-medium">Type</th>
                <th className="p-3 text-left font-medium">CTC</th>
                <th className="p-3 text-left font-medium">Deadline</th>
                <th className="p-3 text-left font-medium">Status</th>
                <th className="p-3 text-left font-medium">Applications</th>
                <th className="p-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((opp: any) => (
                <tr key={opp.id} className="border-b hover:bg-muted/30">
                  <td className="p-3 font-medium">{opp.companyName}</td>
                  <td className="p-3">{opp.roleTitle}</td>
                  <td className="p-3">
                    <Badge variant="outline">{opp.type}</Badge>
                  </td>
                  <td className="p-3">
                    {opp.ctc != null ? `${opp.ctc} LPA` : '--'}
                  </td>
                  <td className="p-3">
                    {opp.lastDateToApply
                      ? new Date(opp.lastDateToApply).toLocaleDateString()
                      : '--'}
                  </td>
                  <td className="p-3">
                    <Badge variant={opp.status === 'OPEN' ? 'success' : 'secondary'}>
                      {opp.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-center">
                    {opp._count?.applications ?? opp.applicationsCount ?? 0}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/opportunities/${opp.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      {opp.status === 'OPEN' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => closeMutation.mutate(opp.id)}
                          disabled={closeMutation.isPending}
                          title="Close opportunity"
                        >
                          <XCircle className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {opportunities.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">No opportunities found.</div>
          )}
        </div>
      )}

      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
