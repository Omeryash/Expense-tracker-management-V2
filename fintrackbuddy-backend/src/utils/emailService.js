const { Resend } = require("resend");
const prisma = require("./prisma");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html, userId }) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("⚠️ RESEND_API_KEY not set. Email not sent.");
      return { success: false, error: "API key missing" };
    }

    // ✅ Check EMAIL ALERTS (not notifications)
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { emailAlertsEnabled: true }, // ✅ Changed
      });

      if (!user || !user.emailAlertsEnabled) {
        // ✅ Changed
        console.log(`📧 Email skipped for ${to} (email alerts OFF)`);
        return { success: false, error: "Email alerts disabled" };
      }
    }

    const data = await resend.emails.send({
      from: "FinTrackBuddy <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    console.log(`✅ Email sent to ${to}:`, data);
    return { success: true, data };
  } catch (error) {
    console.error("❌ Email error:", error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };
