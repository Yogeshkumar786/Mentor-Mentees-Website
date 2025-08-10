# 📧 Email Setup Guide

This guide explains how to configure email functionality for meeting notifications in the Mentor-Mentees system.

## 🔧 Required Environment Variables

Add these variables to your `.env` file:

```env
# Email Configuration
EMAIL_USER="your_email@gmail.com"
EMAIL_PASSWORD="your_app_password_here"
```

## 📧 Gmail Setup Instructions

### 1. Enable 2-Factor Authentication
- Go to your Google Account settings
- Navigate to Security
- Enable 2-Step Verification

### 2. Generate App Password
- Go to Security → App passwords
- Select "Mail" and "Other (Custom name)"
- Enter a name (e.g., "Mentor-Mentees System")
- Copy the generated 16-character password

### 3. Update .env File
- Replace `your_email@gmail.com` with your Gmail address
- Replace `your_app_password_here` with the generated app password

## 🚀 Testing Email Service

### Test Endpoint
```bash
GET /test-email
```

This endpoint tests the email connection and returns:
- ✅ Success: "Email service is working correctly"
- ❌ Error: "Email service is not working"

### Server Startup
The server automatically tests the email connection on startup and logs the status.

## 📨 Email Templates

### Location
Email templates are stored in `views/emails/meeting-notification.ejs`

### Features
- Responsive HTML design
- Professional styling
- Meeting details display
- Participant list
- Conditional HOD information

## 🔄 How It Works

### 1. Meeting Creation
When a faculty or HOD creates a meeting:
- Meeting is saved to database
- Email notifications are sent asynchronously
- All participants receive formatted emails

### 2. Email Recipients
- **Faculty**: Meeting organizer
- **Students**: All invited students
- **HOD**: Department HOD (if included)

### 3. Email Content
- Meeting date and time
- Description and organizer
- Participant list with roles
- Professional formatting

## 🛠️ Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify 2FA is enabled
   - Check app password is correct
   - Ensure email is not blocked

2. **Connection Timeout**
   - Check internet connection
   - Verify firewall settings
   - Try different SMTP port

3. **Template Errors**
   - Verify EJS syntax
   - Check template file path
   - Ensure all variables are defined

### Debug Mode
Enable detailed logging by checking console output for:
- Email service status
- Individual email delivery status
- Template rendering errors

## 📝 Example .env Configuration

```env
PORT=3000
JWT_SECRET="your_secret_key_here"
DATABASE_URL="postgresql://user:pass@localhost:5432/db"
EMAIL_USER="mentor.system@gmail.com"
EMAIL_PASSWORD="abcd efgh ijkl mnop"
```

## 🔒 Security Notes

- Never commit `.env` files to version control
- Use app passwords, not regular passwords
- Regularly rotate app passwords
- Monitor email usage for unusual activity
