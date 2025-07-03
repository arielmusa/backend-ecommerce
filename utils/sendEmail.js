import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io", // ← Host di Mailtrap
  port: 2525, // ← Porta consigliata
  auth: {
    user: "295ce4dc67ef0e", // ← Inserisci qui il tuo user
    pass: "70f084121e6f03", // ← Inserisci qui la password
  },
});

export async function sendEmail(to, subject, text) {
  await transporter.sendMail({
    from: '"Republic of Retro" <no-reply@demo.com>', // mittente fittizio
    to, // destinatario
    subject, // oggetto
    text, // contenuto testuale
  });
}
