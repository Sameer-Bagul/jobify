export const env = {
  jwtSecret: process.env.JWT_SECRET || "default_secret",
  mongoUri: process.env.MONGODB_URI || "",
  encryptionKey: process.env.ENCRYPTION_KEY || "0123456789abcdef0123456789abcdef",
  gmailUser: process.env.GMAIL_USER || "",
  gmailAppPassword: process.env.GMAIL_APP_PASSWORD || "",
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || "",
};
