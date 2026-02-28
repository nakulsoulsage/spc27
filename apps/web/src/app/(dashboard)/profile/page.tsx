'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function ProfilePage() {
  const { user, accessToken } = useAuthStore();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => api.get('/students/me', accessToken!),
    enabled: user?.role === 'STUDENT',
  });

  const profile = data?.data || data;
  const [form, setForm] = useState<any>({});

  const updateMutation = useMutation({
    mutationFn: (body: any) => api.patch('/students/me', body, accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
      setEditing(false);
    },
  });

  function startEditing() {
    setForm({
      enrollmentNo: profile?.enrollmentNo || '',
      course: profile?.course || '',
      branch: profile?.branch || '',
      semester: profile?.semester || '',
      cgpa: profile?.cgpa || '',
      percentage10th: profile?.percentage10th || '',
      percentage12th: profile?.percentage12th || '',
      backlogs: profile?.backlogs || 0,
      skills: profile?.skills?.join(', ') || '',
      achievements: profile?.achievements || '',
      resumeUrl: profile?.resumeUrl || '',
      linkedinUrl: profile?.linkedinUrl || '',
      githubUrl: profile?.githubUrl || '',
      graduationYear: profile?.graduationYear || '',
    });
    setEditing(true);
  }

  function handleSave() {
    const body = {
      ...form,
      semester: form.semester ? Number(form.semester) : undefined,
      cgpa: form.cgpa ? Number(form.cgpa) : undefined,
      percentage10th: form.percentage10th ? Number(form.percentage10th) : undefined,
      percentage12th: form.percentage12th ? Number(form.percentage12th) : undefined,
      backlogs: Number(form.backlogs),
      graduationYear: Number(form.graduationYear),
      skills: form.skills.split(',').map((s: string) => s.trim()).filter(Boolean),
    };
    updateMutation.mutate(body);
  }

  if (user?.role !== 'STUDENT') {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Profile</h1>
        <Card>
          <CardContent className="p-6">
            <p>Name: {user?.firstName} {user?.lastName}</p>
            <p>Email: {user?.email}</p>
            <p>Role: {user?.role}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) return <div className="text-center py-12 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Student Profile</h1>
        <div className="flex items-center space-x-2">
          <Badge variant={profile?.isProfileComplete ? 'success' : 'warning'}>
            {profile?.isProfileComplete ? 'Complete' : 'Incomplete'}
          </Badge>
          {!editing && (
            <Button onClick={startEditing}>Edit Profile</Button>
          )}
        </div>
      </div>

      {editing ? (
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium">Enrollment No</label><Input value={form.enrollmentNo} onChange={(e) => setForm({ ...form, enrollmentNo: e.target.value })} /></div>
              <div><label className="text-sm font-medium">Course</label><Input value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} /></div>
              <div><label className="text-sm font-medium">Branch</label><Input value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} /></div>
              <div><label className="text-sm font-medium">Semester</label><Input type="number" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} /></div>
              <div><label className="text-sm font-medium">CGPA</label><Input type="number" step="0.01" value={form.cgpa} onChange={(e) => setForm({ ...form, cgpa: e.target.value })} /></div>
              <div><label className="text-sm font-medium">Graduation Year</label><Input type="number" value={form.graduationYear} onChange={(e) => setForm({ ...form, graduationYear: e.target.value })} /></div>
              <div><label className="text-sm font-medium">10th %</label><Input type="number" value={form.percentage10th} onChange={(e) => setForm({ ...form, percentage10th: e.target.value })} /></div>
              <div><label className="text-sm font-medium">12th %</label><Input type="number" value={form.percentage12th} onChange={(e) => setForm({ ...form, percentage12th: e.target.value })} /></div>
              <div><label className="text-sm font-medium">Backlogs</label><Input type="number" value={form.backlogs} onChange={(e) => setForm({ ...form, backlogs: e.target.value })} /></div>
              <div><label className="text-sm font-medium">Resume URL</label><Input value={form.resumeUrl} onChange={(e) => setForm({ ...form, resumeUrl: e.target.value })} /></div>
            </div>
            <div><label className="text-sm font-medium">Skills (comma separated)</label><Input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} /></div>
            <div><label className="text-sm font-medium">LinkedIn URL</label><Input value={form.linkedinUrl} onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })} /></div>
            <div><label className="text-sm font-medium">GitHub URL</label><Input value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} /></div>
            <div className="flex space-x-2">
              <Button onClick={handleSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      ) : profile ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Card><CardHeader><CardTitle className="text-sm">Enrollment</CardTitle></CardHeader><CardContent><p>{profile.enrollmentNo}</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm">Course & Branch</CardTitle></CardHeader><CardContent><p>{profile.course} - {profile.branch}</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm">CGPA</CardTitle></CardHeader><CardContent><p>{profile.cgpa || '--'}</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm">Backlogs</CardTitle></CardHeader><CardContent><p>{profile.backlogs}</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm">Skills</CardTitle></CardHeader><CardContent><div className="flex flex-wrap gap-1">{profile.skills?.map((s: string) => <Badge key={s} variant="secondary">{s}</Badge>)}</div></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm">Graduation Year</CardTitle></CardHeader><CardContent><p>{profile.graduationYear}</p></CardContent></Card>
        </div>
      ) : (
        <Card><CardContent className="p-6 text-center text-muted-foreground">Profile not set up yet. Click &ldquo;Edit Profile&rdquo; to get started.</CardContent></Card>
      )}
    </div>
  );
}
