import dotenv from 'dotenv';
import { testEmailConnection } from './utils/emailService.js';

dotenv.config();

console.log('🧪 Testing Email Service...\n');

console.log('📧 Email Configuration:');
console.log(`User: ${process.env.EMAIL_USER || 'NOT SET'}`);
console.log(`Password: ${process.env.EMAIL_PASSWORD ? 'SET' : 'NOT SET'}\n`);

async function testEmail() {
  try {
    console.log('🔌 Testing connection...');
    const isConnected = await testEmailConnection();
    
    if (isConnected) {
      console.log('✅ Email service is working correctly!');
      console.log('📨 You can now create meetings and emails will be sent automatically.');
    } else {
      console.log('❌ Email service is not working.');
      console.log('🔧 Please check your .env configuration and Gmail settings.');
    }
  } catch (error) {
    console.error('💥 Error testing email service:', error.message);
  }
}

testEmail();
