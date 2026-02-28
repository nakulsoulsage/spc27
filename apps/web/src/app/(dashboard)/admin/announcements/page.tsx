'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Pin, PinOff, Trash2, Plus } from 'lucide-react';

const visibilityOptions = [
  { value: 'ALL', label: 'All Users' },
  { value: 'STUDENT', label: 'Students Only' },
  { value: 'TPO', label: 'TPO Only' },
];

export default function AdminAnnouncementsPage() {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibleTo, setVisibleTo] = useState('ALL');
  const [isPinned, setIsPinned] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => api.get('/announcements', accessToken!),
    enabled: !!accessToken,
  });

  const announcements = data?.data || [];

  const pinnedAnnouncements = announcements.filter((a: any) => a.isPinned);
  const regularAnnouncements = announcements.filter((a: any) => !a.isPinned);
  const sortedAnnouncements = [...pinnedAnnouncements, ...regularAnnouncements];

  const createMutation = useMutation({
    mutationFn: (body: any) => api.post('/announcements', body, accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      setTitle('');
      setDescription('');
      setVisibleTo('ALL');
      setIsPinned(false);
      setShowForm(false);
    },
  });

  const pinMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/announcements/${id}/pin`, {}, accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/announcements/${id}`, accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    createMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      visibleTo,
      isPinned,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Announcements</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? 'Cancel' : 'New Announcement'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create Announcement</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Announcement title"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Announcement details..."
                  rows={3}
                />
              </div>
              <div className="flex flex-wrap gap-4 items-end">
                <div className="space-y-2">
                  <Label>Visible To</Label>
                  <Select
                    options={visibilityOptions}
                    value={visibleTo}
                    onChange={setVisibleTo}
                    className="w-[180px]"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer h-10">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Pin to top</span>
                </label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
              {createMutation.isError && (
                <p className="text-sm text-destructive">
                  {(createMutation.error as Error).message}
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : sortedAnnouncements.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No announcements yet. Create one to get started.
        </div>
      ) : (
        <div className="space-y-3">
          {sortedAnnouncements.map((ann: any) => (
            <Card key={ann.id} className={ann.isPinned ? 'border-primary/50' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm">{ann.title}</h3>
                      {ann.isPinned && (
                        <Badge variant="warning" className="text-xs">Pinned</Badge>
                      )}
                      <Badge variant="outline" className="text-xs">{ann.visibleTo || 'ALL'}</Badge>
                    </div>
                    {ann.description && (
                      <p className="text-sm text-muted-foreground">{ann.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {ann.createdAt ? new Date(ann.createdAt).toLocaleString() : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => pinMutation.mutate(ann.id)}
                      disabled={pinMutation.isPending}
                      title={ann.isPinned ? 'Unpin' : 'Pin'}
                    >
                      {ann.isPinned ? (
                        <PinOff className="h-4 w-4" />
                      ) : (
                        <Pin className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm('Delete this announcement?')) {
                          deleteMutation.mutate(ann.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
