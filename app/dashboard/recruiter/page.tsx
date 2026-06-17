"use client";

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Briefcase, Users, TrendingUp, Clock } from 'lucide-react';
import api from '@/lib/api';

interface Stats {
  totalJobs: number;
  activeJobs: number;
  totalCandidates: number;
}

export default function RecruiterDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/recruiters/jobs');
        const jobs = Array.isArray(res.data) ? res.data : [];
        setStats({
          totalJobs: jobs.length,
          activeJobs: jobs.filter((j: { isActive: boolean }) => j.isActive).length,
          totalCandidates: 0,
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark-walnut mb-2">Recruiter Dashboard</h1>
          <p className="text-gray-600">Manage your job postings and candidates</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-tangerine-dream" />
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-walnut">{loading ? '-' : stats?.totalJobs || 0}</p>
                <p className="text-sm text-gray-600">Total Jobs</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-600/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-walnut">{loading ? '-' : stats?.activeJobs || 0}</p>
                <p className="text-sm text-gray-600">Active Jobs</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center">
                <Users className="h-6 w-6 text-tangerine-dream" />
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-walnut">{loading ? '-' : stats?.totalCandidates || 0}</p>
                <p className="text-sm text-gray-600">Candidates</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center">
                <Clock className="h-6 w-6 text-tangerine-dream" />
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-walnut">24h</p>
                <p className="text-sm text-gray-600">Avg Response</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-dark-walnut mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <a
                href="/dashboard/recruiter/post-job"
                className="flex items-center gap-3 p-4 rounded-lg bg-gray-200 hover:bg-dark-600 transition-colors"
              >
                <Briefcase className="h-5 w-5 text-tangerine-dream" />
                <span className="text-dark-walnut">Post New Job</span>
              </a>
              <a
                href="/dashboard/recruiter/candidates"
                className="flex items-center gap-3 p-4 rounded-lg bg-gray-200 hover:bg-dark-600 transition-colors"
              >
                <Users className="h-5 w-5 text-tangerine-dream" />
                <span className="text-dark-walnut">View Candidates</span>
              </a>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-dark-walnut mb-4">Hiring Tips</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-tangerine-dream">•</span>
                Write clear job descriptions with specific requirements
              </li>
              <li className="flex items-start gap-2">
                <span className="text-tangerine-dream">•</span>
                Respond to candidates within 48 hours
              </li>
              <li className="flex items-start gap-2">
                <span className="text-tangerine-dream">•</span>
                Use skill-based matching to find top candidates
              </li>
              <li className="flex items-start gap-2">
                <span className="text-tangerine-dream">•</span>
                Keep your company profile updated
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
