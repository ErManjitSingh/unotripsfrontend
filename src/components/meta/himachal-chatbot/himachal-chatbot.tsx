"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import "./himachal-chatbot.css";

type ChatMsg = { who: "bot" | "user"; text: string };

type Question =
  | { id: string; text: string; options: string[]; inputType?: undefined }
  | { id: string; text: string; inputType: "mobile"; options?: undefined };

const TYPING_DELAY = 1200;
const CLOSE_AFTER_THANKYOU_MS = 2500;

const GREETING =
  "Hello \u{1F44B}\nWelcome to our Himachal Pradesh Tour Services.\nI will help you plan your perfect trip.";

const QUESTIONS: Question[] = [
  {
    id: "dest",
    text: "Which Himachal trip are you looking for?",
    options: ["Manali", "Shimla", "Spiti", "Dharamshala", "Suggest best package"],
  },
  {
    id: "timeline",
    text: "Planning to travel?",
    options: ["Within 15 days", "Next month", "Later", "Just checking prices"],
  },
  {
    id: "contact",
    text: "Please share your contact number so our travel expert can get in touch with the best package.",
    inputType: "mobile",
  },
];

type Props = {
  landingPage?: string;
  destination?: string;
};

function IconClose() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function IconSend() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}

function IconChat() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z" />
    </svg>
  );
}

