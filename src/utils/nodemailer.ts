import nodemailer from 'nodemailer';
export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  }
});

export const mailOptions = {
  from: process.env.GMAIL_USER,
  to: process.env.GMAIL_USER,

}