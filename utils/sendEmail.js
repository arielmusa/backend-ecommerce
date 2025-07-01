import nodemailer from "nodemailer";

export async function sendEmail(to, subject, text) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "tuoemail@gmail.com",
      pass: "tua-password-app",
    },
  });

  await transporter.sendMail({
    from: "tuoemail@gmail.com",
    to,
    subject,
    text,
  });
}
