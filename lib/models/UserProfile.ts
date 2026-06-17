import mongoose, { Document, Schema } from "mongoose";

export interface IUserProfile extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  skills: string[];
  experience: string;
  projects: string;
  education: string;
  gmailId: string;
  gmailAppPassword: string;
  resumeUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
  location: string;
  currentJobTitle: string;
  resumeAnalysis: {
    extractedSkills: string[];
    experienceSummary: string | null;
    projectsSummary: string | null;
  };
  dailyEmailSentCount: number;
  lastEmailResetDate: Date;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userProfileSchema = new Schema<IUserProfile>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  name: {
    type: String,
    default: null,
  },
  phone: {
    type: String,
    default: null,
  },
  skills: {
    type: [String],
    default: [],
  },
  experience: {
    type: String,
    default: null,
  },
  projects: {
    type: String,
    default: null,
  },
  education: {
    type: String,
    default: null,
  },
  gmailId: {
    type: String,
    default: null,
  },
  gmailAppPassword: {
    type: String,
    default: null,
  },
  resumeUrl: {
    type: String,
    default: null,
  },
  linkedinUrl: {
    type: String,
    default: null,
  },
  portfolioUrl: {
    type: String,
    default: null,
  },
  location: {
    type: String,
    default: null,
  },
  currentJobTitle: {
    type: String,
    default: null,
  },
  resumeAnalysis: {
    extractedSkills: {
      type: [String],
      default: [],
    },
    experienceSummary: {
      type: String,
      default: null,
    },
    projectsSummary: {
      type: String,
      default: null,
    },
  },
  dailyEmailSentCount: {
    type: Number,
    default: 0,
  },
  lastEmailResetDate: {
    type: Date,
    default: null,
  },
  onboardingCompleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { strict: false });

userProfileSchema.pre('save', function() {
  this.updatedAt = new Date();
});

// Clear cache for hot reloading
if (mongoose.models.UserProfile) {
  delete mongoose.models.UserProfile;
}

export default mongoose.model<IUserProfile>("UserProfile", userProfileSchema);
