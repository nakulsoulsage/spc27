'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ArrowLeft, XCircle } from 'lucide-react';

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

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState('');
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [offerAppId, setOfferAppId] = useState('');
  const [offerCtc, setOfferCtc] = useState('');
  const [offerJoiningDate, setOfferJoiningDate] = useState('');

  const { data: opportunity, isLoading: oppLoading } = useQuery({
    queryKey: ['opportunity', id],
    queryFn: () => api.get(`/opportunities/${id}`, accessToken!),
    enabled: !!accessToken && !!id,
  });

  const { data: applicantsData, isLoading: appLoading } = useQuery({
    queryKey: ['opportunity-applicants', id],
    queryFn: () => api.get(`/applications/opportunity/${id}`, accessToken!),
    enabled: !!accessToken && !!id,
  });

  const applicants = applicantsData?.data || [];

  const statusMutation = useMutation({
    mutationFn: ({ appId, status, currentRound }: { appId: string; status: string; currentRound?: number }) =>
      api.patch(`/applications/${appId}/status`, { status, currentRound }, accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunity-applicants', id] });
    },
  });

  const bulkMutation = useMutation({
    mutationFn: ({ applicationIds, status }: { applicationIds: string[]; status: string }) =>
      api.post('/applications/bulk-status', { applicationIds, status }, accessToken!),
    onSuccess: () => {
      setSelectedIds([]);
      setBulkStatus('');
      queryClient.invalidateQueries({ queryKey: ['opportunity-applicants', id] });
    },
  });

  const offerMutation = useMutation({
    mutationFn: (body: any) => api.post('/applications/offer', body, accessToken!),
    onSuccess: () => {
      setOfferDialogOpen(false);
      setOfferAppId('');
      setOfferCtc('');
      setOfferJoiningDate('');
      queryClient.invalidateQueries({ queryKey: ['opportunity-applicants', id] });
    },
  });

  const closeMutation = useMutation({
    mutationFn: () => api.patch(`/opportunities/${id}/close`, {}, accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunity', id] });
    },
  });

  const toggleSelect = (appId: string) => {
    setSelectedIds((prev) =>
      prev.includes(appId) ? prev.filter((i) => i !== appId) : [...prev, appId],
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === applicants.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(applicants.map((a: any) => a.id));
    }
  };

  const handleBulkAction = () => {
    if (!bulkStatus || selectedIds.length === 0) return;
    bulkMutation.mutate({ applicationIds: selectedIds, status: bulkStatus });
  };

  const handleOffer = () => {
    if (!offerAppId) return;
    const body: any = { applicationId: offerAppId };
    if (offerCtc) body.ctc = parseFloat(offerCtc);
    if (offerJoiningDate) body.joiningDate = offerJoiningDate;
    offerMutation.mutate(body);
  };

  if (oppLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Opportunity not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">{opportunity.companyName} - {opportunity.roleTitle}</h1>
        <Badge variant={opportunity.status === 'OPEN' ? 'success' : 'secondary'}>
          {opportunity.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Opportunity Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Type</span>
              <span>{opportunity.type}</span>
              <span className="text-muted-foreground">Location</span>
              <span>{opportunity.location || '--'}</span>
              <span className="text-muted-foreground">CTC</span>
              <span>{opportunity.ctc != null ? `${opportunity.ctc} LPA` : '--'}</span>
              <span className="text-muted-foreground">Deadline</span>
              <span>
                {opportunity.lastDateToApply
                  ? new Date(opportunity.lastDateToApply).toLocaleDateString()
                  : '--'}
              </span>
              <span className="text-muted-foreground">Applications</span>
              <span>{opportunity._count?.applications ?? 0}</span>
            </div>
            {opportunity.description && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="text-sm whitespace-pre-wrap">{opportunity.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Eligibility Criteria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {opportunity.eligibility ? (
              <div className="grid grid-cols-2 gap-2 text-sm">
                {opportunity.eligibility.minCGPA != null && (
                  <>
                    <span className="text-muted-foreground">Min CGPA</span>
                    <span>{opportunity.eligibility.minCGPA}</span>
                  </>
                )}
                {opportunity.eligibility.maxBacklogs != null && (
                  <>
                    <span className="text-muted-foreground">Max Backlogs</span>
                    <span>{opportunity.eligibility.maxBacklogs}</span>
                  </>
                )}
                {opportunity.eligibility.minTenthPercent != null && (
                  <>
                    <span className="text-muted-foreground">Min 10th %</span>
                    <span>{opportunity.eligibility.minTenthPercent}%</span>
                  </>
                )}
                {opportunity.eligibility.minTwelfthPercent != null && (
                  <>
                    <span className="text-muted-foreground">Min 12th %</span>
                    <span>{opportunity.eligibility.minTwelfthPercent}%</span>
                  </>
                )}
                {opportunity.eligibility.graduationYear != null && (
                  <>
                    <span className="text-muted-foreground">Graduation Year</span>
                    <span>{opportunity.eligibility.graduationYear}</span>
                  </>
                )}
                {opportunity.eligibility.allowedBranches &&
                  opportunity.eligibility.allowedBranches.length > 0 && (
                    <>
                      <span className="text-muted-foreground">Branches</span>
                      <div className="flex flex-wrap gap-1">
                        {opportunity.eligibility.allowedBranches.map((b: string) => (
                          <Badge key={b} variant="outline" className="text-xs">{b}</Badge>
                        ))}
                      </div>
                    </>
                  )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No specific eligibility criteria set.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {opportunity.rounds && opportunity.rounds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Interview Rounds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {opportunity.rounds
                .sort((a: any, b: any) => a.roundOrder - b.roundOrder)
                .map((round: any) => (
                  <div key={round.id || round.roundOrder} className="flex items-center gap-2 p-2 rounded-lg border text-sm">
                    <span className="font-medium text-muted-foreground">#{round.roundOrder}</span>
                    <span>{round.roundName}</span>
                    <Badge variant="outline" className="text-xs">{round.roundType}</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {opportunity.status === 'OPEN' && (
        <Button
          variant="destructive"
          onClick={() => closeMutation.mutate()}
          disabled={closeMutation.isPending}
        >
          <XCircle className="h-4 w-4 mr-2" />
          Close Opportunity
        </Button>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Applicants ({applicants.length})</CardTitle>
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{selectedIds.length} selected</span>
                <Select
                  options={[
                    { value: 'SHORTLISTED', label: 'Shortlist' },
                    { value: 'ROUND1', label: 'Move to Round 1' },
                    { value: 'ROUND2', label: 'Move to Round 2' },
                    { value: 'OFFERED', label: 'Offer' },
                    { value: 'REJECTED', label: 'Reject' },
                  ]}
                  value={bulkStatus}
                  onChange={setBulkStatus}
                  placeholder="Bulk Action"
                  className="w-[160px]"
                />
                <Button
                  size="sm"
                  onClick={handleBulkAction}
                  disabled={!bulkStatus || bulkMutation.isPending}
                >
                  Apply
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {appLoading ? (
            <p className="text-sm text-muted-foreground">Loading applicants...</p>
          ) : applicants.length === 0 ? (
            <p className="text-sm text-muted-foreground">No applications yet.</p>
          ) : (
            <div className="rounded-lg border overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === applicants.length && applicants.length > 0}
                        onChange={toggleAll}
                        className="rounded"
                      />
                    </th>
                    <th className="p-3 text-left font-medium">Student Name</th>
                    <th className="p-3 text-left font-medium">Enrollment</th>
                    <th className="p-3 text-left font-medium">Branch</th>
                    <th className="p-3 text-left font-medium">CGPA</th>
                    <th className="p-3 text-left font-medium">Status</th>
                    <th className="p-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applicants.map((app: any) => {
                    const student = app.student || {};
                    const user = student.user || {};
                    return (
                      <tr key={app.id} className="border-b hover:bg-muted/30">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(app.id)}
                            onChange={() => toggleSelect(app.id)}
                            className="rounded"
                          />
                        </td>
                        <td className="p-3 font-medium">
                          {user.firstName} {user.lastName}
                        </td>
                        <td className="p-3">{student.enrollmentNo || '--'}</td>
                        <td className="p-3">{student.branch || '--'}</td>
                        <td className="p-3">{student.cgpa != null ? student.cgpa : '--'}</td>
                        <td className="p-3">
                          <Badge variant={statusBadgeVariant(app.status)}>
                            {app.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1 flex-wrap">
                            {app.status === 'APPLIED' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => statusMutation.mutate({ appId: app.id, status: 'SHORTLISTED' })}
                                disabled={statusMutation.isPending}
                              >
                                Shortlist
                              </Button>
                            )}
                            {(app.status === 'SHORTLISTED' || app.status === 'APPLIED') && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => statusMutation.mutate({ appId: app.id, status: 'ROUND1', currentRound: 1 })}
                                disabled={statusMutation.isPending}
                              >
                                Round 1
                              </Button>
                            )}
                            {app.status === 'ROUND1' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => statusMutation.mutate({ appId: app.id, status: 'ROUND2', currentRound: 2 })}
                                disabled={statusMutation.isPending}
                              >
                                Round 2
                              </Button>
                            )}
                            {app.status !== 'OFFERED' && app.status !== 'REJECTED' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setOfferAppId(app.id);
                                  setOfferDialogOpen(true);
                                }}
                              >
                                Offer
                              </Button>
                            )}
                            {app.status !== 'REJECTED' && app.status !== 'OFFERED' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={() => statusMutation.mutate({ appId: app.id, status: 'REJECTED' })}
                                disabled={statusMutation.isPending}
                              >
                                Reject
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={offerDialogOpen} onOpenChange={setOfferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make Offer</DialogTitle>
            <DialogDescription>
              Provide offer details for this applicant.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Offered CTC (LPA)</Label>
              <Input
                type="number"
                step="0.01"
                value={offerCtc}
                onChange={(e) => setOfferCtc(e.target.value)}
                placeholder="e.g. 12.0"
              />
            </div>
            <div className="space-y-2">
              <Label>Joining Date</Label>
              <Input
                type="date"
                value={offerJoiningDate}
                onChange={(e) => setOfferJoiningDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOfferDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleOffer} disabled={offerMutation.isPending}>
              {offerMutation.isPending ? 'Sending...' : 'Send Offer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
