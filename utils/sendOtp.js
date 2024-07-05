


const twilio = require('twilio');

// Twilio credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

const sendOtp = async (contactNumber, otp) => {
  try {
    // Prepend +91 if not already present
    if (!contactNumber.startsWith('+')) {
      contactNumber = `+91${contactNumber}`;
    }

    await client.messages.create({
      body: `Your OTP code is ${otp}`,
      from: twilioPhoneNumber,
      to: contactNumber,
    });
    console.log(`Sending OTP ${otp} to ${contactNumber}`);
  } catch (error) {
    console.error('Error sending OTP:', error.message);
    throw new Error('Failed to send OTP');
  }
};

module.exports = sendOtp;
