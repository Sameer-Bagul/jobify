import { useState } from 'react';
import { Settings, CheckCircle, AlertCircle, Save, Eye, EyeOff, Loader2 } from 'lucide-react';

interface GmailConfigurationProps {
  hasGmailSetup: boolean;
  gmailId: string;
  setGmailId: (id: string) => void;
  gmailAppPassword: string;
  setGmailAppPassword: (pwd: string) => void;
  savingGmail: boolean;
  gmailSuccess: string;
  gmailError: string;
  handleSaveGmail: () => void;
}

export default function GmailConfiguration({
  hasGmailSetup,
  gmailId,
  setGmailId,
  gmailAppPassword,
  setGmailAppPassword,
  savingGmail,
  gmailSuccess,
  gmailError,
  handleSaveGmail
}: GmailConfigurationProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="card border border-dark-600">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <Settings className="h-5 w-5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Gmail Configuration</h2>
          <p className="text-sm text-gray-400">Configure your Gmail account to send cold emails</p>
        </div>
        {hasGmailSetup && (
          <span className="ml-auto px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            Configured
          </span>
        )}
      </div>
      
      {gmailSuccess && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          {gmailSuccess}
        </div>
      )}
      
      {gmailError && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {gmailError}
        </div>
      )}
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Gmail ID</label>
          <input
            type="email"
            value={gmailId}
            onChange={(e) => setGmailId(e.target.value)}
            className="input-dark"
            placeholder="your-email@gmail.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">App Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={gmailAppPassword}
              onChange={(e) => setGmailAppPassword(e.target.value)}
              className="input-dark pr-10"
              placeholder="Enter your app password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Generate an app password from Google Account → Security → 2-Step Verification → App passwords
          </p>
        </div>
      </div>
      
      <button
        onClick={handleSaveGmail}
        disabled={savingGmail || !gmailId || !gmailAppPassword}
        className="mt-4 btn-primary flex items-center gap-2"
      >
        {savingGmail ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        Save Gmail Credentials
      </button>
    </div>
  );
}
