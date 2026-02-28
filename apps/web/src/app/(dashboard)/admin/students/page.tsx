'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function AdminStudentsPage() {
  const { accessToken } = useAuthStore();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-students', search],
    queryFn: () => api.get(`/students?search=${search}&limit=50`, accessToken!),
  });

  const students = data?.data?.data || data?.data || [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Students</h1>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search students..."
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
                <th className="p-3 text-left font-medium">Name</th>
                <th className="p-3 text-left font-medium">Enrollment</th>
                <th className="p-3 text-left font-medium">Branch</th>
                <th className="p-3 text-left font-medium">CGPA</th>
                <th className="p-3 text-left font-medium">Backlogs</th>
                <th className="p-3 text-left font-medium">Profile</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s: any) => (
                <tr key={s.id} className="border-b">
                  <td className="p-3">{s.user?.firstName} {s.user?.lastName}</td>
                  <td className="p-3">{s.enrollmentNo}</td>
                  <td className="p-3">{s.branch}</td>
                  <td className="p-3">{s.cgpa || '--'}</td>
                  <td className="p-3">{s.backlogs}</td>
                  <td className="p-3">
                    <Badge variant={s.isProfileComplete ? 'success' : 'warning'}>
                      {s.isProfileComplete ? 'Complete' : 'Incomplete'}
                    </Badge>
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
    </div>
  );
}
