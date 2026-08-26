import "dotenv/config";
import { Worker } from "bullmq";
import nodemailer from "nodemailer";
import redis from "../config/redis.js";
import { prisma } from "../config/prisma.js";

// Configurable concurrency from process environment (defaults to 5)
const concurrency = Number(process.env.WORKER_CONCURRENCY) || 5;

// Create BullMQ Worker listening on the "email-scheduler" queue
const worker = new Worker(
  "email-scheduler",
  async (job) => {
    const { emailId } = job.data as { emailId: string; scheduleId: string };

    console.log(`[Worker] Processing email job ID: ${job.id}, emailId: ${emailId}`);

    // 1. Fetch ScheduledEmail from PostgreSQL database
    const scheduledEmail = await prisma.scheduledEmail.findUnique({
      where: { id: emailId },
      include: {
        schedule: {
          include: {
            sender: true,
          },
        },
      },
    });

    if (!scheduledEmail) {
      console.warn(`[Worker] ScheduledEmail ${emailId} not found in database. Skipping.`);
      return { skipped: true, reason: "not_found" };
    }

    // 2. Idempotency Check: Skip if email is already SENT or FAILED
    if (scheduledEmail.status === "SENT") {
      console.log(`[Worker] Email ${emailId} is already SENT. Skipping to prevent duplicate dispatch.`);
      return { skipped: true, reason: "already_sent" };
    }

    if (scheduledEmail.status === "FAILED") {
      console.log(`[Worker] Email ${emailId} is already marked FAILED. Skipping.`);
      return { skipped: true, reason: "already_failed" };
    }

    const { schedule } = scheduledEmail;
    const { sender } = schedule;

    // 3. Redis-backed Hourly Rate Limiter
    const now = new Date();
    const hourKey = `${now.getUTCFullYear()}-${now.getUTCMonth() + 1}-${now.getUTCDate()}-${now.getUTCHours()}`;
    const rateLimitRedisKey = `sender:${sender.id}:hour:${hourKey}`;

    if (schedule.hourlyLimit > 0) {
      const currentHourlyCount = await redis.incr(rateLimitRedisKey);

      // Set key TTL to 2 hours if newly created
      if (currentHourlyCount === 1) {
        await redis.expire(rateLimitRedisKey, 7200);
      }

      if (currentHourlyCount > schedule.hourlyLimit) {
        console.warn(`[Worker] Hourly limit (${schedule.hourlyLimit}) exceeded for sender ${sender.email}. Current: ${currentHourlyCount}.`);
        
        // Re-decrement Redis counter since this email won't be sent this hour
        await redis.decr(rateLimitRedisKey);

        // Move to next hour window
        const nextHour = new Date(now);
        nextHour.setUTCHours(nextHour.getUTCHours() + 1, 0, 0, 0);
        const delayMs = Math.max(1000, nextHour.getTime() - now.getTime());

        console.log(`[Worker] Rescheduling job ${job.id} to next hour in ${Math.round(delayMs / 1000)}s.`);
        await job.moveToDelayed(Date.now() + delayMs, job.token);
        return { rescheduled: true, nextHourDelayMs: delayMs };
      }
    }

    // 4. Mark status as PROCESSING in PostgreSQL
    await prisma.scheduledEmail.update({
      where: { id: emailId },
      data: { status: "PROCESSING" },
    });

    try {
      let authUser = sender.smtpUser;
      let authPass = sender.smtpPassword;

      // 5. If using Ethereal with demo credentials, dynamically generate a real Ethereal test account
      if (
        sender.smtpHost.includes("ethereal") &&
        (authPass === "demo_password" || authUser === "demo_ethereal_user" || !authPass)
      ) {
        try {
          const testAccount = await nodemailer.createTestAccount();
          authUser = testAccount.user;
          authPass = testAccount.pass;
        } catch (accountErr) {
          console.warn("[Worker] Could not create Ethereal test account, using stored credentials:", accountErr);
        }
      }

      // Create Nodemailer Transporter with Sender SMTP credentials & timeout settings
      const transporter = nodemailer.createTransport({
        host: sender.smtpHost,
        port: sender.smtpPort,
        secure: sender.smtpPort === 465,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        auth: {
          user: authUser,
          pass: authPass,
        },
      });

      // Send email via Nodemailer
      const info = await transporter.sendMail({
        from: `"${sender.name}" <${sender.email}>`,
        to: scheduledEmail.recipient,
        subject: schedule.subject,
        text: schedule.body,
        html: `<p>${schedule.body.replace(/\n/g, "<br>")}</p>`,
      });

      console.log(`[Worker] Email sent successfully to ${scheduledEmail.recipient}. MessageId: ${info.messageId}`);

      // 6. Update status to SENT in PostgreSQL
      await prisma.scheduledEmail.update({
        where: { id: emailId },
        data: {
          status: "SENT",
          sentAt: new Date(),
        },
      });

      // Check if all emails for this schedule are now processed
      const pendingCount = await prisma.scheduledEmail.count({
        where: {
          scheduleId: schedule.id,
          status: { in: ["SCHEDULED", "PROCESSING"] },
        },
      });

      if (pendingCount === 0) {
        await prisma.schedule.update({
          where: { id: schedule.id },
          data: { status: "COMPLETED" },
        });
      }

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (sendError) {
      const errorMsg = sendError instanceof Error ? sendError.message : String(sendError);
      console.error(`[Worker] Failed to send email to ${scheduledEmail.recipient}:`, errorMsg);

      // Update status to FAILED in PostgreSQL
      await prisma.scheduledEmail.update({
        where: { id: emailId },
        data: {
          status: "FAILED",
          failedAt: new Date(),
          errorMessage: errorMsg,
        },
      });

      throw sendError;
    }
  },
  {
    connection: redis,
    concurrency,
  }
);

worker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} completed successfully.`);
});

worker.on("failed", (job, error) => {
  console.error(`[Worker] Job ${job?.id} failed with error:`, error.message);
});

console.log(`[Worker] Email worker started with concurrency = ${concurrency}`);
