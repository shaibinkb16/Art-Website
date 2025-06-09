const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post('/api/send', async (req, res) => {
  const { type, data } = req.body;

  let subject = '';
  let html = '';

  if (type === 'call') {
    subject = `New Call Booking from ${data.firstName} ${data.lastName}`;
    html = `
      <h2>Call Booking Details</h2>
      <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phone}</p>
      <p><strong>Company:</strong> ${data.company}</p>
      <p><strong>Date:</strong> ${data.date}</p>
      <p><strong>Time:</strong> ${data.time}</p>
      <p><strong>Priority:</strong> ${data.priority}</p>
      <p><strong>Message:</strong><br>${data.message}</p>
    `;
  } else if (type === 'email') {
    subject = `New Message from ${data.firstName} ${data.lastName}`;
    html = `
      <h2>Message Details</h2>
      <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Priority:</strong> ${data.priority}</p>
      <p><strong>Message:</strong><br>${data.message}</p>
      <p><strong>Phone:</strong> ${data.phone}</p>
      <p><strong>Company:</strong> ${data.company}</p>
    `;
  } else {
    return res.status(400).json({ success: false, message: 'Invalid type.' });
  }

  try {
    await transporter.sendMail({
      from: `"Website Form" <${process.env.EMAIL_USER}>`,
      to: process.env.RECEIVER_EMAIL,
      subject,
      html,
    });

    res.status(200).json({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Email failed to send.' });
  }
});

app.post('/api/schedule-demo', async (req, res) => {
  const { type, data } = req.body;

  if (type !== 'demo') {
    return res.status(400).json({ success: false, message: 'Invalid type.' });
  }

  try {
    // Format the date nicely
    const demoDate = new Date(data.date);
    const formattedDate = demoDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Email to admin
    const adminSubject = `New Demo Scheduled: ${data.service} by ${data.name}`;
    const adminHtml = `
      <h2>Demo Scheduled Details</h2>
      <p><strong>Service:</strong> ${data.service}</p>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Company:</strong> ${data.company}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phone}</p>
      <p><strong>Date:</strong> ${formattedDate}</p>
      <p><strong>Time:</strong> ${data.time}</p>
      <p><strong>Attendees:</strong> ${data.attendees}</p>
      <p><strong>Message:</strong><br>${data.message || 'None'}</p>
    `;

    await transporter.sendMail({
      from: `"Demo Scheduler" <${process.env.EMAIL_USER}>`,
      to: process.env.RECEIVER_EMAIL,
      subject: adminSubject,
      html: adminHtml,
    });

    // Confirmation email to user
    const userSubject = `Your ${data.service} Demo Confirmation`;
    const userHtml = `
      <h2>Thank you for scheduling a demo!</h2>
      <p>We're excited to show you our ${data.service} solution.</p>
      
      <h3>Demo Details</h3>
      <p><strong>Service:</strong> ${data.service}</p>
      <p><strong>Date:</strong> ${formattedDate}</p>
      <p><strong>Time:</strong> ${data.time}</p>
      <p><strong>Duration:</strong> 30 minutes</p>
      
      <h3>What to Expect</h3>
      <ul>
        <li>Live demo of ${data.service} features</li>
        <li>Q&amp;A with our product experts</li>
        <li>Personalized recommendations for your business</li>
      </ul>
      
      <p>If you need to reschedule or have any questions, please reply to this email.</p>
      
      <p>Best regards,<br>Your Company Team</p>
    `;

    await transporter.sendMail({
      from: `"Demo Scheduler" <${process.env.EMAIL_USER}>`,
      to: data.email,
      subject: userSubject,
      html: userHtml,
    });

    res.status(200).json({ success: true, message: 'Demo scheduled and confirmation sent!' });
  } catch (error) {
    console.error('Error sending demo emails:', error);
    res.status(500).json({ success: false, message: 'Failed to schedule demo.' });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
