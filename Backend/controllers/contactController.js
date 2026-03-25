import nodemailer from "nodemailer";
import ContactMessage from "../models/ContactMessage.js";

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

const sendContactEmail = async ({ name, email, subject, message }) => {
  const transporter = createTransporter();

  const receiver =
    process.env.CONTACT_RECEIVER_EMAIL || process.env.GMAIL_USER;

  const mailOptions = {
    from: `"CareerBridge Contact Form" <${process.env.GMAIL_USER}>`,
    to: receiver,
    replyTo: email,
    subject: `New Contact Us Message: ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
        <h2>New Contact Us Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <div style="padding: 12px; background: #f5f5f5; border-radius: 8px; white-space: pre-wrap;">${message}</div>
      </div>
    `,
    text: `
New Contact Us Message

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
    `,
  };

  return transporter.sendMail(mailOptions);
};

export const createContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const newMessage = await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      userId: req.user?.id || null,
    });

    let emailSent = true;
    let emailError = "";

    try {
      await sendContactEmail({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
      });
    } catch (err) {
      emailSent = false;
      emailError = err.message;
      console.error("Contact email send error:", err);
    }

    return res.status(201).json({
      success: true,
      message: emailSent
        ? "Your message has been sent successfully."
        : "Your message was saved, but the email could not be sent.",
      data: {
        contactMessage: newMessage,
        emailSent,
        emailError,
      },
    });
  } catch (error) {
    console.error("Create contact message error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message.",
      error: error.message,
    });
  }
};

export const getAllContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { messages },
    });
  } catch (error) {
    console.error("Get contact messages error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load contact messages.",
      error: error.message,
    });
  }
};