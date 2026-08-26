import { prisma } from "../config/prisma.js";
import { emailQueue } from "../queues/email.queues.js";

interface CreateScheduleInput {
  senderId: string;
  subject: string;
  body: string;
  startTime: string;
  delayBetweenEmails: number;
  hourlyLimit: number;
  recipients: string[];
}

// Function 1: Create a new email schedule, calculate delays, save to PostgreSQL, and push BullMQ delayed jobs
export const createSchedule = async (
  userId: string,
  data: CreateScheduleInput
) => {
  // 1. Verify that the sender exists and belongs to the logged-in user
  const sender = await prisma.sender.findFirst({
    where: {
      id: data.senderId,
      userId,
    },
  });

  if (!sender) {
    throw new Error("Sender account not found or does not belong to user");
  }

  // 2. Base start time calculation
  const reqStartTime = new Date(data.startTime);
  const now = new Date();
  const baseStartTimeMs = reqStartTime.getTime() < now.getTime() ? now.getTime() : reqStartTime.getTime();

  const delaySec = Math.max(0, data.delayBetweenEmails || 0);
  const limitPerHour = Math.max(0, data.hourlyLimit || 0);

  // 3. Compute exact scheduledAt timestamp for each recipient (staggered delay + hourly limit windows)
  const recipientScheduleDetails = data.recipients.map((recipientEmail, i) => {
    let emailScheduledAtMs: number;

    if (limitPerHour > 0) {
      const hourWindowIndex = Math.floor(i / limitPerHour);
      const indexInWindow = i % limitPerHour;
      emailScheduledAtMs = baseStartTimeMs + (hourWindowIndex * 3600 * 1000) + (indexInWindow * delaySec * 1000);
    } else {
      emailScheduledAtMs = baseStartTimeMs + (i * delaySec * 1000);
    }

    return {
      recipient: recipientEmail.trim().toLowerCase(),
      scheduledAt: new Date(emailScheduledAtMs),
      status: "SCHEDULED" as const,
    };
  });

  // 4. Create Schedule & ScheduledEmail records in PostgreSQL
  const schedule = await prisma.schedule.create({
    data: {
      userId,
      senderId: data.senderId,
      subject: data.subject,
      body: data.body,
      startTime: new Date(baseStartTimeMs),
      delayBetweenEmails: delaySec,
      hourlyLimit: limitPerHour,
      status: "SCHEDULED",
      emails: {
        create: recipientScheduleDetails,
      },
    },
    include: {
      emails: true,
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // 5. Dispatch BullMQ delayed jobs to Redis for each ScheduledEmail
  const updatedEmails = await Promise.all(
    schedule.emails.map(async (email) => {
      const delayMs = Math.max(0, email.scheduledAt.getTime() - Date.now());

      const job = await emailQueue.add(
        "send-email",
        {
          emailId: email.id,
          scheduleId: schedule.id,
        },
        {
          delay: delayMs,
        }
      );

      // Save the generated BullMQ job ID in PostgreSQL
      if (job.id) {
        await prisma.scheduledEmail.update({
          where: { id: email.id },
          data: { bullJobId: job.id },
        });
      }

      return {
        ...email,
        bullJobId: job.id ?? null,
      };
    })
  );

  return {
    ...schedule,
    emails: updatedEmails,
  };
};

// Function 2: Fetch all schedules created by the logged-in user
export const getSchedules = async (userId: string) => {
  const rawSchedules = await prisma.schedule.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      emails: {
        select: {
          id: true,
          recipient: true,
          status: true,
          scheduledAt: true,
          sentAt: true,
          failedAt: true,
          errorMessage: true,
        },
      },
    },
  });

  return rawSchedules.map((schedule) => {
    const total = schedule.emails.length;
    const sentCount = schedule.emails.filter((e) => e.status === "SENT").length;
    const failedCount = schedule.emails.filter((e) => e.status === "FAILED").length;
    const processingCount = schedule.emails.filter((e) => e.status === "PROCESSING").length;

    let computedStatus = schedule.status;

    if (total > 0 && sentCount + failedCount === total) {
      computedStatus = "COMPLETED";
    } else if (processingCount > 0) {
      computedStatus = "PROCESSING";
    }

    return {
      ...schedule,
      status: computedStatus,
    };
  });
};

// Function 3: Fetch all sent or failed email logs for the logged-in user
export const getSentEmails = async (userId: string) => {
  return prisma.scheduledEmail.findMany({
    where: {
      schedule: {
        userId,
      },
      status: {
        in: ["SENT", "FAILED"],
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      schedule: {
        select: {
          id: true,
          subject: true,
          body: true,
          sender: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });
};
