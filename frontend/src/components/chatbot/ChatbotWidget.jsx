import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const STORAGE_KEY = "careerbridge_chat_session_id";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const GUEST_STORAGE_SCOPE = "guest";

const createSessionId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `chat_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

const getStorageKey = (userId) =>
  `${STORAGE_KEY}_${userId || GUEST_STORAGE_SCOPE}`;

const getOrCreateSessionId = (userId) => {
  const scopedStorageKey = getStorageKey(userId);
  const existing = localStorage.getItem(scopedStorageKey);
  if (existing) return existing;

  const newId = createSessionId();
  localStorage.setItem(scopedStorageKey, newId);
  return newId;
};

const defaultWelcomeMessage = {
  sender: "bot",
  text: "Hi! I’m the CareerBridge Assistant. I can help with jobs, sign in, sign up, profile editing, feedback, internships, and portal navigation.",
};

function ChatbotWidget({ currentUser }) {
  const location = useLocation();
  const bottomRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState([defaultWelcomeMessage]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);
  const [suggestions, setSuggestions] = useState([
    "How do I sign in?",
    "How do I edit my profile?",
    "How do I find jobs that match my skills?",
  ]);

  useEffect(() => {
    const id = getOrCreateSessionId(currentUser?.id);
    setSessionId(id);
    setLoadingSession(true);

    const loadSession = async () => {
      try {
        const res = await fetch(buildApiUrl(`/api/chatbot/session/${id}`), {
          credentials: "include",
        });

        if (res.status === 403) {
          const newSessionId = createSessionId();
          localStorage.setItem(getStorageKey(currentUser?.id), newSessionId);
          setSessionId(newSessionId);
          setMessages([defaultWelcomeMessage]);
          return;
        }

        const data = await res.json();

        if (res.ok && data?.data?.messages?.length > 0) {
          setMessages(data.data.messages);
        } else {
          setMessages([defaultWelcomeMessage]);
        }
      } catch {
        setMessages([defaultWelcomeMessage]);
      } finally {
        setLoadingSession(false);
      }
    };

    loadSession();
  }, [currentUser?.id]);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, typing, isOpen]);

  const canSend = useMemo(
    () => input.trim().length > 0 && !typing,
    [input, typing]
  );

  const buildApiUrl = (path) => `${API_BASE_URL}${path}`;

  const sendMessage = async (textToSend) => {
    const cleanText = textToSend.trim();
    if (!cleanText || !sessionId || typing) return;

    setTyping(true);

    try {
      const res = await fetch(buildApiUrl("/api/chatbot/message"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          sessionId,
          message: cleanText,
          currentPage: location.pathname,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessages(data?.data?.messages || []);
        setSuggestions(data?.data?.suggestions || []);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "user", text: cleanText },
          {
            sender: "bot",
            text: data.message || "Sorry, something went wrong.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "user", text: cleanText },
        {
          sender: "bot",
          text: "Sorry, I could not connect to the chatbot service.",
        },
      ]);
    } finally {
      setTyping(false);
      setInput("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSend) return;
    await sendMessage(input);
  };

  const handleClearChat = async () => {
    if (!sessionId) return;

    try {
      const response = await fetch(
        buildApiUrl(`/api/chatbot/session/${sessionId}`),
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        console.warn("Failed to clear chat session from server");
      }
    } catch (error) {
      console.warn("Could not clear chat session from server", error);
    }

    setMessages([defaultWelcomeMessage]);
    setSuggestions([
      "How do I sign in?",
      "How do I edit my profile?",
      "How do I find jobs that match my skills?",
    ]);
    setInput("");
  };

  return (
    <>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-5 right-5 z-[9999] w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-2xl hover:scale-105 transition flex items-center justify-center text-2xl"
        aria-label="Open chatbot"
      >
        💬
      </button>

      {isOpen && (
        <div className="fixed inset-x-4 bottom-24 sm:inset-x-auto sm:right-6 z-[9999] w-auto sm:w-[390px] h-[70vh] sm:h-[580px] max-h-[580px] bg-white rounded-[28px] shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-5 py-4 flex items-start justify-between shrink-0">
            <div className="pr-3">
              <h3 className="font-bold text-lg leading-tight">
                CareerBridge Assistant
              </h3>
              <p className="text-xs text-indigo-100 mt-1">
                Website help and quick guidance
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleClearChat}
                className="text-xs bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-lg transition"
              >
                Clear
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-lg leading-none transition"
              >
                ×
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 min-h-0 overflow-y-auto bg-slate-50 px-4 py-4">
            {loadingSession ? (
              <p className="text-sm text-gray-500">Loading chat...</p>
            ) : (
              <div className="space-y-3">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-7 shadow-sm whitespace-pre-wrap break-words ${
                        msg.sender === "user"
                          ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-br-md"
                          : "bg-white text-slate-800 border border-slate-200 rounded-bl-md"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {typing && (
                  <div className="flex justify-start">
                    <div className="bg-white text-slate-800 border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 text-sm shadow-sm">
                      Typing...
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-3">
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3 max-h-24 overflow-y-auto pr-1">
                {suggestions.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage(item)}
                    className="text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-full transition text-left"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask something..."
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!canSend}
                className="bg-indigo-600 text-white px-4 sm:px-5 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatbotWidget;