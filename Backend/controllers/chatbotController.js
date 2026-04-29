import ChatSession from "../models/ChatSession.js";
import { generateChatbotReply } from "../utils/chatbotEngine.js";

const toComparableId = (value) => (value ? String(value) : null);

const isSessionAccessibleByRequester = (session, user) => {
  const sessionUserId = toComparableId(session.userId);
  const requesterUserId = toComparableId(user?.id);

  if (requesterUserId) {
    return sessionUserId === requesterUserId;
  }

  return !sessionUserId;
};

export const getChatSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await ChatSession.findOne({ sessionId });

    if (!session) {
      return res.status(200).json({
        success: true,
        data: {
          sessionId,
          messages: [],
        },
      });
    }

    if (!isSessionAccessibleByRequester(session, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to access this chat session.",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        sessionId: session.sessionId,
        messages: session.messages,
      },
    });
  } catch (error) {
    console.error("Get chatbot session error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load chatbot session",
      error: error.message,
    });
  }
};

export const sendChatMessage = async (req, res) => {
  try {
    const { sessionId, message, currentPage } = req.body;

    if (!sessionId || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Session ID and message are required.",
      });
    }

    let session = await ChatSession.findOne({ sessionId });

    if (!session) {
      session = new ChatSession({
        sessionId,
        userId: toComparableId(req.user?.id),
        messages: [],
      });
    } else if (!isSessionAccessibleByRequester(session, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to access this chat session.",
      });
    }

    if (req.user?.id) {
      session.userId = toComparableId(req.user.id);
    }

    session.messages.push({
      sender: "user",
      text: message.trim(),
    });

    const result = generateChatbotReply({
      message,
      currentPage,
      isLoggedIn: !!req.user,
      role: req.user?.role || null,
    });

    session.messages.push({
      sender: "bot",
      text: result.reply,
    });

    await session.save();

    res.status(200).json({
      success: true,
      data: {
        reply: result.reply,
        suggestions: result.suggestions,
        messages: session.messages,
      },
    });
  } catch (error) {
    console.error("Send chatbot message error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send chatbot message",
      error: error.message,
    });
  }
};

export const clearChatSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await ChatSession.findOne({ sessionId });

    if (!session) {
      return res.status(200).json({
        success: true,
        message: "Chat session already cleared.",
      });
    }

    if (!isSessionAccessibleByRequester(session, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to clear this chat session.",
      });
    }

    await ChatSession.deleteOne({ _id: session._id });

    res.status(200).json({
      success: true,
      message: "Chat session cleared successfully.",
    });
  } catch (error) {
    console.error("Clear chatbot session error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear chatbot session",
      error: error.message,
    });
  }
};