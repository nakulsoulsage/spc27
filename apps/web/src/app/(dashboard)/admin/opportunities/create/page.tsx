'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';

const typeOptions = [
  { value: 'FULLTIME', label: 'Full Time' },
  { value: 'INTERNSHIP', label: 'Internship' },
];

const roundTypeOptions = [
  { value: 'APTITUDE', label: 'Aptitude' },
  { value: 'TECHNICAL', label: 'Technical' },
  { value: 'HR', label: 'HR' },
  { value: 'GD', label: 'Group Discussion' },
];

const allBranches = [
  'Computer Science',
  'Electronics',
  'Mechanical',
  'Civil',
  'Electrical',
  'IT',
  'Chemical',
];

export default function CreateOpportunityPage() {
  const { accessToken } = useAuthStore();
  const router = useRouter();

  const [form, setForm] = useState({
    companyName: '',
    roleTitle: '',
    type: 'FULLTIME',
    location: '',
    ctc: '',
    description: '',
    lastDateToApply: '',
  });

  const [eligibility, setEligibility] = useState({
    minCGPA: '',
    allowedBranches: [] as string[],
    maxBacklogs: '',
    minTenthPercent: '',
    minTwelfthPercent: '',
    graduationYear: '',
  });

  const [rounds, setRounds] = useState<{ roundName: string; roundType: string }[]>([]);

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateEligibility = (field: string, value: any) => {
    setEligibility((prev) => ({ ...prev, [field]: value }));
  };

  const toggleBranch = (branch: string) => {
    setEligibility((prev) => {
      const current = prev.allowedBranches;
      if (current.includes(branch)) {
        return { ...prev, allowedBranches: current.filter((b) => b !== branch) };
      }
      return { ...prev, allowedBranches: [...current, branch] };
    });
  };

  const addRound = () => {
    setRounds((prev) => [...prev, { roundName: '', roundType: 'APTITUDE' }]);
  };

  const updateRound = (idx: number, field: string, value: string) => {
    setRounds((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)),
    );
  };

  const removeRound = (idx: number) => {
    setRounds((prev) => prev.filter((_, i) => i !== idx));
  };

  const createMutation = useMutation({
    mutationFn: (body: any) => api.post('/opportunities', body, accessToken!),
    onSuccess: () => {
      router.push('/admin/opportunities');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const body: any = {
      companyName: form.companyName,
      roleTitle: form.roleTitle,
      type: form.type,
      location: form.location,
      description: form.description,
      lastDateToApply: form.lastDateToApply || undefined,
    };

    if (form.ctc) body.ctc = parseFloat(form.ctc);

    const elig: any = {};
    if (eligibility.minCGPA) elig.minCGPA = parseFloat(eligibility.minCGPA);
    if (eligibility.allowedBranches.length > 0) elig.allowedBranches = eligibility.allowedBranches;
    if (eligibility.maxBacklogs) elig.maxBacklogs = parseInt(eligibility.maxBacklogs, 10);
    if (eligibility.minTenthPercent) elig.minTenthPercent = parseFloat(eligibility.minTenthPercent);
    if (eligibility.minTwelfthPercent) elig.minTwelfthPercent = parseFloat(eligibility.minTwelfthPercent);
    if (eligibility.graduationYear) elig.graduationYear = parseInt(eligibility.graduationYear, 10);
    if (Object.keys(elig).length > 0) body.eligibility = elig;

    if (rounds.length > 0) {
      body.rounds = rounds.map((r, i) => ({
        roundName: r.roundName,
        roundType: r.roundType,
        roundOrder: i + 1,
      }));
    }

    createMutation.mutate(body);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-3xl font-bold">Create Opportunity</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Company Name *</Label>
                <Input
                  required
                  value={form.companyName}
                  onChange={(e) => updateForm('companyName', e.target.value)}
                  placeholder="e.g. Google"
                />
              </div>
              <div className="space-y-2">
                <Label>Role Title *</Label>
                <Input
                  required
                  value={form.roleTitle}
                  onChange={(e) => updateForm('roleTitle', e.target.value)}
                  placeholder="e.g. Software Engineer"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select
                  options={typeOptions}
                  value={form.type}
                  onChange={(v) => updateForm('type', v)}
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={form.location}
                  onChange={(e) => updateForm('location', e.target.value)}
                  placeholder="e.g. Bangalore"
                />
              </div>
              <div className="space-y-2">
                <Label>CTC (LPA)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.ctc}
                  onChange={(e) => updateForm('ctc', e.target.value)}
                  placeholder="e.g. 12.5"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => updateForm('description', e.target.value)}
                placeholder="Job description, responsibilities, perks..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Last Date to Apply</Label>
              <Input
                type="date"
                value={form.lastDateToApply}
                onChange={(e) => updateForm('lastDateToApply', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Eligibility Criteria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Min CGPA</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={eligibility.minCGPA}
                  onChange={(e) => updateEligibility('minCGPA', e.target.value)}
                  placeholder="e.g. 7.0"
                />
              </div>
              <div className="space-y-2">
                <Label>Max Backlogs</Label>
                <Input
                  type="number"
                  min="0"
                  value={eligibility.maxBacklogs}
                  onChange={(e) => updateEligibility('maxBacklogs', e.target.value)}
                  placeholder="e.g. 0"
                />
              </div>
              <div className="space-y-2">
                <Label>Graduation Year</Label>
                <Input
                  type="number"
                  min="2024"
                  max="2030"
                  value={eligibility.graduationYear}
                  onChange={(e) => updateEligibility('graduationYear', e.target.value)}
                  placeholder="e.g. 2026"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Min 10th %</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={eligibility.minTenthPercent}
                  onChange={(e) => updateEligibility('minTenthPercent', e.target.value)}
                  placeholder="e.g. 60"
                />
              </div>
              <div className="space-y-2">
                <Label>Min 12th %</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={eligibility.minTwelfthPercent}
                  onChange={(e) => updateEligibility('minTwelfthPercent', e.target.value)}
                  placeholder="e.g. 60"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Allowed Branches</Label>
              <div className="flex flex-wrap gap-2">
                {allBranches.map((branch) => (
                  <button
                    key={branch}
                    type="button"
                    onClick={() => toggleBranch(branch)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      eligibility.allowedBranches.includes(branch)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-foreground border-input hover:bg-accent'
                    }`}
                  >
                    {branch}
                  </button>
                ))}
              </div>
              {eligibility.allowedBranches.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No branch restriction (all branches eligible)
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Interview Rounds</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addRound}>
              <Plus className="h-4 w-4 mr-1" />
              Add Round
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {rounds.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No rounds added yet. Click &quot;Add Round&quot; to define interview rounds.
              </p>
            )}
            {rounds.map((round, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border">
                <span className="text-sm font-medium text-muted-foreground w-8">
                  #{idx + 1}
                </span>
                <Input
                  placeholder="Round name (e.g. Online Test)"
                  value={round.roundName}
                  onChange={(e) => updateRound(idx, 'roundName', e.target.value)}
                  className="flex-1"
                />
                <Select
                  options={roundTypeOptions}
                  value={round.roundType}
                  onChange={(v) => updateRound(idx, 'roundType', v)}
                  className="w-[160px]"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRound(idx)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Create Opportunity'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>

        {createMutation.isError && (
          <p className="text-sm text-destructive">
            Failed to create: {(createMutation.error as Error).message}
          </p>
        )}
      </form>
    </div>
  );
}
