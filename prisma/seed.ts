import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Clean database
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.interview.deleteMany();
  await prisma.interviewSlot.deleteMany();
  await prisma.screeningAnswer.deleteMany();
  await prisma.screeningQuestion.deleteMany();
  await prisma.screening.deleteMany();
  await prisma.application.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.job.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // 2. Create organization
  const org = await prisma.organization.create({
    data: {
      name: 'TechNova Solutions',
      subscription: {
        create: {
          plan: 'GROWTH',
          status: 'ACTIVE',
          activeJobsLimit: 30,
          resumeLimit: 1000,
          aiScreeningLimit: 250,
        },
      },
    },
  });

  // 3. Create users
  const passwordHash = await bcrypt.hash('Demo123!', 10);

  const recruiter = await prisma.user.create({
    data: {
      email: 'recruiter@technova.demo',
      name: 'Sarah Jenkins',
      passwordHash,
      role: 'RECRUITER',
      organizationId: org.id,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@technova.demo',
      name: 'Alex Rivera',
      passwordHash,
      role: 'ADMIN',
      organizationId: org.id,
    },
  });

  const candidateUser = await prisma.user.create({
    data: {
      email: 'candidate@technova.demo',
      name: 'David Miller',
      passwordHash,
      role: 'CANDIDATE',
    },
  });

  // Create core Candidate profile for our seed candidate
  const seedCandidate = await prisma.candidate.create({
    data: {
      name: 'David Miller',
      email: 'candidate@technova.demo',
      phone: '+1 (555) 321-7654',
      location: 'San Francisco, CA',
      yearsOfExperience: 5,
      skills: 'React,Next.js,TypeScript,Redux,HTML,CSS,Jest',
      education: JSON.stringify({ degree: 'B.S. in Computer Science', school: 'Stanford University', year: '2021' }),
      experience: JSON.stringify([
        { role: 'Frontend Developer', company: 'Pixel Forge', duration: '2021 - Present', description: 'Developed React dashboard applications and integrated state stores.' },
      ]),
      userId: candidateUser.id,
    },
  });

  // 4. Create 10 Jobs
  const departments = ['Engineering', 'Product Management', 'Design & UX', 'Sales & Growth', 'Marketing'];
  const locations = ['Remote', 'San Francisco, CA', 'New York, NY', 'Austin, TX', 'Remote'];
  const salaryRanges = [
    '$130,000 - $160,000',
    '$110,000 - $140,000',
    '$95,000 - $120,000',
    '$80,000 - $110,000',
    '$120,000 - $150,000',
  ];

  const jobsData = [
    { title: 'Senior React Developer', dept: 'Engineering', skills: 'React,Next.js,TypeScript,Redux,CSS', exp: '5+ years' },
    { title: 'Fullstack Java Engineer', dept: 'Engineering', skills: 'Java,Spring Boot,PostgreSQL,Docker,Rest API', exp: '4+ years' },
    { title: 'Cloud Infrastructure Lead', dept: 'Engineering', skills: 'AWS,Terraform,Kubernetes,Docker,CI/CD', exp: '6+ years' },
    { title: 'Technical Product Manager', dept: 'Product Management', skills: 'Agile,Product Lifecycle,Jira,Roadmapping,SQL', exp: '3+ years' },
    { title: 'UI/UX Designer', dept: 'Design & UX', skills: 'Figma,UI Design,Prototyping,Wireframing,User Research', exp: '2+ years' },
    { title: 'Growth Marketing Manager', dept: 'Marketing', skills: 'Google Analytics,SEO,SEM,AdWords,Copywriting', exp: '3+ years' },
    { title: 'Enterprise Account Executive', dept: 'Sales & Growth', skills: 'B2B Sales,Negotiation,CRM,Lead Generation,Closing', exp: '5+ years' },
    { title: 'Data Scientist (ML)', dept: 'Engineering', skills: 'Python,SQL,scikit-learn,TensorFlow,Pandas', exp: '4+ years' },
    { title: 'Python Backend Developer', dept: 'Engineering', skills: 'Python,Django,FastAPI,PostgreSQL,Redis', exp: '3+ years' },
    { title: 'Frontend Developer', dept: 'Engineering', skills: 'JavaScript,React,TypeScript,HTML5,CSS3', exp: '2+ years' },
  ];

  const jobs = [];
  for (let i = 0; i < jobsData.length; i++) {
    const jd = jobsData[i];
    const job = await prisma.job.create({
      data: {
        title: jd.title,
        department: jd.dept,
        location: locations[i % locations.length],
        employmentType: i % 3 === 0 ? 'CONTRACT' : 'FULL_TIME',
        salaryRange: salaryRanges[i % salaryRanges.length],
        experienceRequired: jd.exp,
        skills: jd.skills,
        education: "Bachelor's Degree in related field",
        description: `We are looking for a qualified ${jd.title} to join our growing team. You will lead projects, write clean code/designs, and collaborate with product teams.`,
        responsibilities: 'Write robust specifications;\nDevelop customer features;\nOptimize platform speeds.',
        requirements: `Solid familiarity with ${jd.skills};\nExcellent communication skills.`,
        benefits: 'Unlimited PTO;\nFull Healthcare;\nRemote work budget.',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'PUBLISHED',
        organizationId: org.id,
      },
    });
    jobs.push(job);
  }

  // 5. Generate 50 Candidates & 100 Applications
  const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Hernandez', 'Moore', 'Martin', 'Jackson', 'Thompson', 'White'];

  const candidateSkillsPool = [
    ['React', 'Next.js', 'TypeScript', 'TailwindCSS', 'JavaScript'],
    ['Java', 'Spring Boot', 'SQL', 'REST APIs', 'PostgreSQL'],
    ['Python', 'Django', 'PostgreSQL', 'Docker', 'Redis'],
    ['AWS', 'Terraform', 'Kubernetes', 'Docker', 'CI/CD'],
    ['Figma', 'UI Design', 'Prototyping', 'User Research'],
    ['Agile', 'Jira', 'Roadmapping', 'SQL', 'Analytics'],
    ['Google Analytics', 'SEO', 'SEM', 'AdWords', 'Copywriting'],
    ['B2B Sales', 'CRM', 'Lead Generation', 'Negotiation'],
  ];

  const stages = ['APPLIED', 'UNDER_REVIEW', 'AI_SCREENING', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'HIRED', 'REJECTED'];
  const recommendations = ['STRONG_MATCH', 'MATCH', 'PARTIAL_MATCH', 'LOW_MATCH'];

  const candidatesCreated = [];
  
  // Link David Miller's application first
  const millerApp = await prisma.application.create({
    data: {
      jobId: jobs[0].id, // Senior React Dev
      candidateId: seedCandidate.id,
      status: 'SHORTLISTED',
      matchScore: 92,
      recommendation: 'STRONG_MATCH',
      matchedSkills: 'React,Next.js,TypeScript',
      missingSkills: 'Redux,CSS',
      relevantExperience: 'David has 5 years of frontend development experience, fully matching target.',
      potentialConcerns: 'None identified.',
      matchExplanation: 'Candidate matches 3 out of 5 core skills. Experience aligns perfectly.',
    },
  });

  // Create pending screening for David Miller
  const millerScreening = await prisma.screening.create({
    data: {
      applicationId: millerApp.id,
      status: 'PENDING',
      questions: {
        create: [
          { questionText: 'Can you describe your experience with Next.js App Router and layouts?', expectedPoints: 'Server vs client, folder structure.' },
          { questionText: 'How do you approach state management in a large-scale React application?', expectedPoints: 'Context vs Redux.' },
        ],
      },
    },
  });

  // Generate 49 more random candidates and applications
  for (let i = 0; i < 49; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${fn} ${ln}`;
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}.${i}@example.demo`;

    const skills = candidateSkillsPool[i % candidateSkillsPool.length];
    const yearsExp = 2 + (i % 6);

    const cand = await prisma.candidate.create({
      data: {
        name,
        email,
        phone: `+1 (555) 987-${1000 + i}`,
        location: locations[i % locations.length],
        yearsOfExperience: yearsExp,
        skills: skills.join(','),
        education: JSON.stringify({ degree: 'B.S. Degree', school: 'Tech Institute', year: '2019' }),
        experience: JSON.stringify([
          { role: 'Developer', company: 'Global Solutions', duration: '2019 - Present', description: 'Assisted in feature specifications.' },
        ]),
      },
    });
    candidatesCreated.push(cand);

    // Create 2 applications for this candidate to different jobs
    for (let appIdx = 0; appIdx < 2; appIdx++) {
      const jobIdx = (i + appIdx * 3) % jobs.length;
      const targetJob = jobs[jobIdx];
      
      const appStatus = stages[(i + appIdx) % stages.length];
      const matchScore = 50 + (i % 5) * 9 + (appIdx * 5); // 50 to 95
      let recommendation: 'STRONG_MATCH' | 'MATCH' | 'PARTIAL_MATCH' | 'LOW_MATCH' = 'PARTIAL_MATCH';
      if (matchScore >= 85) recommendation = 'STRONG_MATCH';
      else if (matchScore >= 70) recommendation = 'MATCH';
      else if (matchScore < 55) recommendation = 'LOW_MATCH';

      const app = await prisma.application.create({
        data: {
          jobId: targetJob.id,
          candidateId: cand.id,
          status: appStatus,
          matchScore,
          recommendation,
          matchedSkills: skills.slice(0, 3).join(','),
          missingSkills: targetJob.skills.split(',').filter(s => !skills.includes(s)).join(','),
          relevantExperience: `Candidate has ${yearsExp} years of experience matching job description.`,
          potentialConcerns: 'No significant concerns.',
          matchExplanation: `Matches core competencies. Scoring rate fits job guidelines.`,
        },
      });

      // For completed stages, seed completed AI screening evaluations
      if (appStatus === 'UNDER_REVIEW' || appStatus === 'INTERVIEW' || appStatus === 'SELECTED' || appStatus === 'HIRED') {
        const screening = await prisma.screening.create({
          data: {
            applicationId: app.id,
            status: 'COMPLETED',
            technicalScore: matchScore + 2 > 100 ? 100 : matchScore + 2,
            communicationScore: 75 + (i % 20),
            experienceScore: matchScore - 3,
            overallScore: Math.round((matchScore + 75 + (i % 20)) / 2),
            summary: 'The candidate performed strongly in technical response delivery, demonstrating key system knowledge.',
          },
        });

        // Seed 1 question answer for dashboard transcripts
        const question = await prisma.screeningQuestion.create({
          data: {
            screeningId: screening.id,
            questionText: 'Can you describe your experience with microservices and API gateways?',
            expectedPoints: 'Service discovery, routing patterns.',
          },
        });

        await prisma.screeningAnswer.create({
          data: {
            questionId: question.id,
            answerText: 'I worked on designing Docker containers communicating via REST API gateways. We used Consul for service discovery.',
            technicalAnalysis: 'Demonstrates solid operational experience with containerized deployments and REST communication.',
            communicationAnalysis: 'Structured response delivery with clear terminology.',
            experienceAnalysis: 'Hands-on history is evidenced in practical setup descriptions.',
            score: matchScore,
            explanation: 'Correct usage of docker gateways.',
          },
        });
      }

      // For Interview stage, seed interview slots and scheduled meetings
      if (appStatus === 'INTERVIEW') {
        const slotDate = new Date();
        slotDate.setDate(slotDate.getDate() + 2);

        const slot = await prisma.interviewSlot.create({
          data: {
            jobId: targetJob.id,
            date: slotDate,
            time: '11:00 AM - 12:00 PM',
            isBooked: true,
            applicationId: app.id,
          },
        });

        await prisma.interview.create({
          data: {
            applicationId: app.id,
            interviewerName: 'Marc Anderson',
            type: 'VIDEO',
            date: slotDate,
            timeSlot: slot.time,
            status: 'SCHEDULED',
          },
        });
      }
    }
  }

  // 6. Create Audit Logs & Notifications
  await prisma.auditLog.create({
    data: {
      userId: recruiter.id,
      action: 'ORGANIZATION_SEED',
      details: 'TechNova Solutions workspaces, jobs, and candidates populated via system seeder.',
    },
  });

  await prisma.notification.create({
    data: {
      userId: recruiter.id,
      title: 'Database Seeding Completed',
      message: 'Workspace populated with 10 jobs, 50 candidates, and 100 applications.',
      type: 'SUCCESS',
    },
  });

  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
