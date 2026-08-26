export interface User {
  id: string;
  googleId: string;
  name: string;
  email: string;
  avatar: string | null;
}

export interface Sender {
  id: string;
  name: string;
  email: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
}

export interface ScheduledEmailItem {
  id: string;
  recipient: string;
  status: "SCHEDULED" | "PROCESSING" | "SENT" | "FAILED";
  scheduledAt: string;
}

export interface Schedule {
  id: string;
  subject: string;
  body: string;
  startTime: string;
  delayBetweenEmails: number;
  hourlyLimit: number;
  status: string;
  sender?: {
    name: string;
    email: string;
  };
  emails: ScheduledEmailItem[];
  createdAt: string;
}

export interface SentEmailLog {
  id: string;
  recipient: string;
  status: "SENT" | "FAILED";
  scheduledAt: string;
  sentAt?: string | null;
  failedAt?: string | null;
  errorMessage?: string | null;
  schedule: {
    subject: string;
    body?: string;
    sender: {
      name: string;
      email: string;
    };
  };
}
