import { PrismaClient, Role, JobType, JobStatus, RoundType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.roundResult.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.application.deleteMany();
  await prisma.recruitmentRound.deleteMany();
  await prisma.jobPosting.deleteMany();
  await prisma.companyRecruiter.deleteMany();
  await prisma.company.deleteMany();
  await prisma.alumniProfile.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.institution.deleteMany();

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // Institution
  const institution = await prisma.institution.create({
    data: {
      name: 'SPC Institute of Technology',
      domain: 'spcit.edu.in',
      address: 'Bangalore, India',
    },
  });

  // Super Admin
  await prisma.user.create({
    data: {
      email: 'admin@spcit.edu.in',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: Role.SUPER_ADMIN,
      isApproved: true,
      institutionId: institution.id,
    },
  });

  // TPO
  const tpo = await prisma.user.create({
    data: {
      email: 'tpo@spcit.edu.in',
      password: hashedPassword,
      firstName: 'Rajesh',
      lastName: 'Kumar',
      role: Role.TPO,
      isApproved: true,
      institutionId: institution.id,
    },
  });

  // Students
  const student1 = await prisma.user.create({
    data: {
      email: 'student1@spcit.edu.in',
      password: hashedPassword,
      firstName: 'Priya',
      lastName: 'Sharma',
      role: Role.STUDENT,
      isApproved: true,
      institutionId: institution.id,
      studentProfile: {
        create: {
          institutionId: institution.id,
          enrollmentNo: 'SPC2024001',
          course: 'B.Tech',
          branch: 'Computer Science',
          semester: 7,
          cgpa: 8.5,
          percentage10th: 92,
          percentage12th: 88,
          backlogs: 0,
          skills: ['JavaScript', 'React', 'Node.js', 'Python'],
          graduationYear: 2025,
          isProfileComplete: true,
        },
      },
    },
  });

  const student2 = await prisma.user.create({
    data: {
      email: 'student2@spcit.edu.in',
      password: hashedPassword,
      firstName: 'Amit',
      lastName: 'Patel',
      role: Role.STUDENT,
      isApproved: true,
      institutionId: institution.id,
      studentProfile: {
        create: {
          institutionId: institution.id,
          enrollmentNo: 'SPC2024002',
          course: 'B.Tech',
          branch: 'Electronics',
          semester: 7,
          cgpa: 7.2,
          percentage10th: 85,
          percentage12th: 80,
          backlogs: 1,
          skills: ['C++', 'MATLAB', 'Embedded Systems'],
          graduationYear: 2025,
          isProfileComplete: true,
        },
      },
    },
  });

  // Recruiter + Company
  const recruiter = await prisma.user.create({
    data: {
      email: 'recruiter@techcorp.com',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: Role.RECRUITER,
      isApproved: true,
      institutionId: institution.id,
    },
  });

  const company = await prisma.company.create({
    data: {
      name: 'TechCorp Solutions',
      website: 'https://techcorp.example.com',
      industry: 'Information Technology',
      description: 'Leading IT services and consulting company.',
      institutionId: institution.id,
      recruiters: {
        create: { userId: recruiter.id },
      },
    },
  });

  // Job Postings
  const job1 = await prisma.jobPosting.create({
    data: {
      title: 'Software Engineer',
      description: 'Full-time software engineering role for fresh graduates. Work on cutting-edge web applications.',
      jobType: JobType.FULLTIME,
      status: JobStatus.OPEN,
      location: 'Bangalore',
      salary: '12-15 LPA',
      deadline: new Date('2025-06-30'),
      eligibilityCriteria: {
        minCgpa: 7.0,
        maxBacklogs: 0,
        branches: ['Computer Science', 'Information Technology'],
      },
      companyId: company.id,
      institutionId: institution.id,
      postedById: tpo.id,
      rounds: {
        create: [
          { roundType: RoundType.APTITUDE, roundNumber: 1, title: 'Aptitude Test' },
          { roundType: RoundType.CODING, roundNumber: 2, title: 'Coding Round' },
          { roundType: RoundType.TECHNICAL, roundNumber: 3, title: 'Technical Interview' },
          { roundType: RoundType.HR, roundNumber: 4, title: 'HR Interview' },
        ],
      },
    },
  });

  const job2 = await prisma.jobPosting.create({
    data: {
      title: 'Data Science Intern',
      description: '6-month internship in the data science team. Hands-on experience with ML models.',
      jobType: JobType.INTERNSHIP,
      status: JobStatus.OPEN,
      location: 'Remote',
      salary: '25K/month',
      deadline: new Date('2025-05-15'),
      eligibilityCriteria: {
        minCgpa: 7.5,
        maxBacklogs: 1,
        branches: ['Computer Science', 'Electronics', 'Mathematics'],
      },
      companyId: company.id,
      institutionId: institution.id,
      postedById: recruiter.id,
    },
  });

  // Alumni
  await prisma.user.create({
    data: {
      email: 'alumni@spcit.edu.in',
      password: hashedPassword,
      firstName: 'Vikram',
      lastName: 'Singh',
      role: Role.ALUMNI,
      isApproved: true,
      institutionId: institution.id,
      alumniProfile: {
        create: {
          institutionId: institution.id,
          graduationYear: 2022,
          course: 'B.Tech',
          branch: 'Computer Science',
          currentCompany: 'Google',
          currentRole: 'Software Engineer',
        },
      },
    },
  });

  console.log('Seed completed successfully!');
  console.log({
    institution: institution.name,
    credentials: 'Password123! for all users',
    users: [
      'admin@spcit.edu.in (SUPER_ADMIN)',
      'tpo@spcit.edu.in (TPO)',
      'student1@spcit.edu.in (STUDENT)',
      'student2@spcit.edu.in (STUDENT)',
      'recruiter@techcorp.com (RECRUITER)',
      'alumni@spcit.edu.in (ALUMNI)',
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
