'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Lock, Upload, ExternalLink } from 'lucide-react';

const genderOptions = [
  { value: '', label: 'Select Gender' },
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
];

const categoryOptions = [
  { value: '', label: 'Select Category' },
  { value: 'General', label: 'General' },
  { value: 'OBC', label: 'OBC' },
  { value: 'SC', label: 'SC' },
  { value: 'ST', label: 'ST' },
  { value: 'EWS', label: 'EWS' },
];

export default function ProfilePage() {
  const { user, accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => api.get('/students/me', accessToken!),
    enabled: !!accessToken && user?.role === 'STUDENT',
  });

  const profile = profileData || {};

  const [personal, setPersonal] = useState({
    fullName: '',
    gender: '',
    dob: '',
    personalEmail: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    category: '',
    nationality: '',
  });

  const [academic, setAcademic] = useState({
    tenthBoard: '',
    tenthYear: '',
    tenthPercent: '',
    twelfthBoard: '',
    twelfthYear: '',
    twelfthPercent: '',
    course: '',
    branch: '',
    semester: '',
    cgpa: '',
    backlogs: '',
  });

  const [professional, setProfessional] = useState({
    skills: '',
    certifications: '',
    linkedin: '',
    github: '',
  });

  useEffect(() => {
    if (profile && Object.keys(profile).length > 0) {
      setPersonal({
        fullName: profile.fullName || `${profile.user?.firstName || ''} ${profile.user?.lastName || ''}`.trim(),
        gender: profile.gender || '',
        dob: profile.dob ? profile.dob.substring(0, 10) : '',
        personalEmail: profile.personalEmail || profile.user?.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        pincode: profile.pincode || '',
        category: profile.category || '',
        nationality: profile.nationality || '',
      });
      setAcademic({
        tenthBoard: profile.tenthBoard || '',
        tenthYear: profile.tenthYear ? String(profile.tenthYear) : '',
        tenthPercent: profile.percentage10th != null ? String(profile.percentage10th) : '',
        twelfthBoard: profile.twelfthBoard || '',
        twelfthYear: profile.twelfthYear ? String(profile.twelfthYear) : '',
        twelfthPercent: profile.percentage12th != null ? String(profile.percentage12th) : '',
        course: profile.course || '',
        branch: profile.branch || '',
        semester: profile.semester != null ? String(profile.semester) : '',
        cgpa: profile.cgpa != null ? String(profile.cgpa) : '',
        backlogs: profile.backlogs != null ? String(profile.backlogs) : '0',
      });
      setProfessional({
        skills: Array.isArray(profile.skills) ? profile.skills.join(', ') : (profile.skills || ''),
        certifications: Array.isArray(profile.certifications) ? profile.certifications.join(', ') : (profile.certifications || ''),
        linkedin: profile.linkedinUrl || '',
        github: profile.githubUrl || '',
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (body: any) => api.patch('/students/me', body, accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
    },
  });

  const uploadResumeMutation = useMutation({
    mutationFn: (formData: FormData) => api.upload('/students/upload-resume', formData, accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
    },
  });

  const uploadDocMutation = useMutation({
    mutationFn: ({ formData, docType }: { formData: FormData; docType: string }) => {
      formData.append('type', docType);
      return api.upload('/students/upload-document', formData, accessToken!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
    },
  });

  const savePersonal = () => {
    const body: any = { ...personal };
    if (body.dob) body.dob = new Date(body.dob).toISOString();
    else delete body.dob;
    updateMutation.mutate(body);
  };

  const saveAcademic = () => {
    const body: any = {
      tenthBoard: academic.tenthBoard || undefined,
      tenthYear: academic.tenthYear ? parseInt(academic.tenthYear, 10) : undefined,
      percentage10th: academic.tenthPercent ? parseFloat(academic.tenthPercent) : undefined,
      twelfthBoard: academic.twelfthBoard || undefined,
      twelfthYear: academic.twelfthYear ? parseInt(academic.twelfthYear, 10) : undefined,
      percentage12th: academic.twelfthPercent ? parseFloat(academic.twelfthPercent) : undefined,
      course: academic.course || undefined,
      branch: academic.branch || undefined,
      semester: academic.semester ? parseInt(academic.semester, 10) : undefined,
      cgpa: academic.cgpa ? parseFloat(academic.cgpa) : undefined,
      backlogs: academic.backlogs ? parseInt(academic.backlogs, 10) : 0,
    };
    updateMutation.mutate(body);
  };

  const saveProfessional = () => {
    const body: any = {
      skills: professional.skills.split(',').map((s) => s.trim()).filter(Boolean),
      certifications: professional.certifications.split(',').map((s) => s.trim()).filter(Boolean),
      linkedinUrl: professional.linkedin || undefined,
      githubUrl: professional.github || undefined,
    };
    updateMutation.mutate(body);
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'resume' | 'photo' | 'marksheet',
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    if (type === 'resume') {
      uploadResumeMutation.mutate(formData);
    } else {
      uploadDocMutation.mutate({ formData, docType: type });
    }
  };

  if (user?.role !== 'STUDENT') {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Profile</h1>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm">Name: {user?.firstName} {user?.lastName}</p>
            <p className="text-sm">Email: {user?.email}</p>
            <p className="text-sm">Role: {user?.role}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">Loading profile...</div>
    );
  }

  const profileCompletion = profile.profileCompletion || 0;
  const isLocked = profile.isProfileLocked;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <div className="flex items-center gap-2">
          <Badge variant={profile.isProfileComplete ? 'success' : 'warning'}>
            {profile.isProfileComplete ? 'Complete' : 'Incomplete'}
          </Badge>
        </div>
      </div>

      {isLocked && (
        <div className="flex items-center gap-2 p-4 rounded-lg border border-yellow-500/50 bg-yellow-500/10">
          <Lock className="h-4 w-4 text-yellow-600" />
          <p className="text-sm text-yellow-600 font-medium">
            Your profile is locked by the administrator. You cannot make changes at this time.
          </p>
        </div>
      )}

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Profile Completion</span>
            <div className="flex-1 bg-muted rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-primary h-2.5 rounded-full transition-all"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            <span className="text-sm font-medium">{profileCompletion}%</span>
          </div>
        </CardContent>
      </Card>

      {updateMutation.isSuccess && (
        <p className="text-sm text-green-600">Profile updated successfully.</p>
      )}
      {updateMutation.isError && (
        <p className="text-sm text-destructive">
          Failed to update: {(updateMutation.error as Error).message}
        </p>
      )}

      <Tabs defaultValue="personal">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="professional">Professional</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    disabled={isLocked}
                    value={personal.fullName}
                    onChange={(e) => setPersonal({ ...personal, fullName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select
                    disabled={isLocked}
                    options={genderOptions}
                    value={personal.gender}
                    onChange={(v) => setPersonal({ ...personal, gender: v })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    disabled={isLocked}
                    value={personal.dob}
                    onChange={(e) => setPersonal({ ...personal, dob: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Personal Email</Label>
                  <Input
                    type="email"
                    disabled={isLocked}
                    value={personal.personalEmail}
                    onChange={(e) => setPersonal({ ...personal, personalEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    disabled={isLocked}
                    value={personal.phone}
                    onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    disabled={isLocked}
                    options={categoryOptions}
                    value={personal.category}
                    onChange={(v) => setPersonal({ ...personal, category: v })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Address</Label>
                  <Input
                    disabled={isLocked}
                    value={personal.address}
                    onChange={(e) => setPersonal({ ...personal, address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    disabled={isLocked}
                    value={personal.city}
                    onChange={(e) => setPersonal({ ...personal, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input
                    disabled={isLocked}
                    value={personal.state}
                    onChange={(e) => setPersonal({ ...personal, state: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pincode</Label>
                  <Input
                    disabled={isLocked}
                    value={personal.pincode}
                    onChange={(e) => setPersonal({ ...personal, pincode: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nationality</Label>
                  <Input
                    disabled={isLocked}
                    value={personal.nationality}
                    onChange={(e) => setPersonal({ ...personal, nationality: e.target.value })}
                  />
                </div>
              </div>
              {!isLocked && (
                <Button onClick={savePersonal} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Saving...' : 'Save Personal Info'}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Academic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm font-medium text-muted-foreground">10th Standard</p>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Board</Label>
                  <Input
                    disabled={isLocked}
                    value={academic.tenthBoard}
                    onChange={(e) => setAcademic({ ...academic, tenthBoard: e.target.value })}
                    placeholder="e.g. CBSE"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Input
                    type="number"
                    disabled={isLocked}
                    value={academic.tenthYear}
                    onChange={(e) => setAcademic({ ...academic, tenthYear: e.target.value })}
                    placeholder="e.g. 2020"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Percentage</Label>
                  <Input
                    type="number"
                    step="0.01"
                    disabled={isLocked}
                    value={academic.tenthPercent}
                    onChange={(e) => setAcademic({ ...academic, tenthPercent: e.target.value })}
                    placeholder="e.g. 92.5"
                  />
                </div>
              </div>

              <p className="text-sm font-medium text-muted-foreground pt-2">12th Standard</p>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Board</Label>
                  <Input
                    disabled={isLocked}
                    value={academic.twelfthBoard}
                    onChange={(e) => setAcademic({ ...academic, twelfthBoard: e.target.value })}
                    placeholder="e.g. CBSE"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Input
                    type="number"
                    disabled={isLocked}
                    value={academic.twelfthYear}
                    onChange={(e) => setAcademic({ ...academic, twelfthYear: e.target.value })}
                    placeholder="e.g. 2022"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Percentage</Label>
                  <Input
                    type="number"
                    step="0.01"
                    disabled={isLocked}
                    value={academic.twelfthPercent}
                    onChange={(e) => setAcademic({ ...academic, twelfthPercent: e.target.value })}
                    placeholder="e.g. 88.0"
                  />
                </div>
              </div>

              <p className="text-sm font-medium text-muted-foreground pt-2">College</p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Course</Label>
                  <Input
                    disabled={isLocked}
                    value={academic.course}
                    onChange={(e) => setAcademic({ ...academic, course: e.target.value })}
                    placeholder="e.g. B.Tech"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Branch</Label>
                  <Input
                    disabled={isLocked}
                    value={academic.branch}
                    onChange={(e) => setAcademic({ ...academic, branch: e.target.value })}
                    placeholder="e.g. Computer Science"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Current Semester</Label>
                  <Input
                    type="number"
                    disabled={isLocked}
                    value={academic.semester}
                    onChange={(e) => setAcademic({ ...academic, semester: e.target.value })}
                    placeholder="e.g. 6"
                  />
                </div>
                <div className="space-y-2">
                  <Label>CGPA</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    disabled={isLocked}
                    value={academic.cgpa}
                    onChange={(e) => setAcademic({ ...academic, cgpa: e.target.value })}
                    placeholder="e.g. 8.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Active Backlogs</Label>
                  <Input
                    type="number"
                    min="0"
                    disabled={isLocked}
                    value={academic.backlogs}
                    onChange={(e) => setAcademic({ ...academic, backlogs: e.target.value })}
                  />
                </div>
              </div>
              {!isLocked && (
                <Button onClick={saveAcademic} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Saving...' : 'Save Academic Info'}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="professional">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Professional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Skills (comma-separated)</Label>
                <Input
                  disabled={isLocked}
                  value={professional.skills}
                  onChange={(e) => setProfessional({ ...professional, skills: e.target.value })}
                  placeholder="e.g. JavaScript, React, Node.js, Python"
                />
                {professional.skills && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {professional.skills.split(',').map((s, i) => s.trim()).filter(Boolean).map((s, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Certifications (comma-separated)</Label>
                <Input
                  disabled={isLocked}
                  value={professional.certifications}
                  onChange={(e) => setProfessional({ ...professional, certifications: e.target.value })}
                  placeholder="e.g. AWS Certified, Google Cloud, Coursera ML"
                />
              </div>
              <div className="space-y-2">
                <Label>LinkedIn Profile URL</Label>
                <Input
                  disabled={isLocked}
                  value={professional.linkedin}
                  onChange={(e) => setProfessional({ ...professional, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
              <div className="space-y-2">
                <Label>GitHub Profile URL</Label>
                <Input
                  disabled={isLocked}
                  value={professional.github}
                  onChange={(e) => setProfessional({ ...professional, github: e.target.value })}
                  placeholder="https://github.com/yourusername"
                />
              </div>
              {!isLocked && (
                <Button onClick={saveProfessional} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Saving...' : 'Save Professional Info'}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Resume</Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    disabled={isLocked}
                    onChange={(e) => handleFileUpload(e, 'resume')}
                  />
                  {profile.resumeUrl && (
                    <a
                      href={profile.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-primary hover:underline shrink-0"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Current
                    </a>
                  )}
                </div>
                {uploadResumeMutation.isPending && (
                  <p className="text-xs text-muted-foreground">Uploading resume...</p>
                )}
                {uploadResumeMutation.isSuccess && (
                  <p className="text-xs text-green-600">Resume uploaded successfully.</p>
                )}
                {uploadResumeMutation.isError && (
                  <p className="text-xs text-destructive">
                    Failed: {(uploadResumeMutation.error as Error).message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Photo</Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="file"
                    accept="image/*"
                    disabled={isLocked}
                    onChange={(e) => handleFileUpload(e, 'photo')}
                  />
                  {profile.photoUrl && (
                    <a
                      href={profile.photoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-primary hover:underline shrink-0"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Current
                    </a>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Marksheet</Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    disabled={isLocked}
                    onChange={(e) => handleFileUpload(e, 'marksheet')}
                  />
                  {profile.marksheetUrl && (
                    <a
                      href={profile.marksheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-primary hover:underline shrink-0"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Current
                    </a>
                  )}
                </div>
              </div>

              {uploadDocMutation.isPending && (
                <p className="text-xs text-muted-foreground">Uploading document...</p>
              )}
              {uploadDocMutation.isSuccess && (
                <p className="text-xs text-green-600">Document uploaded successfully.</p>
              )}
              {uploadDocMutation.isError && (
                <p className="text-xs text-destructive">
                  Failed: {(uploadDocMutation.error as Error).message}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
