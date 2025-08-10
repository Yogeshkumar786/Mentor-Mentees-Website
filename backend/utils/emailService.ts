import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your SMTP service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD // Use app password for Gmail
  }
});

// Email template path
const templatePath = path.join(__dirname, '../views/emails/meeting-notification.ejs');

// Interface for meeting data
interface MeetingData {
  date: string;
  time: string;
  description: string;
  organizerName: string;
  hodName?: string;
  isHODIncluded: boolean;
  participants: Array<{
    name: string;
    role: string;
    email: string;
  }>;
}

// Send meeting notification email
export const sendMeetingNotification = async (
  recipientEmail: string,
  recipientName: string,
  meetingData: MeetingData
): Promise<boolean> => {
  try {
    // Render EJS template
    const htmlContent = await ejs.renderFile(templatePath, {
      recipientName,
      meetingDate: meetingData.date,
      meetingTime: meetingData.time,
      meetingDescription: meetingData.description,
      organizerName: meetingData.organizerName,
      hodName: meetingData.hodName,
      isHODIncluded: meetingData.isHODIncluded,
      participants: meetingData.participants
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `📅 Meeting Notification - ${meetingData.date}`,
      html: htmlContent
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`Meeting notification sent to ${recipientEmail}`);
    return true;
  } catch (error) {
    console.error(`Failed to send email to ${recipientEmail}:`, error);
    return false;
  }
};

// Send meeting notifications to all participants
export const sendMeetingNotificationsToAll = async (
  meetingData: MeetingData
): Promise<void> => {
  const emailPromises = meetingData.participants.map(participant =>
    sendMeetingNotification(
      participant.email,
      participant.name,
      meetingData
    )
  );

  try {
    await Promise.all(emailPromises);
    console.log('Meeting notifications sent to all participants');
  } catch (error) {
    console.error('Error sending meeting notifications:', error);
  }
};

// Test email configuration
export const testEmailConnection = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    console.log('Email service is ready');
    return true;
  } catch (error) {
    console.error('Email service error:', error);
    return false;
  }
};

export default {
  sendMeetingNotification,
  sendMeetingNotificationsToAll,
  testEmailConnection
};
