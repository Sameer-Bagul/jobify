"use client";

import { useState, useEffect, useMemo } from 'react';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { 
  Send, Loader2, CheckCircle, AlertCircle, Mail, 
  Users, Search, Building2, MapPin,
  Save, RefreshCw, UserPlus, Filter
} from 'lucide-react';
import api, { emailApi, userApi } from '@/lib/api';
import GmailConfiguration from '@/components/email/GmailConfiguration';
import EmailStatistics from '@/components/email/EmailStatistics';
import RecentEmailLogs from '@/components/email/RecentEmailLogs';

interface EmailStats {
  dailySent: number;
  dailyLimit: number;
  remaining: number;
  totalSent: number;
  totalFailed: number;
  hasGmailSetup: boolean;
  hasResume: boolean;
  isSubscribed: boolean;
  planName: string;
  planTier: string;
}

interface Recruiter {
  _id: string;
  recruiterName: string;
  recruiterEmail: string;
  companyName: string;
  industry?: string;
  location?: string;
  isInternal: boolean;
}

interface EmailLog {
  _id: string;
  recipientEmail: string;
  subject: string;
  status: string;
  createdAt: string;
}

function EmailContent() {
  const searchParams = useSearchParams();
  
  const [stats, setStats] = useState<EmailStats>({
    dailySent: 0,
    dailyLimit: 20,
    remaining: 20,
    totalSent: 0,
    totalFailed: 0,
    hasGmailSetup: false,
    hasResume: false,
    isSubscribed: false,
    planName: 'Free',
    planTier: 'free'
  });
  
  const [gmailId, setGmailId] = useState('');
  const [gmailAppPassword, setGmailAppPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [savingGmail, setSavingGmail] = useState(false);
  const [gmailSuccess, setGmailSuccess] = useState('');
  const [gmailError, setGmailError] = useState('');
  
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [loadingRecruiters, setLoadingRecruiters] = useState(true);
  const [recruiterSearch, setRecruiterSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  
  const [selectedRecruiter, setSelectedRecruiter] = useState<Recruiter | null>(null);
  const [isExternalRecruiter, setIsExternalRecruiter] = useState(false);
  const [externalEmail, setExternalEmail] = useState('');
  const [externalName, setExternalName] = useState('');
  const [externalCompany, setExternalCompany] = useState('');
  
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState('');
  
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [activeTab, setActiveTab] = useState<'platform' | 'external'>('platform');

  const jobTitle = searchParams.get('job');
  const company = searchParams.get('company');



  const fetchStats = async () => {
    try {
      const res = await emailApi.getStats();
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchRecruiters = async () => {
    setLoadingRecruiters(true);
    try {
      const res = await emailApi.getRecruiters();
      setRecruiters(res.data.recruiters || res.data || []);
    } catch (err) {
      console.error('Failed to fetch recruiters:', err);
    } finally {
      setLoadingRecruiters(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await api.get('/email/logs');
      setLogs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
      setLogs([]); // Ensure logs is always an array
    }
  };

  const fetchUserGmail = async () => {
    try {
      const res = await userApi.getMe();
      if (res.data.gmailId) {
        setGmailId(res.data.gmailId);
      }
    } catch (err) {
      console.error('Failed to fetch user data:', err);
    }
  };

  useEffect(() => {
    if (jobTitle && company) {
      setSubject(`Application for ${jobTitle} position at ${company}`);
      setBody(`Dear Hiring Manager,

I am writing to express my interest in the ${jobTitle} position at ${company}. I believe my skills and experience make me a strong candidate for this role.

I would welcome the opportunity to discuss how I can contribute to your team.

Best regards`);
    }
  }, [jobTitle, company]);

  useEffect(() => {
    fetchStats();
    fetchRecruiters();
    fetchLogs();
    fetchUserGmail();
  }, []);

  const handleSaveGmail = async () => {
    setSavingGmail(true);
    setGmailError('');
    setGmailSuccess('');
    
    try {
      await userApi.updateGmailCredentials({ gmailId, gmailAppPassword });
      setGmailSuccess('Gmail credentials saved successfully!');
      setGmailAppPassword('');
      fetchStats();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setGmailError(error.response?.data?.message || 'Failed to save Gmail credentials');
    } finally {
      setSavingGmail(false);
    }
  };

  const filteredRecruiters = useMemo(() => {
    return recruiters.filter(r => {
      const matchesSearch = 
        r.recruiterName?.toLowerCase().includes(recruiterSearch.toLowerCase()) ||
        r.recruiterEmail?.toLowerCase().includes(recruiterSearch.toLowerCase()) ||
        r.companyName?.toLowerCase().includes(recruiterSearch.toLowerCase());
      
      const matchesIndustry = !industryFilter || r.industry === industryFilter;
      const matchesLocation = !locationFilter || r.location === locationFilter;
      
      return matchesSearch && matchesIndustry && matchesLocation;
    });
  }, [recruiters, recruiterSearch, industryFilter, locationFilter]);

  const industries = useMemo(() => {
    const unique = new Set(recruiters.map(r => r.industry).filter(Boolean));
    return Array.from(unique);
  }, [recruiters]);

  const locations = useMemo(() => {
    const unique = new Set(recruiters.map(r => r.location).filter(Boolean));
    return Array.from(unique);
  }, [recruiters]);

  const handleSelectRecruiter = (recruiter: Recruiter) => {
    setSelectedRecruiter(recruiter);
    setIsExternalRecruiter(false);
    setExternalEmail('');
    setExternalName('');
    setExternalCompany('');
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSendError('');
    setSendSuccess(false);

    const recipientEmail = isExternalRecruiter ? externalEmail : selectedRecruiter?.recruiterEmail;
    const recipientName = isExternalRecruiter ? externalName : selectedRecruiter?.recruiterName;
    const companyName = isExternalRecruiter ? externalCompany : selectedRecruiter?.companyName;

    if (!recipientEmail) {
      setSendError('Please select a recruiter or enter an email address');
      setSending(false);
      return;
    }

    try {
      await api.post('/email/send', {
        recruiterEmail: recipientEmail,
        recruiterName: recipientName || '',
        companyName: companyName || '',
        subject,
        body
      });
      setSendSuccess(true);
      setSubject('');
      setBody('');
      setSelectedRecruiter(null);
      setExternalEmail('');
      setExternalName('');
      setExternalCompany('');
      fetchLogs();
      fetchStats();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setSendError(error.response?.data?.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };


  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-dark-walnut mb-2 flex items-center gap-3">
            <Mail className="h-8 w-8 text-tangerine-dream" />
            Cold Email Center
          </h1>
          <p className="text-gray-600">
            Send professional cold emails to recruiters and track your outreach
          </p>
        </div>

        <GmailConfiguration 
          hasGmailSetup={stats.hasGmailSetup}
          gmailId={gmailId}
          setGmailId={setGmailId}
          gmailAppPassword={gmailAppPassword}
          setGmailAppPassword={setGmailAppPassword}
          savingGmail={savingGmail}
          gmailSuccess={gmailSuccess}
          gmailError={gmailError}
          handleSaveGmail={handleSaveGmail}
        />

        <EmailStatistics stats={stats} />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card border border-dark-600">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg">
                  <Users className="h-5 w-5 text-tangerine-dream" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-dark-walnut">Select Recruiter</h2>
                  <p className="text-sm text-gray-600">Choose a recruiter to contact</p>
                </div>
              </div>
              <button
                onClick={fetchRecruiters}
                className="p-2 text-gray-600 hover:text-dark-walnut hover:bg-gray-200 rounded-lg transition-colors"
                title="Refresh recruiters"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => {
                  setActiveTab('platform');
                  setIsExternalRecruiter(false);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'platform'
                    ? 'bg-white text-tangerine-dream border border-tangerine-dream/30'
                    : 'text-gray-600 hover:text-dark-walnut hover:bg-gray-200'
                }`}
              >
                <Users className="h-4 w-4 inline mr-2" />
                Platform Recruiters
              </button>
              <button
                onClick={() => {
                  setActiveTab('external');
                  setIsExternalRecruiter(true);
                  setSelectedRecruiter(null);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'external'
                    ? 'bg-white text-tangerine-dream border border-tangerine-dream/30'
                    : 'text-gray-600 hover:text-dark-walnut hover:bg-gray-200'
                }`}
              >
                <UserPlus className="h-4 w-4 inline mr-2" />
                External Recruiter
              </button>
            </div>

            {activeTab === 'platform' ? (
              <>
                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                    <input
                      type="text"
                      value={recruiterSearch}
                      onChange={(e) => setRecruiterSearch(e.target.value)}
                      className="input-dark pl-10"
                      placeholder="Search recruiters..."
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                    <select
                      value={industryFilter}
                      onChange={(e) => setIndustryFilter(e.target.value)}
                      className="input-dark pl-10 pr-8 appearance-none cursor-pointer"
                    >
                      <option value="">All Industries</option>
                      {industries.map(ind => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                    <select
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="input-dark pl-10 pr-8 appearance-none cursor-pointer"
                    >
                      <option value="">All Locations</option>
                      {locations.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {loadingRecruiters ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-tangerine-dream" />
                  </div>
                ) : filteredRecruiters.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-600">No recruiters found</p>
                    <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
                    {filteredRecruiters.map(recruiter => (
                      <div
                        key={recruiter._id}
                        onClick={() => handleSelectRecruiter(recruiter)}
                        className={`p-4 rounded-lg cursor-pointer transition-all ${
                          selectedRecruiter?._id === recruiter._id
                            ? 'bg-white border border-tangerine-dream/30'
                            : 'bg-gray-200 hover:bg-dark-600 border border-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-dark-walnut">{recruiter.recruiterName}</h3>
                              {recruiter.isInternal && (
                                <span className="px-2 py-0.5 bg-white text-tangerine-dream text-xs rounded-full">
                                  Verified
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{recruiter.recruiterEmail}</p>
                          </div>
                          {selectedRecruiter?._id === recruiter._id && (
                            <CheckCircle className="h-5 w-5 text-tangerine-dream" />
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          {recruiter.companyName && (
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {recruiter.companyName}
                            </span>
                          )}
                          {recruiter.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {recruiter.location}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Enter the details of a recruiter not in our platform
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={externalEmail}
                    onChange={(e) => setExternalEmail(e.target.value)}
                    className="input-dark"
                    placeholder="recruiter@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recruiter Name</label>
                  <input
                    type="text"
                    value={externalName}
                    onChange={(e) => setExternalName(e.target.value)}
                    className="input-dark"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                  <input
                    type="text"
                    value={externalCompany}
                    onChange={(e) => setExternalCompany(e.target.value)}
                    className="input-dark"
                    placeholder="Company Inc."
                  />
                </div>
              </div>
            )}
          </div>

          <div className="card border border-dark-600">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white rounded-lg">
                <Send className="h-5 w-5 text-tangerine-dream" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-dark-walnut">Compose Email</h2>
                <p className="text-sm text-gray-600">Write your cold email</p>
              </div>
            </div>

            {sendSuccess && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Email sent successfully!
              </div>
            )}

            {sendError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {sendError}
              </div>
            )}

            {!stats.hasGmailSetup && (
              <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-400 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Please configure your Gmail credentials above to send emails
              </div>
            )}

            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                <div className="input-dark bg-gray-200 text-gray-600">
                  {isExternalRecruiter ? (
                    externalEmail || 'Enter external recruiter email'
                  ) : selectedRecruiter ? (
                    <span className="text-dark-walnut">{selectedRecruiter.recruiterEmail}</span>
                  ) : (
                    'Select a recruiter from the list'
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="input-dark"
                  placeholder="Application for [Position]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="input-dark h-48 resize-none"
                  placeholder="Write your message..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={
                  sending || 
                  stats.remaining <= 0 || 
                  !stats.hasGmailSetup ||
                  (!selectedRecruiter && !externalEmail)
                }
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Send Email
                  </>
                )}
              </button>

              {stats.remaining <= 0 && (
                <p className="text-center text-sm text-red-400">
                  You&apos;ve reached your daily email limit. Upgrade your plan for more.
                </p>
              )}
            </form>
          </div>
        </div>

        <RecentEmailLogs logs={logs} />
      </div>
    </Layout>
  );
}

export default function Email() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-tangerine-dream" /></div>}>
      <EmailContent />
    </Suspense>
  );
}
