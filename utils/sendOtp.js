// // utils/sendOtp.js
// const twilio = require('twilio');

// // Twilio credentials
// const accountSid = 'AC6322364174f8e19755ff9fcbee4d8470';
// const authToken = '3927786dfa370344bfd1d5984baff3eb';
// const twilioPhoneNumber = '+17815635972';

// const client = twilio(accountSid, authToken);

// const sendOtp = async (contactNumber, otp) => {
//   try {
//     // Prepend +91 if not already present
//     if (!contactNumber.startsWith('+')) {
//       contactNumber = `+91${contactNumber}`;
//     }

//     await client.messages.create({
//       body: `Your OTP code is ${otp}`,
//       from: twilioPhoneNumber,
//       to: contactNumber,
//     });
//     console.log(`Sending OTP ${otp} to ${contactNumber}`);
//   } catch (error) {
//     console.error('Error sending OTP:', error.message);
//     throw new Error('Failed to send OTP');
//   }
// };

// module.exports = sendOtp;


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
