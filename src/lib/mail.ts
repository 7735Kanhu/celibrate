import nodemailer from "nodemailer";

export interface SendEnquiryEmailParams {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  enquiryNumber: string;
  venueName: string;
  eventType: string;
  eventDate: string | Date;
  guestCount: number;
  preferredTime?: string;
  budget?: string;
  services?: string[];
  message?: string | null;
  isNewAccount: boolean;
}

/**
 * Configure Nodemailer transport using environment variables.
 */
function createTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

/**
 * Send enquiry confirmation and auto-generated login credentials to the customer.
 */
export async function sendEnquiryConfirmationEmail(params: SendEnquiryEmailParams) {
  const {
    customerName,
    customerEmail,
    customerPhone,
    enquiryNumber,
    venueName,
    eventType,
    eventDate,
    guestCount,
    preferredTime = "Evening",
    budget = "Not Specified",
    services = ["Venue"],
    message,
    isNewAccount,
  } = params;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const loginUrl = `${appUrl}/login`;
  const formattedDate = new Date(eventDate).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const fromEmail = process.env.SMTP_FROM || `"Celibrate Support" <noreply@celibrate.in>`;
  const subject = `🎉 Enquiry Confirmed (${enquiryNumber}) & Your Celibrate Account Access`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Enquiry Details & Account Access</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #e11d48 0%, #be123c 100%); color: #ffffff; padding: 32px 24px; text-align: center; }
    .header h1 { margin: 0 0 8px 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 0; font-size: 14px; opacity: 0.9; }
    .content { padding: 32px 24px; }
    .greeting { font-size: 18px; font-weight: 600; margin-bottom: 16px; }
    .intro { font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
    
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
    .card-title { font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px; }
    
    .table-details { width: 100%; border-collapse: collapse; }
    .table-details td { padding: 8px 0; font-size: 14px; border-bottom: 1px dashed #e2e8f0; }
    .table-details td.label { font-weight: 600; color: #64748b; width: 40%; }
    .table-details td.val { font-weight: 600; color: #0f172a; }
    
    .creds-box { background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border: 2px solid #f59e0b; border-radius: 14px; padding: 24px; margin-bottom: 24px; }
    .creds-title { font-size: 17px; font-weight: 800; color: #92400e; margin: 0 0 8px 0; }
    .creds-note { font-size: 13.5px; color: #78350f; margin-bottom: 16px; line-height: 1.5; }
    .cred-row { background: #ffffff; border: 1px solid #fcd34d; border-radius: 8px; padding: 12px 16px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
    .cred-label { font-size: 13px; font-weight: 600; color: #6b7280; }
    .cred-value { font-size: 15px; font-weight: 800; color: #b45309; font-family: monospace; }
    
    .btn-container { text-align: center; margin: 28px 0; }
    .btn-login { display: inline-block; background: #e11d48; color: #ffffff !important; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 12px rgba(225, 29, 72, 0.3); }
    
    .instructions-list { font-size: 14px; color: #475569; padding-left: 20px; line-height: 1.6; margin-bottom: 24px; }
    .instructions-list li { margin-bottom: 6px; }
    
    .footer { background: #f1f5f9; padding: 20px 24px; text-align: center; font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0; }
    .footer a { color: #e11d48; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Celibrate</h1>
      <p>Find the Perfect Place for Every Celebration</p>
    </div>
    
    <div class="content">
      <div class="greeting">Dear ${customerName},</div>
      <p class="intro">
        Thank you for submitting your enquiry for <strong>${venueName}</strong>! Our venue coordinator will review your celebration plan and contact you shortly.
      </p>

      <!-- Enquiry Details Card -->
      <div class="card">
        <h3 class="card-title">📋 Your Enquiry Details</h3>
        <table class="table-details">
          <tr>
            <td class="label">Enquiry Reference</td>
            <td class="val" style="color: #e11d48; font-weight: 800;">${enquiryNumber}</td>
          </tr>
          <tr>
            <td class="label">Venue Name</td>
            <td class="val">${venueName}</td>
          </tr>
          <tr>
            <td class="label">Event Type</td>
            <td class="val">${eventType}</td>
          </tr>
          <tr>
            <td class="label">Event Date</td>
            <td class="val">${formattedDate}</td>
          </tr>
          <tr>
            <td class="label">Guest Count</td>
            <td class="val">${guestCount} Guests</td>
          </tr>
          <tr>
            <td class="label">Preferred Time</td>
            <td class="val">${preferredTime}</td>
          </tr>
          <tr>
            <td class="label">Estimated Budget</td>
            <td class="val">${budget}</td>
          </tr>
          <tr>
            <td class="label">Requested Services</td>
            <td class="val">${services.join(", ")}</td>
          </tr>
          ${
            message
              ? `<tr><td class="label">Special Note</td><td class="val">${message}</td></tr>`
              : ""
          }
        </table>
      </div>

      <!-- Auto Account Credentials & Login Instructions -->
      <div class="creds-box">
        <h3 class="creds-title">🔐 Your Auto-Generated Account & Login Credentials</h3>
        <p class="creds-note">
          ${
            isNewAccount
              ? "We have automatically created your Celibrate Customer Account so you can track your enquiry, review official quotations, schedule site visits, and manage bookings anytime."
              : "An account with this email was already registered. As requested, your password has been securely updated to your phone number for convenient access."
          }
        </p>

        <div class="cred-row">
          <span class="cred-label">Login ID / Email:</span>
          <span class="cred-value">${customerEmail}</span>
        </div>
        <div class="cred-row">
          <span class="cred-label">Password:</span>
          <span class="cred-value">${customerPhone}</span>
        </div>
        
        <p style="font-size: 12px; color: #92400e; margin: 8px 0 0 0;">
          💡 <em>Your password is set to your phone number: <strong>${customerPhone}</strong>. You can change your password anytime in your Profile settings after logging in.</em>
        </p>
      </div>

      <!-- Login CTA Button -->
      <div class="btn-container">
        <a href="${loginUrl}" class="btn-login" target="_blank">Log In to Track Your Enquiry →</a>
      </div>

      <!-- Quick Instructions -->
      <h4 style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">How to use your account:</h4>
      <ol class="instructions-list">
        <li>Click the button above or visit <a href="${loginUrl}">${loginUrl}</a>.</li>
        <li>Enter your <strong>Email</strong> (<code>${customerEmail}</code>) and <strong>Password</strong> (<code>${customerPhone}</code>).</li>
        <li>View live quotation status, download PDF estimates, and communicate directly with venue managers.</li>
        <li>Schedule free site visits and lock your celebration dates securely.</li>
      </ol>

      <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
        If you have any questions or need immediate assistance, please call our 24x7 customer support helpline at <strong>+91 98765 43210</strong> or reply to this email.
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0 0 6px 0;">© ${new Date().getFullYear()} Celibrate. All rights reserved.</p>
      <p style="margin: 0;">Find the perfect venue for Weddings, Birthdays, Receptions & Corporate Events.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const textContent = `
Dear ${customerName},

Thank you for submitting your enquiry for ${venueName}!

========================================
ENQUIRY DETAILS:
========================================
Enquiry Number: ${enquiryNumber}
Venue: ${venueName}
Event: ${eventType}
Date: ${formattedDate}
Guests: ${guestCount}
Time: ${preferredTime}
Budget: ${budget}
Services: ${services.join(", ")}
${message ? `Notes: ${message}\n` : ""}

========================================
YOUR CELIBRATE LOGIN CREDENTIALS:
========================================
${
  isNewAccount
    ? "Your account has been auto-created so you can track your enquiry and manage bookings."
    : "Your account password has been updated to your phone number as requested."
}

Login URL: ${loginUrl}
Email / Login ID: ${customerEmail}
Password: ${customerPhone} (Your phone number)

Instructions:
1. Visit ${loginUrl}
2. Sign in with your Email and Phone Number
3. View your enquiry status and quotations under 'My Enquiries'
4. You can change your password anytime in Profile Settings.

For support, call +91 98765 43210 or reply to this email.

Best regards,
Celibrate Team
  `.trim();

  try {
    const transporter = createTransporter();

    if (transporter) {
      const info = await transporter.sendMail({
        from: fromEmail,
        to: customerEmail,
        subject,
        text: textContent,
        html: htmlContent,
      });

      console.log(`[Mail] Email sent successfully to ${customerEmail}. Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } else {
      // SMTP is not configured in environment variables.
      // Print detailed notification preview so developers can see credentials & instructions.
      console.log(`
=================================================================================
📧 [CELIBRATE EMAIL SERVICE - SIMULATED PREVIEW]
---------------------------------------------------------------------------------
To: ${customerEmail}
Subject: ${subject}
Enquiry ID: ${enquiryNumber}
Venue: ${venueName}

[ACCOUNT CREDENTIALS AUTO-GENERATED/UPDATED]:
Login URL: ${loginUrl}
Login ID / Email: ${customerEmail}
Password: ${customerPhone} (Phone number)
Account Status: ${isNewAccount ? "Newly Created" : "Password Updated (Phone number)"}

ℹ️ Note: To send real emails, please set SMTP_USER and SMTP_PASS in your .env.local
=================================================================================
      `);

      return {
        success: true,
        preview: true,
        message: "Email simulated (SMTP not configured in environment variables)",
      };
    }
  } catch (error: any) {
    console.error("[Mail] Failed to send email:", error.message);
    return { success: false, error: error.message };
  }
}
