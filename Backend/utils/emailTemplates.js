export const getVerificationEmailTemplate = (user, verificationUrl) => {
  return {
    subject: "🎓 Welcome to CareerBridge - Verify Your Email",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background-color: #f4f4f4;
          }
          .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
          }
          .content { 
            background: #ffffff; 
            padding: 40px 30px; 
          }
          .content h2 {
            color: #667eea;
            margin-bottom: 20px;
            font-size: 22px;
          }
          .content p {
            margin-bottom: 15px;
            color: #555;
            font-size: 15px;
          }
          .role-badge {
            display: inline-block;
            padding: 5px 15px;
            background: #667eea;
            color: white;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin: 10px 0;
          }
          .button-container {
            text-align: center;
            margin: 30px 0;
          }
          .button { 
            display: inline-block; 
            padding: 15px 40px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white !important; 
            text-decoration: none; 
            border-radius: 30px; 
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.2s;
          }
          .button:hover {
            transform: translateY(-2px);
          }
          .link-box {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            word-break: break-all;
          }
          .link-box p {
            margin: 5px 0;
            font-size: 13px;
            color: #666;
          }
          .link-box a {
            color: #667eea;
            text-decoration: none;
          }
          .footer { 
            background: #f8f9fa;
            text-align: center; 
            padding: 25px 30px; 
            color: #888; 
            font-size: 13px; 
          }
          .footer p {
            margin: 5px 0;
          }
          .divider {
            height: 1px;
            background: #e0e0e0;
            margin: 25px 0;
          }
          .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .warning p {
            margin: 0;
            color: #856404;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 CareerBridge</h1>
            <p>Connecting Talent with Opportunity</p>
          </div>
          <div class="content">
            <h2>Welcome, ${user.firstName} ${user.lastName}!</h2>
            <p>Thank you for joining CareerBridge as a <span class="role-badge">${user.role.toUpperCase()}</span></p>
            
            <p>We're excited to have you on board! To get started, please verify your email address by clicking the button below:</p>
            
            <div class="button-container">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            
            <div class="divider"></div>
            
            <p style="font-size: 14px; color: #666;">If the button doesn't work, copy and paste this link into your browser:</p>
            <div class="link-box">
              <a href="${verificationUrl}">${verificationUrl}</a>
            </div>
            
            <div class="warning">
              <p><strong>⏰ Important:</strong> This verification link will expire in 24 hours.</p>
            </div>
            
            <div class="divider"></div>
            
            <p style="font-size: 14px; color: #888;">If you didn't create an account with CareerBridge, please ignore this email.</p>
          </div>
          <div class="footer">
            <p><strong>CareerBridge</strong></p>
            <p>Bridging the gap between students and companies</p>
            <p>&copy; ${new Date().getFullYear()} CareerBridge. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Welcome to CareerBridge!

Hello ${user.firstName} ${user.lastName},

Thank you for registering as a ${user.role}.

Please verify your email address by visiting:
${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account, please ignore this email.

Best regards,
CareerBridge Team
    `,
  };
};

export const getPasswordResetEmailTemplate = (user, resetUrl) => {
  return {
    subject: "🔐 CareerBridge - Password Reset Request",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background-color: #f4f4f4;
          }
          .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .content { 
            background: #ffffff; 
            padding: 40px 30px; 
          }
          .content h2 {
            color: #f5576c;
            margin-bottom: 20px;
            font-size: 22px;
          }
          .content p {
            margin-bottom: 15px;
            color: #555;
            font-size: 15px;
          }
          .button-container {
            text-align: center;
            margin: 30px 0;
          }
          .button { 
            display: inline-block; 
            padding: 15px 40px; 
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); 
            color: white !important; 
            text-decoration: none; 
            border-radius: 30px; 
            font-weight: 600;
            font-size: 16px;
          }
          .link-box {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            word-break: break-all;
          }
          .link-box a {
            color: #f5576c;
            text-decoration: none;
          }
          .footer { 
            background: #f8f9fa;
            text-align: center; 
            padding: 25px 30px; 
            color: #888; 
            font-size: 13px; 
          }
          .divider {
            height: 1px;
            background: #e0e0e0;
            margin: 25px 0;
          }
          .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .warning p {
            margin: 0;
            color: #856404;
            font-size: 14px;
          }
          .security-info {
            background: #e3f2fd;
            border-left: 4px solid #2196F3;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .security-info p {
            margin: 0;
            color: #0d47a1;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset</h1>
          </div>
          <div class="content">
            <h2>Hello, ${user.firstName}!</h2>
            <p>We received a request to reset your password for your CareerBridge account.</p>
            
            <p>Click the button below to create a new password:</p>
            
            <div class="button-container">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <div class="divider"></div>
            
            <p style="font-size: 14px; color: #666;">If the button doesn't work, copy and paste this link:</p>
            <div class="link-box">
              <a href="${resetUrl}">${resetUrl}</a>
            </div>
            
            <div class="warning">
              <p><strong>⚠️ Security Notice:</strong> This password reset link will expire in 15 minutes for your security.</p>
            </div>
            
            <div class="security-info">
              <p><strong>🛡️ Didn't request this?</strong> If you didn't request a password reset, please ignore this email or contact our support team immediately.</p>
            </div>
          </div>
          <div class="footer">
            <p><strong>CareerBridge</strong></p>
            <p>&copy; ${new Date().getFullYear()} CareerBridge. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Password Reset Request

Hello ${user.firstName},

We received a request to reset your password.

Please visit this link to reset your password:
${resetUrl}

This link will expire in 15 minutes.

If you didn't request a password reset, please ignore this email.

Best regards,
CareerBridge Team
    `,
  };
};

