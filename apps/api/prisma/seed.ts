import { PrismaClient, Role, Gender, Category, OpportunityType, OpportunityStatus, RoundType, ApplicationStatus, AnnouncementVisibility } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const BRANCHES = [
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Electrical',
  'Mechanical',
  'Civil',
  'Chemical',
];

const COURSES = ['B.Tech', 'BCA', 'MCA', 'M.Tech'];

const FIRST_NAMES_M = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan',
  'Krishna', 'Ishaan', 'Shaurya', 'Atharva', 'Advik', 'Pranav', 'Advait',
  'Dhruv', 'Kabir', 'Ritvik', 'Aarush', 'Kayaan', 'Darsh', 'Veer', 'Sahil',
  'Rohan', 'Arnav', 'Yash', 'Dev', 'Rishi', 'Neil', 'Kunal', 'Harsh', 'Rahul',
  'Vikram', 'Ankit', 'Siddharth', 'Nikhil', 'Akash', 'Manish', 'Rajat', 'Gaurav',
  'Varun', 'Tarun', 'Mohit', 'Sumit', 'Amit', 'Deepak', 'Pankaj', 'Sachin',
  'Neeraj', 'Abhishek',
];

const FIRST_NAMES_F = [
  'Ananya', 'Diya', 'Myra', 'Sara', 'Aadhya', 'Ira', 'Aanya', 'Navya',
  'Prisha', 'Kiara', 'Anika', 'Riya', 'Shreya', 'Ishita', 'Kavya',
  'Meera', 'Pooja', 'Sneha', 'Neha', 'Priya', 'Divya', 'Sakshi', 'Tanvi',
  'Radhika', 'Nandini', 'Pallavi', 'Swati', 'Komal', 'Simran', 'Jyoti',
  'Nikita', 'Aishwarya', 'Sonal', 'Kajal', 'Ankita', 'Ruchi', 'Shruti',
  'Monika', 'Preeti', 'Deepika', 'Sonali', 'Mansi', 'Ritika', 'Garima',
  'Kriti', 'Payal', 'Anjali', 'Shikha', 'Tanya', 'Alisha',
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Gupta', 'Patel', 'Singh', 'Kumar', 'Jain', 'Agarwal',
  'Mehta', 'Shah', 'Reddy', 'Nair', 'Iyer', 'Rao', 'Mishra', 'Pandey',
  'Tiwari', 'Yadav', 'Chauhan', 'Joshi', 'Saxena', 'Srivastava', 'Kapoor',
  'Malhotra', 'Bhatia', 'Arora', 'Khanna', 'Chopra', 'Sethi', 'Bajaj',
  'Bhatt', 'Desai', 'Kulkarni', 'Deshpande', 'Patil', 'Naik', 'Nayak',
  'Hegde', 'Shetty', 'Menon',
];

const STATES = ['Karnataka', 'Maharashtra', 'Delhi', 'Tamil Nadu', 'Telangana', 'Gujarat', 'Rajasthan', 'UP', 'MP', 'Kerala'];
const CITIES = ['Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Bhopal', 'Kochi'];
const BOARDS = ['CBSE', 'ICSE', 'State Board'];

const SKILLS_POOL = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C', 'Go', 'Rust',
  'React', 'Angular', 'Vue.js', 'Next.js', 'Node.js', 'Express', 'Django',
  'Spring Boot', 'Flutter', 'React Native', 'Docker', 'Kubernetes', 'AWS',
  'GCP', 'Azure', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'GraphQL',
  'REST API', 'Git', 'Linux', 'Machine Learning', 'Deep Learning', 'NLP',
  'Computer Vision', 'Data Science', 'TensorFlow', 'PyTorch', 'Figma',
  'MATLAB', 'Embedded Systems', 'IoT', 'AutoCAD', 'SolidWorks',
];

