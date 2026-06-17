import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+?)[=:](.*)/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  });
}

import { Job } from '../lib/models/index';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable inside .env.local');
  process.exit(1);
}

const dummyJobs = [
  {
    title: "Senior React Developer",
    company: "TechNova Solutions",
    description: "We are looking for a senior developer with strong React and Node.js skills.",
    requiredSkills: ["react", "node.js", "typescript", "tailwindcss", "next.js"],
    location: "Remote",
    jobType: "full-time",
    experienceLevel: "senior",
    salaryMin: 100000,
    salaryMax: 150000,
    salaryCurrency: "USD",
  },
  {
    title: "Python Data Engineer",
    company: "DataWorks Inc.",
    description: "Build robust data pipelines using Python and AWS.",
    requiredSkills: ["python", "aws", "sql", "postgresql", "docker"],
    location: "New York, NY",
    jobType: "full-time",
    experienceLevel: "mid",
    salaryMin: 90000,
    salaryMax: 130000,
    salaryCurrency: "USD",
  },
  {
    title: "Frontend Intern",
    company: "StartupZ",
    description: "Great opportunity for a junior developer to learn React and CSS.",
    requiredSkills: ["react", "html", "css", "javascript"],
    location: "San Francisco, CA",
    jobType: "internship",
    experienceLevel: "entry",
    salaryMin: 40000,
    salaryMax: 60000,
    salaryCurrency: "USD",
  },
  {
    title: "DevOps Engineer",
    company: "CloudScale",
    description: "Manage infrastructure and deployments with Kubernetes and Docker.",
    requiredSkills: ["docker", "kubernetes", "aws", "terraform", "bash", "linux"],
    location: "Remote",
    jobType: "full-time",
    experienceLevel: "mid",
    salaryMin: 110000,
    salaryMax: 160000,
    salaryCurrency: "USD",
  },
  {
    title: "Backend Go Developer",
    company: "FinTech Fast",
    description: "Write high-performance microservices in Go.",
    requiredSkills: ["go", "grpc", "postgresql", "redis", "microservices"],
    location: "London, UK",
    jobType: "full-time",
    experienceLevel: "senior",
    salaryMin: 80000,
    salaryMax: 120000,
    salaryCurrency: "GBP",
  }
];

async function seedJobs() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const result = await Job.insertMany(dummyJobs);
    console.log(`Successfully seeded ${result.length} jobs.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding jobs:', error);
    process.exit(1);
  }
}

seedJobs();
