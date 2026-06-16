import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface EmailLog {
  _id: string;
  recipientEmail: string;
  subject: string;
  status: string;
  createdAt: string;
}

interface RecentEmailLogsProps {
  logs: EmailLog[];
}

export default function RecentEmailLogs({ logs }: RecentEmailLogsProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-400" />;
    }
  };

  return (
    <div className="card border border-dark-600">
      <h2 className="text-xl font-semibold text-dark-walnut mb-4">Recent Emails</h2>
      
      {logs.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No emails sent yet</p>
      ) : (
        <div className="space-y-3">
          {logs.slice(0, 10).map((log) => (
            <div key={log._id} className="p-3 bg-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-dark-walnut text-sm font-medium truncate">
                  {log.recipientEmail}
                </span>
                {getStatusIcon(log.status)}
              </div>
              <p className="text-gray-600 text-sm truncate">{log.subject}</p>
              <p className="text-gray-500 text-xs mt-1">
                {new Date(log.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
