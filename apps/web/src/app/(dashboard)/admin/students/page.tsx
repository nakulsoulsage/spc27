'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Search, Upload, Lock, Unlock, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const branchOptions = [
  { value: '', label: 'All Branches' },
  { value: 'Computer Science', label: 'Computer Science' },
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Mechanical', label: 'Mechanical' },
  { value: 'Civil', label: 'Civil' },
  { value: 'Electrical', label: 'Electrical' },
  { value: 'IT', label: 'IT' },
  { value: 'Chemical', label: 'Chemical' },
];

const yearOptions = [
  { value: '', label: 'All Years' },
  { value: '2024', label: '2024' },
  { value: '2025', label: '2025' },
  { value: '2026', label: '2026' },
  { value: '2027', label: '2027' },
];

export default function AdminStudentsPage() {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [branch, setBranch] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [page, setPage] = useState(1);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const limit = 20;

  const debounceTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(debounceTimer.current);
  }, [search]);

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (branch) params.set('branch', branch);
    if (graduationYear) params.set('graduationYear', graduationYear);
    return params.toString();
  }, [page, debouncedSearch, branch, graduationYear]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-students', page, debouncedSearch, branch, graduationYear],
    queryFn: () => api.get(`/students?${buildQuery()}`, accessToken!),
    enabled: !!accessToken,
  });

  const students = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, limit: 20, totalPages: 1 };

  const lockMutation = useMutation({
    mutationFn: ({ id, locked }: { id: string; locked: boolean }) =>
      api.patch(`/students/${id}/lock`, { locked }, accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => api.upload('/students/bulk-upload', formData, accessToken!),
    onSuccess: (result) => {
      setUploadResult(result);
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
    },
  });

  const handleUpload = () => {
    if (!uploadFile) return;
    const formData = new FormData();
    formData.append('file', uploadFile);
    setUploadResult(null);
    uploadMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Students</h1>
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload CSV
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk Upload Students</DialogTitle>
              <DialogDescription>
                Upload a CSV file with student data. The file should contain columns for name, email, enrollment number, branch, etc.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                type="file"
                accept=".csv,.xlsx"
                onChange={(e) => {
                  setUploadFile(e.target.files?.[0] || null);
                  setUploadResult(null);
                }}
              />
              <Button
                onClick={handleUpload}
                disabled={!uploadFile || uploadMutation.isPending}
                className="w-full"
              >
                {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
              </Button>
              {uploadResult && (
                <div className="rounded-lg border p-4 space-y-2">
                  <p className="text-sm font-medium">Upload Complete</p>
                  <p className="text-sm text-muted-foreground">
                    Created: {uploadResult.created ?? 0} | Failed: {uploadResult.failed ?? 0}
                  </p>
                  {uploadResult.errors && uploadResult.errors.length > 0 && (
                    <div className="text-sm text-destructive space-y-1 max-h-32 overflow-y-auto">
                      {uploadResult.errors.map((err: string, i: number) => (
                        <p key={i}>{err}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {uploadMutation.isError && (
                <p className="text-sm text-destructive">
                  Upload failed: {(uploadMutation.error as Error).message}
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, enrollment..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          options={branchOptions}
          value={branch}
          onChange={(v) => { setBranch(v); setPage(1); }}
          className="w-[180px]"
        />
        <Select
          options={yearOptions}
          value={graduationYear}
          onChange={(v) => { setGraduationYear(v); setPage(1); }}
          className="w-[140px]"
        />
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Total: {meta.total} students</span>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left font-medium">Name</th>
                <th className="p-3 text-left font-medium">Enrollment</th>
                <th className="p-3 text-left font-medium">Branch</th>
                <th className="p-3 text-left font-medium">CGPA</th>
                <th className="p-3 text-left font-medium">Backlogs</th>
                <th className="p-3 text-left font-medium">Placement</th>
                <th className="p-3 text-left font-medium">Profile</th>
                <th className="p-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s: any) => (
                <tr key={s.id} className="border-b hover:bg-muted/30">
                  <td className="p-3 font-medium">
                    {s.user?.firstName} {s.user?.lastName}
                  </td>
                  <td className="p-3">{s.enrollmentNo || '--'}</td>
                  <td className="p-3">{s.branch || '--'}</td>
                  <td className="p-3">{s.cgpa != null ? s.cgpa : '--'}</td>
                  <td className="p-3">{s.backlogs ?? 0}</td>
                  <td className="p-3">
                    <Badge variant={s.isPlaced ? 'success' : 'secondary'}>
                      {s.isPlaced ? 'Placed' : 'Not Placed'}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Badge variant={s.isProfileComplete ? 'success' : 'warning'}>
                      {s.isProfileComplete ? 'Complete' : 'Incomplete'}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/students/${s.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          lockMutation.mutate({
                            id: s.id,
                            locked: !s.isProfileLocked,
                          })
                        }
                        disabled={lockMutation.isPending}
                        title={s.isProfileLocked ? 'Unlock profile' : 'Lock profile'}
                      >
                        {s.isProfileLocked ? (
                          <Unlock className="h-4 w-4" />
                        ) : (
                          <Lock className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {students.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">No students found.</div>
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
