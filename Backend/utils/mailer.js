import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTP = async (recipientEmail, otp) => {
  const mailOptions = {
    from: `"TrustShare" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: 'Your TrustShare OTP Code',
    text: `Your TrustShare OTP code is ${otp}. It is valid for 10 minutes. Do not share this code with anyone.`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TrustShare OTP</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: 'Roboto Mono', monospace;
            background-color: #0d1b2a;
            color: #e0e1dd;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: linear-gradient(145deg, #1b263b, #0d1b2a);
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
          }
          .header {
            background: #1b263b;
            padding: 20px;
            text-align: center;
            border-bottom: 2px solid #00d4ff;
          }
          .header img {
            max-width: 200px;
            height: auto;
          }
          .header h1 {
            font-family: 'Orbitron', sans-serif;
            color: #00d4ff;
            margin: 10px 0;
            font-size: 24px;
            text-transform: uppercase;
          }
          .content {
            padding: 30px;
            text-align: center;
          }
          .otp-box {
            display: inline-block;
            background: #0d1b2a;
            border: 2px solid #00d4ff;
            border-radius: 8px;
            padding: 15px 30px;
            margin: 20px 0;
            font-size: 28px;
            font-weight: bold;
            color: #00d4ff;
            letter-spacing: 5px;
            box-shadow: 0 0 10px rgba(0, 212, 255, 0.4);
          }
          p {
            font-size: 14px;
            line-height: 1.6;
            color: #e0e1dd;
            margin: 10px 0;
          }
          .warning {
            color: #ff4d4d;
            font-weight: bold;
          }
          .footer {
            background: #1b263b;
            padding: 15px;
            text-align: center;
            font-size: 12px;
            color: #778da9;
            border-top: 1px solid #415a77;
          }
          a {
            color: #00d4ff;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          @media (max-width: 600px) {
            .container {
              margin: 10px;
              border-radius: 8px;
            }
            .header h1 {
              font-size: 20px;
            }
            .otp-box {
              font-size: 24px;
              padding: 10px 20px;
            }
            .content {
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <img src="https://i.imgur.com/pMW2Ee2.png" alt="TrustShare Logo">
            <h1>TrustShare OTP</h1>
          </div>
          <div className="content">
            <p>Hello,</p>
            <p>Your one-time password (OTP) for TrustShare is:</p>
            <div className="otp-box">${otp}</div>
            <p>This code is valid for <strong>10 minutes</strong>.</p>
            <p className="warning">Do not share this code with anyone, even if they claim to be from TrustShare.</p>
            <p>If you didn’t request this OTP, please contact our <a href="mailto:support@trustshare.com">support team</a>.</p>
          </div>
          <div className="footer">
            <p>&copy; 2025 TrustShare. All rights reserved.</p>
            <p><a href="https://trustshare.com">trustshare.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};