import { chatbotKnowledge } from "../data/chatbotKnowledge.js";

const normalize = (text = "") =>
  text.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();

const includesAny = (text, phrases = []) =>
  phrases.some((phrase) => normalize(text).includes(normalize(phrase)));

const getPageHint = (currentPage = "") => {
  if (currentPage.includes("/profile/edit")) {
    return "You are currently on the Edit Profile page. You can update your student details there and save them.";
  }

  if (currentPage.includes("/profile")) {
    return "You are on the Profile page. Use the Edit Profile button to update your details.";
  }

  if (currentPage.includes("/feedback")) {
    return "You are on the Feedback page. You can submit feedback there and edit or delete only your own feedback.";
  }

  if (currentPage.includes("/admin/student-profile")) {
    return "You are on the admin student profile dashboard. Admin users can review student profile data there.";
  }

  if (currentPage.includes("/signin")) {
    return "You are on the Sign In page. Enter your email and password to continue.";
  }

  if (currentPage.includes("/signup")) {
    return "You are on the Sign Up page. Create your account there.";
  }

  return "";
};

const findBestMatch = (message) => {
  const normalizedMessage = normalize(message);

  let bestMatch = null;
  let bestScore = 0;

  for (const item of chatbotKnowledge) {
    let score = 0;

    for (const keyword of item.keywords) {
      if (normalizedMessage.includes(normalize(keyword))) {
        score += keyword.split(" ").length > 1 ? 3 : 1;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }

  return bestScore > 0 ? bestMatch : null;
};

export const generateChatbotReply = ({
  message,
  currentPage,
  isLoggedIn,
  role,
}) => {
  const normalizedMessage = normalize(message);

  if (includesAny(normalizedMessage, ["hi", "hello", "hey", "good morning", "good evening"])) {
    return {
      reply:
        "Hi! I’m the CareerBridge Assistant. I can help with sign in, sign up, profile editing, feedback, jobs, companies, and admin portal navigation.",
      suggestions: ["Profile page", "Feedback page", "How do I sign in?"],
    };
  }

  if (includesAny(normalizedMessage, ["thank you", "thanks"])) {
    return {
      reply: "You’re welcome. Let me know what you want help with next.",
      suggestions: ["Profile page", "Feedback", "Jobs"],
    };
  }

  if (includesAny(normalizedMessage, ["bye", "goodbye"])) {
    return {
      reply: "Goodbye! Come back if you need help with CareerBridge.",
      suggestions: [],
    };
  }

  const match = findBestMatch(message);

  if (match) {
    let reply = match.answer;

    const pageHint = getPageHint(currentPage);
    if (pageHint) {
      reply += ` ${pageHint}`;
    }

    if (isLoggedIn && role === "admin") {
      reply += " Since you are logged in as admin, you can also use the admin portal sections that are protected by backend authentication.";
    } else if (isLoggedIn) {
      reply += " Since you are logged in, you can use your profile menu to access profile and password options.";
    }

    return {
      reply,
      suggestions: match.suggestions || [],
    };
  }

  return {
    reply:
      "I’m not fully sure about that yet. I can currently help with sign in, sign up, profile editing, feedback, jobs, companies, password reset, and admin/student portal navigation.",
    suggestions: ["Profile page", "Feedback", "How do I sign in?"],
  };
};