export function HimachalChatbot({
  landingPage = "Himachal Special Landing",
  destination = "Himachal",
}: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [typing, setTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [inputPlaceholder, setInputPlaceholder] = useState("Type your answer...");
  const [inputType, setInputType] = useState<"text" | "tel">("text");

  const currentIndexRef = useRef(-1);
  const userMobileRef = useRef("");
  const transcriptRef = useRef<ChatMsg[]>([]);
  const lastSentRef = useRef("");
  const startedRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, quickReplies, showInput]);

  const pushMessage = useCallback((who: "bot" | "user", text: string) => {
    const msg: ChatMsg = { who, text };
    transcriptRef.current = [...transcriptRef.current, msg];
    setMessages([...transcriptRef.current]);
  }, []);

  const sendChatToServer = useCallback(
    (useBeacon = false) => {
      const transcript = transcriptRef.current;
      if (!transcript.some((m) => m.who === "user")) return;
      const phone = userMobileRef.current.replace(/\s+/g, "");
      if (!phone) return;

      const snapshot = JSON.stringify(transcript);
      if (snapshot === lastSentRef.current) return;
      lastSentRef.current = snapshot;

      const chatLines = transcript
        .map((m) => `${m.who === "bot" ? "Bot" : "User"}: ${m.text}`)
        .join("\n");

      const payload = {
        name: "Himachal Chatbot Lead",
        phone,
        email: "",
        destination,
        package: "",
        landingPage,
        captureType: "chatbot",
        message: `Himachal Chatbot conversation\n\n${chatLines}`,
      };
      const body = JSON.stringify(payload);

      if (useBeacon && typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/meta/leads",
          new Blob([body], { type: "application/json" }),
        );
        return;
      }

      void fetch("/api/meta/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    },
    [destination, landingPage],
  );

  const sendChatAndThankYou = useCallback(() => {
    setQuickReplies([]);
    setShowInput(false);
    setTyping(true);
    schedule(() => {
      setTyping(false);
      pushMessage(
        "bot",
        "Thank you! \u{1F64F} Our travel expert will contact you soon with the best package. Have a great day!",
      );
      sendChatToServer(false);
      schedule(() => setOpen(false), CLOSE_AFTER_THANKYOU_MS);
    }, TYPING_DELAY);
  }, [pushMessage, schedule, sendChatToServer]);

  const askNext = useCallback(() => {
    const idx = currentIndexRef.current;
    if (idx >= QUESTIONS.length) {
      sendChatAndThankYou();
      return;
    }
    const q = QUESTIONS[idx];
    setTyping(true);
    schedule(() => {
      setTyping(false);
      pushMessage("bot", q.text);
      if (q.inputType === "mobile") {
        setQuickReplies([]);
        setShowInput(true);
        setInputPlaceholder("e.g. 9876543210");
        setInputType("tel");
        schedule(() => inputRef.current?.focus(), 50);
      } else {
        setShowInput(false);
        setQuickReplies(q.options || []);
      }
    }, TYPING_DELAY);
  }, [pushMessage, schedule, sendChatAndThankYou]);

  const startChat = useCallback(() => {
    clearTimers();
    transcriptRef.current = [];
    currentIndexRef.current = -1;
    userMobileRef.current = "";
    lastSentRef.current = "";
    setMessages([]);
    setQuickReplies([]);
    setShowInput(false);
    setInputValue("");
    setInputPlaceholder("Type your answer...");
    setInputType("text");
    setTyping(true);
    schedule(() => {
      setTyping(false);
      pushMessage("bot", GREETING);
      currentIndexRef.current = 0;
      schedule(() => askNext(), 500);
    }, TYPING_DELAY);
  }, [askNext, clearTimers, pushMessage, schedule]);

  const openChat = useCallback(() => {
    setOpen(true);
    if (!startedRef.current) {
      startedRef.current = true;
      startChat();
    }
  }, [startChat]);

  const closeChat = useCallback(() => {
    sendChatToServer(false);
    setOpen(false);
  }, [sendChatToServer]);

  const handleQuickReply = useCallback(
    (label: string) => {
      setQuickReplies([]);
      pushMessage("user", label);
      setShowInput(false);
      currentIndexRef.current += 1;
      if (currentIndexRef.current < QUESTIONS.length) {
        schedule(() => askNext(), 400);
      } else {
        sendChatAndThankYou();
      }
    },
    [askNext, pushMessage, schedule, sendChatAndThankYou],
  );

  const sendUserText = useCallback(() => {
    const text = inputValue.trim();
    if (!text) return;
    setInputValue("");
    setInputPlaceholder("Type your answer...");
    setInputType("text");
    pushMessage("user", text);
    const q = QUESTIONS[currentIndexRef.current];
    if (q && q.inputType === "mobile") {
      userMobileRef.current = text.replace(/\s+/g, "");
      currentIndexRef.current += 1;
      sendChatAndThankYou();
      return;
    }
    currentIndexRef.current += 1;
    if (currentIndexRef.current < QUESTIONS.length) {
      schedule(() => askNext(), 400);
    } else {
      sendChatAndThankYou();
    }
  }, [askNext, inputValue, pushMessage, schedule, sendChatAndThankYou]);

  useEffect(() => {
    const onLeave = () => sendChatToServer(true);
    window.addEventListener("beforeunload", onLeave);
    window.addEventListener("pagehide", onLeave);
    return () => {
      window.removeEventListener("beforeunload", onLeave);
      window.removeEventListener("pagehide", onLeave);
      clearTimers();
    };
  }, [clearTimers, sendChatToServer]);

  return (
    <div className={`hs-chatbot-widget${open ? " open" : ""}`}>
      <div className="hs-chatbot-panel" role="dialog" aria-label="Himachal Tour chat">
        <div className="hs-chatbot-header">
          <div className="hs-chatbot-header-info">
            <span className="hs-chatbot-title">Himachal Tour</span>
            <span className="hs-chatbot-subtitle">Typically replies instantly</span>
          </div>
          <button type="button" className="hs-chatbot-close" onClick={closeChat} aria-label="Close chat">
            <IconClose />
          </button>
        </div>

        <div className="hs-chatbot-messages">
          {messages.map((m, i) => (
            <div key={`${i}-${m.who}`} className={`hs-chatbot-msg-wrap hs-chatbot-msg-wrap-${m.who} hs-chatbot-msg-appear`}>
              <div className={`hs-chatbot-msg ${m.who}`}>{m.text}</div>
            </div>
          ))}
          {typing ? (
            <div className="hs-chatbot-msg-wrap hs-chatbot-msg-wrap-bot">
              <div className="hs-chatbot-msg bot hs-chatbot-typing" aria-hidden>
                <span />
                <span />
                <span />
              </div>
            </div>
          ) : null}
          <div ref={messagesEndRef} />
        </div>

        {quickReplies.length > 0 ? (
          <div className="hs-chatbot-quick-replies">
            {quickReplies.map((label) => (
              <button
                key={label}
                type="button"
                className="hs-chatbot-quick-reply"
                onClick={() => handleQuickReply(label)}
              >
                {label}
              </button>
            ))}
          </div>
        ) : null}

        {showInput ? (
          <div className="hs-chatbot-input-wrap">
            <input
              ref={inputRef}
              type={inputType}
              className="hs-chatbot-input"
              placeholder={inputPlaceholder}
              maxLength={200}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  sendUserText();
                }
              }}
            />
            <button type="button" className="hs-chatbot-send" onClick={sendUserText} aria-label="Send">
              <IconSend />
            </button>
          </div>
        ) : null}
      </div>

      <button type="button" className="hs-chatbot-toggle" onClick={openChat} aria-label="Open chat">
        <IconChat />
        <span className="hs-chatbot-toggle-badge">1</span>
      </button>
    </div>
  );
}