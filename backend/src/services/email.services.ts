import nodemailer from "nodemailer";

const smtpHost = process.env.ETHEREAL_HOST || "smtp.ethereal.email";
const smtpPort = Number(process.env.ETHEREAL_PORT || 587);
const smtpUser = process.env.ETHEREAL_USER || "guy13@ethereal.email";
const smtpPassword = process.env.ETHEREAL_PASSWORD || "wFGnr3gFArvtTxw5pd";

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: smtpUser,
    pass: smtpPassword,
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
    from: smtpUser,
    to,
    subject,
    text: body,
  });

  return info;
};