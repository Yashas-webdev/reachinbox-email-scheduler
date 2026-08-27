import type { User, Sender, Schedule, SentEmailLog } from "../types";

const rawApiUrl = import.meta.env.VITE_API_URL || "https://reachinbox-backend-ul75.onrender.com";
const cleanBaseUrl = rawApiUrl.replace(/\/$/, "");
const API_BASE_URL = cleanBaseUrl.endsWith("/api") ? cleanBaseUrl : `${cleanBaseUrl}/api`;

// Helper function to handle all HTTP fetch requests cleanly
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || data.error || "API request failed");
  }

  return data;
}

// 1. Fetch current logged-in user profile
export const fetchMe = async (): Promise<User | null> => {
  try {
    const data = await apiRequest<{ user: User }>("/auth/me");
    return data.user;
  } catch {
    return null;
  }
};

// 2. Google Login
export const googleLoginApi = async (idToken: string): Promise<User> => {
  const data = await apiRequest<{ user: User }>("/auth/google", {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });
  return data.user;
};

// 3. Logout
export const logoutApi = async (): Promise<void> => {
  await apiRequest("/auth/logout", { method: "POST" });
};

// 4. Fetch User Senders
export const fetchSenders = async (): Promise<Sender[]> => {
  const data = await apiRequest<{ senders: Sender[] }>("/senders");
  return data.senders || [];
};

// 5. Create New Sender
export const createSenderApi = async (senderData: {
  name: string;
  email: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword?: string;
}): Promise<Sender> => {
  const data = await apiRequest<{ sender: Sender }>("/senders", {
    method: "POST",
    body: JSON.stringify(senderData),
  });
  return data.sender;
};

// 6. Fetch Scheduled Campaigns
export const fetchSchedules = async (): Promise<Schedule[]> => {
  const data = await apiRequest<{ schedules: Schedule[] }>("/schedules");
  return data.schedules || [];
};

// 7. Fetch Sent Email Logs
export const fetchSentEmails = async (): Promise<SentEmailLog[]> => {
  const data = await apiRequest<{ emails: SentEmailLog[] }>("/schedules/sent");
  return data.emails || [];
};

// 8. Create New Schedule Campaign
export const createScheduleApi = async (payload: {
  senderId: string;
  subject: string;
  body: string;
  recipients: string[];
  startTime: string;
  delayBetweenEmails: number;
  hourlyLimit: number;
}): Promise<Schedule> => {
  const data = await apiRequest<{ schedule: Schedule }>("/schedules", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.schedule;
};
