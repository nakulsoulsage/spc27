export enum Role {
  STUDENT = 'STUDENT',
  TPO = 'TPO',
  RECRUITER = 'RECRUITER',
  ALUMNI = 'ALUMNI',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum JobType {
  INTERNSHIP = 'INTERNSHIP',
  FULLTIME = 'FULLTIME',
}

export enum JobStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export enum ApplicationStatus {
  APPLIED = 'APPLIED',
  SHORTLISTED = 'SHORTLISTED',
  REJECTED = 'REJECTED',
  SELECTED = 'SELECTED',
  OFFERED = 'OFFERED',
}

export enum RoundType {
  APTITUDE = 'APTITUDE',
  TECHNICAL = 'TECHNICAL',
  HR = 'HR',
  GROUP_DISCUSSION = 'GROUP_DISCUSSION',
  CODING = 'CODING',
}

export enum NotificationType {
  SHORTLISTED = 'SHORTLISTED',
  REJECTED = 'REJECTED',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  OFFER_RECEIVED = 'OFFER_RECEIVED',
  NEW_JOB_POSTED = 'NEW_JOB_POSTED',
  APPLICATION_UPDATE = 'APPLICATION_UPDATE',
  ROUND_RESULT = 'ROUND_RESULT',
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  institutionId: string;
}

export interface EligibilityCriteria {
  minCgpa?: number;
  maxBacklogs?: number;
  branches?: string[];
  minPercentage10th?: number;
  minPercentage12th?: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
