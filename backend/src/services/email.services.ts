import nodemailer from "nodemailer";

const smtpPort = Number(process.env.ETHEREAL_PORT);

if (!process.env.ETHEREAL_HOST) {
  throw new Error("ETHEREAL_HOST is not defined");
}

if (!process.env.ETHEREAL_USER) {
  throw new Error("ETHEREAL_USER is not defined");
}

if (!process.env.ETHEREAL_PASSWORD) {
  throw new Error("ETHEREAL_PASSWORD is not defined");
}

const transporter = nodemailer.createTransport({
  host: process.env.ETHEREAL_HOST,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: process.env.ETHEREAL_USER,
    pass: process.env.ETHEREAL_PASSWORD,
  },
});

export const sendEmail = async ({
  to,
  subject,
  body,
}: {
  to: string;
  subject: string;
  body: string;
}) => {
  const info = await transporter.sendMail({
    from: process.env.ETHEREAL_USER,
    to,
    subject,
    text: body,
  });

  return info;
};