const COMPANIES = [
  { name: 'Google', ctc: '25-35 LPA', roles: ['Software Engineer', 'SDE', 'Data Scientist'] },
  { name: 'Microsoft', ctc: '20-30 LPA', roles: ['Software Engineer', 'Program Manager'] },
  { name: 'Amazon', ctc: '22-32 LPA', roles: ['SDE', 'Data Engineer'] },
  { name: 'TCS', ctc: '4-7 LPA', roles: ['Systems Engineer', 'Digital Engineer'] },
  { name: 'Infosys', ctc: '4-8 LPA', roles: ['Systems Engineer', 'Power Programmer'] },
  { name: 'Wipro', ctc: '4-6 LPA', roles: ['Project Engineer', 'Turbo Developer'] },
  { name: 'Accenture', ctc: '5-9 LPA', roles: ['Associate Software Engineer', 'Analyst'] },
  { name: 'Deloitte', ctc: '8-14 LPA', roles: ['Analyst', 'Consultant'] },
  { name: 'Goldman Sachs', ctc: '18-28 LPA', roles: ['Analyst', 'Engineer'] },
  { name: 'Flipkart', ctc: '16-24 LPA', roles: ['SDE', 'Product Analyst'] },
  { name: 'Zomato', ctc: '12-18 LPA', roles: ['Backend Engineer', 'Frontend Engineer'] },
  { name: 'Razorpay', ctc: '14-22 LPA', roles: ['Software Engineer', 'DevOps Engineer'] },
];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number, decimals = 1): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randSubset<T>(arr: T[], min: number, max: number): T[] {
  const count = randInt(min, max);
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

async function main() {
  console.log('Seeding database...');

  // Clean existing data in order (respecting FK constraints)
  await prisma.notification.deleteMany();
  await prisma.interviewSchedule.deleteMany();
  await prisma.application.deleteMany();
  await prisma.recruitmentRound.deleteMany();
  await prisma.eligibilityCriteria.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.institution.deleteMany();

  console.log('Cleaned existing data.');

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // Create institution
  const institution = await prisma.institution.create({
    data: {
      name: 'SPC Institute of Technology',
      domain: 'spcit.edu.in',
      address: 'Visvesvaraya Layout, Bangalore - 560064, Karnataka',
    },
  });
  console.log('Created institution:', institution.name);

  // Create Super Admin
  const admin = await prisma.user.create({
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
  console.log('Created admin:', admin.email);

  // Create TPO
  const tpo = await prisma.user.create({
    data: {
      email: 'tpo@spcit.edu.in',
      password: hashedPassword,
      firstName: 'Rajesh',
      lastName: 'Kumar',
      role: Role.TPO,
      phone: '+91-9876543210',
      isApproved: true,
      institutionId: institution.id,
    },
  });
  console.log('Created TPO:', tpo.email);

  // Create 200 students
  console.log('Creating 200 students...');
  const studentProfiles: any[] = [];

  for (let i = 1; i <= 200; i++) {
    const isFemale = Math.random() > 0.55;
    const firstName = isFemale ? rand(FIRST_NAMES_F) : rand(FIRST_NAMES_M);
    const lastName = rand(LAST_NAMES);
    const gender = isFemale ? Gender.FEMALE : Gender.MALE;
    const branch = rand(BRANCHES);
    const course = rand(COURSES);
    const cgpa = randFloat(5.0, 9.8);
    const tenthPct = randFloat(55, 98);
    const twelfthPct = randFloat(50, 96);
    const activeBacklogs = cgpa > 7 ? 0 : randInt(0, 3);
    const backlogHistory = activeBacklogs + randInt(0, 2);
    const semester = randInt(5, 8);
    const gradYear = 2025;
    const stateIdx = randInt(0, STATES.length - 1);

    const email = `student${i}@spcit.edu.in`;
    const enrollmentNo = `SPC${gradYear}${String(i).padStart(3, '0')}`;

    const skills = randSubset(SKILLS_POOL, 3, 8);
    const hasResume = Math.random() > 0.2;
    const isComplete = hasResume && cgpa > 0 && tenthPct > 0 && twelfthPct > 0;

    // Some students are placed (those with high CGPA)
    const isPlaced = cgpa >= 7.5 && Math.random() > 0.6;
    const placedCompanyData = isPlaced ? rand(COMPANIES) : null;

    const student = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: Role.STUDENT,
        isApproved: true,
        institutionId: institution.id,
        studentProfile: {
          create: {
            institutionId: institution.id,
            fullName: `${firstName} ${lastName}`,
            gender,
            dob: new Date(randInt(2000, 2003), randInt(0, 11), randInt(1, 28)),
            personalEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@gmail.com`,
            phone: `+91-${randInt(7000000000, 9999999999)}`,
            address: `${randInt(1, 500)}, ${rand(['MG Road', 'Brigade Road', 'Park Street', 'Nehru Nagar', 'Gandhi Path', 'Shivaji Marg'])}`,
            city: CITIES[stateIdx],
            state: STATES[stateIdx],
            pincode: String(randInt(100000, 999999)),
            category: rand([Category.GENERAL, Category.GENERAL, Category.OBC, Category.SC, Category.ST, Category.EWS]),
            nationality: 'Indian',
            tenthBoard: rand(BOARDS),
            tenthYear: gradYear - 8,
            tenthPercentage: tenthPct,
            twelfthBoard: rand(BOARDS),
            twelfthYear: gradYear - 6,
            twelfthPercentage: twelfthPct,
            enrollmentNo,
            course,
            branch,
            semester,
            cgpa,
            graduationYear: gradYear,
            activeBacklogs,
            backlogHistory,
            skills: JSON.parse(JSON.stringify(skills)),
            certifications: JSON.parse(JSON.stringify(
              Math.random() > 0.5 ? randSubset(['AWS Certified', 'Google Cloud Associate', 'Azure Fundamentals', 'NPTEL ML', 'Coursera DL Specialization', 'HackerRank Gold'], 1, 3) : []
            )),
            internships: JSON.parse(JSON.stringify(
              Math.random() > 0.4 ? [{ company: rand(['TCS', 'Infosys', 'Local Startup', 'XYZ Corp']), role: 'Intern', duration: `${randInt(2, 6)} months` }] : []
            )),
            projects: JSON.parse(JSON.stringify(
              randSubset(['E-commerce App', 'Chat Application', 'ML Prediction Model', 'IoT Dashboard', 'Portfolio Website', 'Blog Platform', 'Task Manager'], 1, 3).map(p => ({ title: p, description: `Built a ${p.toLowerCase()}` }))
            )),
            linkedin: Math.random() > 0.3 ? `https://linkedin.com/in/${firstName.toLowerCase()}${lastName.toLowerCase()}${i}` : null,
            github: Math.random() > 0.3 ? `https://github.com/${firstName.toLowerCase()}${i}` : null,
            resumeUrl: hasResume ? `/uploads/resumes/resume_${enrollmentNo}.pdf` : null,
            isProfileComplete: isComplete,
            isPlaced,
            placedCompany: placedCompanyData?.name || null,
            placedCTC: placedCompanyData ? rand(placedCompanyData.roles) === placedCompanyData.roles[0] ? placedCompanyData.ctc : `${randInt(4, 20)} LPA` : null,
            placedRole: placedCompanyData ? rand(placedCompanyData.roles) : null,
            placementType: isPlaced ? 'ON_CAMPUS' as any : null,
          },
        },
      },
      include: { studentProfile: true },
    });

    studentProfiles.push(student.studentProfile);

    if (i % 50 === 0) console.log(`  Created ${i}/200 students`);
  }

  console.log('Created 200 students.');

  // Create opportunities
  console.log('Creating opportunities...');
  const opportunities = [];

  for (const company of COMPANIES) {
    const role = rand(company.roles);
    const opp = await prisma.opportunity.create({
      data: {
        institutionId: institution.id,
        companyName: company.name,
        roleTitle: role,
        type: Math.random() > 0.3 ? OpportunityType.FULLTIME : OpportunityType.INTERNSHIP,
        location: rand(['Bangalore', 'Mumbai', 'Hyderabad', 'Remote', 'Delhi NCR', 'Pune']),
        ctc: company.ctc,
        description: `Exciting ${role} opportunity at ${company.name}. Join our team and work on cutting-edge technology.`,
        lastDateToApply: new Date('2026-06-30'),
        status: OpportunityStatus.OPEN,
        createdByTpoId: tpo.id,
        eligibility: {
          create: {
            minCGPA: randFloat(6.0, 8.0),
            allowedBranches: JSON.parse(JSON.stringify(
              randSubset(BRANCHES, 2, 5)
            )),
            maxActiveBacklogs: randInt(0, 1),
            minTenthPercentage: randFloat(55, 70),
            minTwelfthPercentage: randFloat(50, 65),
            graduationYear: 2025,
          },
        },
        rounds: {
          create: [
            { roundName: 'Aptitude Test', roundType: RoundType.APTITUDE, roundOrder: 1 },
            { roundName: 'Technical Interview', roundType: RoundType.TECHNICAL, roundOrder: 2 },
            { roundName: 'HR Interview', roundType: RoundType.HR, roundOrder: 3 },
          ],
        },
      },
    });
    opportunities.push(opp);
  }

  console.log(`Created ${opportunities.length} opportunities.`);

  // Create some applications
  console.log('Creating sample applications...');
  let appCount = 0;
  const eligibleStudents = studentProfiles.filter(s => s && s.cgpa >= 6.5 && s.activeBacklogs <= 1 && s.isProfileComplete);

  for (const opp of opportunities.slice(0, 6)) {
    const applicants = eligibleStudents.slice(0, randInt(10, 30));
    for (const student of applicants) {
      if (!student) continue;
      try {
        const statuses = [ApplicationStatus.APPLIED, ApplicationStatus.APPLIED, ApplicationStatus.SHORTLISTED, ApplicationStatus.ROUND1];
        await prisma.application.create({
          data: {
            opportunityId: opp.id,
            studentId: student.id,
            status: rand(statuses),
            currentRound: randInt(0, 2),
          },
        });
        appCount++;
      } catch {
        // Skip duplicate applications
      }
    }
  }

  console.log(`Created ${appCount} applications.`);

  // Create announcements
  console.log('Creating announcements...');
  const announcementData = [
    {
      title: 'Placement Season 2025 - Registration Open',
      description: 'All final year students are requested to complete their profiles and upload resumes before the placement season begins. Ensure your academic records are up to date.',
      visibleTo: AnnouncementVisibility.ALL,
      isPinned: true,
    },
    {
      title: 'Google On-Campus Drive - March 15',
      description: 'Google will be conducting an on-campus drive on March 15, 2026. Eligible students: CGPA >= 8.0, CS/IT branch, 0 backlogs. Pre-placement talk on March 14 at 3 PM in Auditorium.',
      visibleTo: AnnouncementVisibility.STUDENTS,
      isPinned: true,
    },
    {
      title: 'Resume Workshop - March 10',
      description: 'A resume building workshop will be conducted on March 10 at 2 PM. All students preparing for placements are encouraged to attend. Bring your laptops.',
      visibleTo: AnnouncementVisibility.STUDENTS,
      isPinned: false,
    },
    {
      title: 'Mock Interview Sessions Starting',
      description: 'Mock interview sessions will begin from March 12. Register on the portal. Sessions cover HR, Technical, and Aptitude rounds.',
      visibleTo: AnnouncementVisibility.STUDENTS,
      isPinned: false,
    },
    {
      title: 'TPO Meeting - Placement Strategy',
      description: 'Meeting for all placement officers to discuss strategy for upcoming recruitment season. Conference Room B, March 8 at 10 AM.',
      visibleTo: AnnouncementVisibility.ADMINS,
      isPinned: false,
    },
  ];

  for (const ann of announcementData) {
    await prisma.announcement.create({
      data: {
        institutionId: institution.id,
        createdById: tpo.id,
        ...ann,
      },
    });
  }

  console.log('Created announcements.');

  // Summary
  const totalStudents = await prisma.studentProfile.count();
  const placedStudents = await prisma.studentProfile.count({ where: { isPlaced: true } });
  const totalOpps = await prisma.opportunity.count();
  const totalApps = await prisma.application.count();

  console.log('\n=== Seed Complete ===');
  console.log({
    institution: institution.name,
    credentials: 'Password123! for all users',
    accounts: {
      admin: 'admin@spcit.edu.in (SUPER_ADMIN)',
      tpo: 'tpo@spcit.edu.in (TPO)',
      students: 'student1@spcit.edu.in through student200@spcit.edu.in (STUDENT)',
    },
    stats: {
      totalStudents,
      placedStudents,
      placementRate: `${((placedStudents / totalStudents) * 100).toFixed(1)}%`,
      opportunities: totalOpps,
      applications: totalApps,
    },
  });
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
