// ============================================
// ✅ Welcome Email Template
// ============================================
const welcomeEmail = (name) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f3f4f6; }
    .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #3B82F6, #8B5CF6); padding: 40px 20px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; color: #111827; }
    .content h2 { color: #111827; margin-top: 0; }
    .content p { line-height: 1.6; color: #4b5563; }
    .button { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💰 FinTrackBuddy</h1>
    </div>
    <div class="content">
      <h2>Welcome, ${name}! 🎉</h2>
      <p>Your account has been created successfully.</p>
      <p>You can now start tracking your expenses, managing your income, and gaining insights into your financial health.</p>
      <div style="text-align: center;">
        <a href="http://localhost:8080/dashboard" class="button">Go to Dashboard</a>
      </div>
      <p>If you have any questions, feel free to reach out.</p>
      <p>Happy tracking!</p>
      <p><strong>— FinTrackBuddy Team</strong></p>
    </div>
    <div class="footer">
      <p>© 2026 FinTrackBuddy. All rights reserved.</p>
      <p>If you didn't create this account, please ignore this email.</p>
    </div>
  </div>
</body>
</html>
`;

// ============================================
// ✅ Password Changed Email Template
// ============================================
const passwordChangedEmail = (name) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f3f4f6; }
    .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #F59E0B, #EF4444); padding: 40px 20px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; color: #111827; }
    .alert { background: #fef3c7; border-left: 4px solid #F59E0B; padding: 16px; border-radius: 8px; margin: 20px 0; }
    .alert p { margin: 0; color: #92400e; font-size: 14px; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔒 Password Changed</h1>
    </div>
    <div class="content">
      <h2>Hi ${name},</h2>
      <p>Your password has been changed successfully.</p>
      <div class="alert">
        <p><strong>⚠️ Security Alert:</strong> If you didn't make this change, please contact support immediately and secure your account.</p>
      </div>
      <p><strong>Change Details:</strong></p>
      <ul>
        <li>Time: ${new Date().toLocaleString()}</li>
        <li>Action: Password Changed</li>
      </ul>
      <p>Stay safe!</p>
      <p><strong>— FinTrackBuddy Team</strong></p>
    </div>
    <div class="footer">
      <p>© 2026 FinTrackBuddy. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

module.exports = {
  welcomeEmail,
  passwordChangedEmail,
};
