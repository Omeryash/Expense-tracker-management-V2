// src/utils/sendSms.js
// SMS bhejne ka helper.
// Abhi development mode mein console pe print karta hai.
// Production mein Fast2SMS / Twilio / MSG91 yahan add karo.

const sendSms = async (phone, message) => {
  // 🔧 DEVELOPMENT MODE — terminal pe print
  console.log("\n📱 ================================");
  console.log(`   To:      +91${phone}`);
  console.log(`   Message: ${message}`);
  console.log("=================================\n");

  // 🚀 PRODUCTION — Fast2SMS example (uncomment karke use karo)
  // const axios = require("axios");
  // await axios.post(
  //   "https://www.fast2sms.com/dev/bulkV2",
  //   {
  //     route: "q",
  //     message,
  //     numbers: phone,
  //   },
  //   {
  //     headers: { authorization: process.env.FAST2SMS_KEY },
  //   }
  // );

  // 🚀 PRODUCTION — Twilio example (uncomment karke use karo)
  // const twilio = require("twilio");
  // const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
  // await client.messages.create({
  //   body: message,
  //   from: process.env.TWILIO_PHONE,
  //   to: `+91${phone}`,
  // });
};

module.exports = sendSms;
