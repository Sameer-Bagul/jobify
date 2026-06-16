import { Zap, Send, TrendingUp, Crown } from 'lucide-react';

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

interface EmailStatisticsProps {
  stats: EmailStats;
}

export default function EmailStatistics({ stats }: EmailStatisticsProps) {
  const successRate = stats.totalSent + stats.totalFailed > 0
    ? Math.round((stats.totalSent / (stats.totalSent + stats.totalFailed)) * 100)
    : 0;

  const dailyUsagePercent = stats.dailyLimit > 0 
    ? Math.round((stats.dailySent / stats.dailyLimit) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="card border border-dark-600">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">Daily Usage</span>
          <Zap className="h-4 w-4 text-yellow-400" />
        </div>
        <div className="text-2xl font-bold text-white">
          {stats.dailySent} / {stats.dailyLimit}
        </div>
        <div className="mt-2 h-2 bg-dark-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
            style={{ width: `${Math.min(dailyUsagePercent, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">{stats.remaining} remaining today</p>
      </div>

      <div className="card border border-dark-600">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">Total Sent</span>
          <Send className="h-4 w-4 text-green-400" />
        </div>
        <div className="text-2xl font-bold text-white">{stats.totalSent}</div>
        <p className="text-xs text-gray-500 mt-1">All time emails</p>
      </div>

      <div className="card border border-dark-600">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">Success Rate</span>
          <TrendingUp className="h-4 w-4 text-blue-400" />
        </div>
        <div className="text-2xl font-bold text-white">{successRate}%</div>
        <p className="text-xs text-gray-500 mt-1">
          {stats.totalFailed} failed
        </p>
      </div>

      <div className="card border border-dark-600">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">Current Plan</span>
          <Crown className="h-4 w-4 text-purple-400" />
        </div>
        <div className="text-2xl font-bold text-white capitalize">{stats.planName}</div>
        <p className="text-xs text-gray-500 mt-1 capitalize">{stats.planTier} tier</p>
      </div>
    </div>
  );
}