export const getWelcomeEmailTemplate = (user, frontendUrl) => {
  const studentContent = `
    <ul style="color: #555; font-size: 15px; margin: 20px 0; padding-left: 20px;">
      <li style="margin: 10px 0;">✅ Complete your student profile</li>
      <li style="margin: 10px 0;">📄 Upload your resume</li>
      <li style="margin: 10px 0;">🔍 Browse job opportunities</li>
      <li style="margin: 10px 0;">📧 Apply to positions</li>
      <li style="margin: 10px 0;">💼 Connect with companies</li>
    </ul>
  `;

  const companyContent = `
    <ul style="color: #555; font-size: 15px; margin: 20px 0; padding-left: 20px;">
      <li style="margin: 10px 0;">✅ Complete your company profile</li>
      <li style="margin: 10px 0;">📢 Post job openings</li>
      <li style="margin: 10px 0;">👥 Browse student profiles</li>
      <li style="margin: 10px 0;">📋 Manage applications</li>
      <li style="margin: 10px 0;">🤝 Connect with talent</li>
    </ul>
  `;

  return {
    subject: "🎉 Welcome to CareerBridge - Let's Get Started!",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background-color: #f4f4f4;
          }
          .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
          }
          .header h1 {
            margin: 0;
            font-size: 32px;
            font-weight: 600;
          }
          .content { 
            background: #ffffff; 
            padding: 40px 30px; 
          }
          .content h2 {
            color: #11998e;
            margin-bottom: 20px;
            font-size: 24px;
          }
          .content p {
            margin-bottom: 15px;
            color: #555;
            font-size: 15px;
          }
          .button-container {
            text-align: center;
            margin: 30px 0;
          }
          .button { 
            display: inline-block; 
            padding: 15px 40px; 
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); 
            color: white !important; 
            text-decoration: none; 
            border-radius: 30px; 
            font-weight: 600;
            font-size: 16px;
          }
          .footer { 
            background: #f8f9fa;
            text-align: center; 
            padding: 25px 30px; 
            color: #888; 
            font-size: 13px; 
          }
          .success-badge {
            background: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            text-align: center;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome Aboard!</h1>
          </div>
          <div class="content">
            <div class="success-badge">
              ✅ Email Verified Successfully!
            </div>
            
            <h2>Hello, ${user.firstName}!</h2>
            <p>Your email has been verified and your CareerBridge ${user.role} account is now active!</p>
            
            <p><strong>Here's what you can do next:</strong></p>
            
            ${user.role === "student" ? studentContent : companyContent}
            
            <div class="button-container">
              <a href="${frontendUrl}/dashboard" class="button">Go to Dashboard</a>
            </div>
            
            <p style="margin-top: 30px; color: #666; font-size: 14px;">Thank you for choosing CareerBridge to ${user.role === "student" ? "advance your career" : "find top talent"}!</p>
          </div>
          <div class="footer">
            <p><strong>CareerBridge</strong></p>
            <p>Connecting Students with Career Opportunities</p>
            <p>&copy; ${new Date().getFullYear()} CareerBridge. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Welcome to CareerBridge!

Hello ${user.firstName},

Your email has been verified successfully!

You're now part of the CareerBridge ${user.role} community.

Visit your dashboard: ${frontendUrl}/dashboard

Best regards,
CareerBridge Team
    `,
  };
};