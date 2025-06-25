const nodemailer = require('nodemailer');

// Configure transporter with your Gmail credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'abdullahmehmood454@gmail.com',
    pass: 'jskmrjslyzokkley', // App Password without spaces
  },
});

const sendEmail = async (req, res) => {
  const { to, subject, html } = req.body;

  // Validate request body
  if (!to || !subject || !html) {
    return res.status(400).json({ message: 'To, subject, and html are required' });
  }

  const mailOptions = {
  from: '"Simplify" <abdullahmehmood454@gmail.com>',
    to,
    subject,
    html, // Use html instead of text
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
};

module.exports = { sendEmail };