'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Briefcase, Calendar, IndianRupee } from 'lucide-react';

export default function StudentOpportunitiesPage() {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['eligible-opportunities'],
    queryFn: () => api.get('/opportunities/eligible', accessToken!),
    enabled: !!accessToken,
  });

  const { data: myApps } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => api.get('/applications/me', accessToken!),
    enabled: !!accessToken,
  });

  const appliedOpportunityIds = new Set(
    (myApps?.data || []).map((app: any) => app.opportunityId),
  );

  const applyMutation = useMutation({
    mutationFn: (opportunityId: string) =>
      api.post('/applications', { opportunityId }, accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      queryClient.invalidateQueries({ queryKey: ['eligible-opportunities'] });
    },
  });

  const opportunities = data?.data || [];

  const filtered = opportunities.filter((opp: any) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      opp.companyName?.toLowerCase().includes(term) ||
      opp.roleTitle?.toLowerCase().includes(term) ||
      opp.location?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Opportunities</h1>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by company, role, location..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading opportunities...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {searchTerm
            ? 'No opportunities match your search.'
            : 'No eligible opportunities available right now.'}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((opp: any) => {
            const hasApplied = appliedOpportunityIds.has(opp.id);
            const isDeadlinePassed = opp.lastDateToApply
              ? new Date(opp.lastDateToApply) < new Date()
              : false;

            return (
              <Card key={opp.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-sm font-bold">
                        {opp.companyName?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <CardTitle className="text-base leading-tight">{opp.companyName}</CardTitle>
                        <CardDescription className="text-sm">{opp.roleTitle}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {opp.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  <div className="space-y-1.5 text-sm">
                    {opp.ctc != null && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <IndianRupee className="h-3.5 w-3.5" />
                        <span>{opp.ctc} LPA</span>
                      </div>
                    )}
                    {opp.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{opp.location}</span>
                      </div>
                    )}
                    {opp.lastDateToApply && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          Deadline: {new Date(opp.lastDateToApply).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {opp.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {opp.description}
                    </p>
                  )}

                  <div className="pt-2">
                    {hasApplied ? (
                      <Badge variant="success" className="w-full justify-center py-1.5">
                        Applied
                      </Badge>
                    ) : isDeadlinePassed ? (
                      <Badge variant="secondary" className="w-full justify-center py-1.5">
                        Deadline Passed
                      </Badge>
                    ) : (
                      <Button
                        className="w-full"
                        size="sm"
                        onClick={() => applyMutation.mutate(opp.id)}
                        disabled={applyMutation.isPending}
                      >
                        <Briefcase className="h-4 w-4 mr-2" />
                        {applyMutation.isPending ? 'Applying...' : 'Apply Now'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {applyMutation.isError && (
        <p className="text-sm text-destructive text-center">
          Failed to apply: {(applyMutation.error as Error).message}
        </p>
      )}
    </div>
  );
}
