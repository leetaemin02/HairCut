const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // Create a transporter using standard SMTP transport (like Gmail)
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Define the email options
  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME || "TheBlueBlade Support"} <${process.env.EMAIL_FROM || process.env.EMAIL_USERNAME}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html, // Allow sending HTML templates
  };

  // Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
