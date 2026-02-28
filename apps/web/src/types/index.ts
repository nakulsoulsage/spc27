export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  isApproved: boolean;
  institutionId: string;
  createdAt: string;
}

export type Role = 'STUDENT' | 'TPO' | 'RECRUITER' | 'ALUMNI' | 'SUPER_ADMIN';

export interface StudentProfile {
  id: string;
  userId: string;
  enrollmentNo: string;
  course: string;
  branch: string;
  semester?: number;
  cgpa?: number;
  percentage10th?: number;
  percentage12th?: number;
  backlogs: number;
  skills: string[];
  achievements?: string;
  resumeUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  isProfileComplete: boolean;
  graduationYear: number;
  user?: Pick<User, 'email' | 'firstName' | 'lastName' | 'avatar'>;
}

export interface Company {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  logo?: string;
  description?: string;
}

export interface JobPosting {
  id: string;
  title: string;
  description: string;
  jobType: 'INTERNSHIP' | 'FULLTIME';
  status: 'DRAFT' | 'OPEN' | 'CLOSED';
  location?: string;
  salary?: string;
  deadline?: string;
  eligibilityCriteria?: EligibilityCriteria;
  company: Company;
  _count?: { applications: number; rounds: number };
  createdAt: string;
}

export interface EligibilityCriteria {
  minCgpa?: number;
  maxBacklogs?: number;
  branches?: string[];
  minPercentage10th?: number;
  minPercentage12th?: number;
}

export interface Application {
  id: string;
  status: 'APPLIED' | 'SHORTLISTED' | 'REJECTED' | 'SELECTED' | 'OFFERED';
  jobPosting: Pick<JobPosting, 'title' | 'jobType' | 'location' | 'salary'> & {
    company: Pick<Company, 'name' | 'logo'>;
  };
  roundResults?: RoundResult[];
  createdAt: string;
}

export interface RoundResult {
  id: string;
  passed?: boolean;
  score?: number;
  remarks?: string;
  round: { roundType: string; roundNumber: number; title?: string };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  unreadCount?: number;
}
