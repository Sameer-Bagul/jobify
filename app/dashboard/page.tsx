"use client";

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Briefcase, Mail, TrendingUp, Calendar } from 'lucide-react';
import api from '@/lib/api';

interface Stats {
  emailsSent: number;
  emailsRemaining: number;
  jobsViewed: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const [matchedJobs, setMatchedJobs] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, jobsRes] = await Promise.all([
          api.get('/email/stats'),
          api.get('/jobs/match')
        ]);
        setStats(statsRes.data);
        if (jobsRes.data.jobs) {
          setMatchedJobs(jobsRes.data.jobs);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark-walnut mb-2">Dashboard</h1>
          <p className="text-gray-600">Track your job search progress</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center">
                <Mail className="h-6 w-6 text-tangerine-dream" />
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-walnut">{loading ? '-' : stats?.emailsSent || 0}</p>
                <p className="text-sm text-gray-600">Emails Sent Today</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-tangerine-dream" />
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-walnut">{loading ? '-' : stats?.emailsRemaining || 20}</p>
                <p className="text-sm text-gray-600">Emails Remaining</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-600/20 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-walnut">{loading ? '-' : stats?.jobsViewed || 0}</p>
                <p className="text-sm text-gray-600">Jobs Viewed</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center">
                <Calendar className="h-6 w-6 text-tangerine-dream" />
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-walnut">20</p>
                <p className="text-sm text-gray-600">Daily Email Limit</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-dark-walnut mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <a
                href="/jobs"
                className="flex items-center gap-3 p-4 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
              >
                <Briefcase className="h-5 w-5 text-tangerine-dream" />
                <span className="text-dark-walnut">Browse Jobs</span>
              </a>
              <a
                href="/email"
                className="flex items-center gap-3 p-4 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
              >
                <Mail className="h-5 w-5 text-tangerine-dream" />
                <span className="text-dark-walnut">Send Cold Emails</span>
              </a>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-dark-walnut mb-4">Tips for Success</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-tangerine-dream">•</span>
                Personalize each email with the company name
              </li>
              <li className="flex items-start gap-2">
                <span className="text-tangerine-dream">•</span>
                Follow up within 3-5 days if no response
              </li>
              <li className="flex items-start gap-2">
                <span className="text-tangerine-dream">•</span>
                Target companies that align with your skills
              </li>
              <li className="flex items-start gap-2">
                <span className="text-tangerine-dream">•</span>
                Keep your resume updated and relevant
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-dark-walnut flex items-center gap-2">
              <span className="text-tangerine-dream">✨</span> Recommended Jobs
            </h2>
          </div>
          
          {loading ? (
             <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-gray-300 border-t-tangerine-dream rounded-full animate-spin"></div></div>
          ) : matchedJobs.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchedJobs.map((job) => (
                <div key={job._id} className="card hover:border-tangerine-dream/50 transition-colors group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-dark-walnut group-hover:text-tangerine-dream transition-colors">{job.title}</h3>
                      <p className="text-sm text-gray-500">{job.company}</p>
                    </div>
                    <div className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">
                      {job.matchPercentage}% Match
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(job.matchedSkills || []).slice(0, 3).map((skill: string) => (
                      <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                    {(job.matchedSkills || []).length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">+{(job.matchedSkills || []).length - 3}</span>
                    )}
                  </div>
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-semibold text-dark-walnut">
                      {job.salaryCurrency === "USD" ? "$" : job.salaryCurrency === "GBP" ? "£" : "₹"}{(job.salaryMin / 1000).toFixed(0)}k - {(job.salaryMax / 1000).toFixed(0)}k
                    </span>
                    <a href="/jobs" className="text-tangerine-dream text-sm font-bold hover:underline">View Details</a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 border-dashed">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="font-bold text-gray-700 mb-2">No recommendations yet</h3>
              <p className="text-sm text-gray-500 mb-4">Upload your resume or add skills to your profile to get personalized job recommendations.</p>
              <a href="/account" className="btn-primary inline-flex">Update Profile</a>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
