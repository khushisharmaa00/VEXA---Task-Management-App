import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Create reusable transporter object
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email sending function
const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: `Task Manager <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${options.email}`);
    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    throw error;
  }
};

export default sendEmail;
