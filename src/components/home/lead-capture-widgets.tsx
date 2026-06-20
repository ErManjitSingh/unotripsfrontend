"use client";

import { useState, useEffect } from "react";
import { X, Phone, MessageCircle, ChevronRight, User, MapPin, Send, Bot } from "lucide-react";
import { useRef } from "react";

const WHATSAPP_NUMBER = "919999999999";
const WHATSAPP_MSG = "Hi! I'm interested in booking a trip. Can you help me?";
const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MSG)}`;

// ── Decorative SVGs ──────────────────────────────────────────────────────────

function PlaneTrailSvg() {
  return (
    <svg viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute right-4 top-4 w-28 opacity-20">
      {/* Trail dashes */}
      <path d="M4 44 Q30 20 80 12" stroke="white" strokeWidth="1.5" strokeDasharray="4 3" strokeLinecap="round"/>
      {/* Plane body */}
      <path d="M80 12 L100 6 L104 10 L92 18 Z" fill="white"/>
      {/* Wing */}
      <path d="M88 14 L96 22 L104 18 L96 14 Z" fill="white" opacity="0.8"/>
      {/* Tail */}
      <path d="M80 12 L76 6 L82 8 Z" fill="white" opacity="0.7"/>
    </svg>
  );
}

function SparklesSvg() {
  return (
    <svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full opacity-15 pointer-events-none">
      {/* Stars */}
      <path d="M20 20 L22 15 L24 20 L29 22 L24 24 L22 29 L20 24 L15 22 Z" fill="white"/>
      <path d="M160 15 L161.5 11 L163 15 L167 16.5 L163 18 L161.5 22 L160 18 L156 16.5 Z" fill="white"/>
      <path d="M30 85 L31 82 L32 85 L35 86 L32 87 L31 90 L30 87 L27 86 Z" fill="white" opacity="0.7"/>
      <path d="M140 75 L141 72 L142 75 L145 76 L142 77 L141 80 L140 77 L137 76 Z" fill="white" opacity="0.6"/>
      {/* Dots */}
      <circle cx="50" cy="30" r="2" fill="white" opacity="0.5"/>
      <circle cx="170" cy="55" r="1.5" fill="white" opacity="0.4"/>
      <circle cx="15" cy="60" r="1.5" fill="white" opacity="0.5"/>
      <circle cx="110" cy="20" r="2" fill="white" opacity="0.4"/>
      {/* Circles outline */}
      <circle cx="185" cy="25" r="12" stroke="white" strokeWidth="1.5" opacity="0.2"/>
      <circle cx="10" cy="100" r="18" stroke="white" strokeWidth="1.5" opacity="0.15"/>
    </svg>
  );
}

function LandmarkSvg() {
  return (
    <svg viewBox="0 0 80 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-16 w-20 opacity-90">
      {/* Sky gradient circle */}
      <circle cx="40" cy="28" r="26" fill="white" fillOpacity="0.12"/>
      {/* Sun */}
      <circle cx="58" cy="14" r="6" fill="white" fillOpacity="0.9"/>
      <circle cx="58" cy="14" r="9" stroke="white" strokeWidth="1" strokeOpacity="0.4"/>
      {/* Mountain left */}
      <path d="M2 52 L22 24 L42 52 Z" fill="white" fillOpacity="0.35"/>
      {/* Mountain right (snow cap) */}
      <path d="M30 52 L50 18 L70 52 Z" fill="white" fillOpacity="0.6"/>
      <path d="M44 30 L50 18 L56 30 Z" fill="white" fillOpacity="0.95"/>
      {/* Ground */}
      <rect x="0" y="52" width="80" height="4" rx="2" fill="white" fillOpacity="0.25"/>
      {/* Palm left */}
      <rect x="8" y="38" width="2.5" height="14" rx="1.25" fill="white" fillOpacity="0.7"/>
      <path d="M9 38 Q2 30 6 26 Q8 32 9 38Z" fill="white" fillOpacity="0.6"/>
      <path d="M9 38 Q16 30 14 25 Q11 31 9 38Z" fill="white" fillOpacity="0.5"/>
    </svg>
  );
}

// ── 1. Exit Intent Popup ─────────────────────────────────────────────────────

function ExitIntentPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // ?testpopup=1 forces it open immediately (for testing)
    if (new URLSearchParams(window.location.search).get("testpopup") === "1") {
      setVisible(true);
      return;
    }

    if (sessionStorage.getItem("uno_exit_shown")) {
      console.log("[UNO] Exit popup already shown this session. Run: sessionStorage.removeItem('uno_exit_shown') to reset.");
      return;
    }

    const trigger = () => {
      setVisible(true);
      sessionStorage.setItem("uno_exit_shown", "1");
      document.removeEventListener("mousemove", moveHandle);
    };

    // Trigger on exit intent — cursor moves toward browser chrome (top of viewport)
    let armed = false;
    const armTimer = setTimeout(() => { armed = true; }, 1500);
    const moveHandle = (e: MouseEvent) => {
      if (armed && e.clientY < 5) trigger();
    };

    document.addEventListener("mousemove", moveHandle);
    return () => {
      clearTimeout(armTimer);
      document.removeEventListener("mousemove", moveHandle);
    };
  }, []);

  const dismiss = () => setVisible(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[UNO Trips] Exit intent lead:", email);
    setSubmitted(true);
    setTimeout(dismiss, 2500);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4" onClick={dismiss}>
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[420px] overflow-hidden rounded-3xl bg-white shadow-[0_32px_80px_-8px_rgba(0,0,0,0.45)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/35"
        >
          <X className="h-4 w-4" />
        </button>

        {/* ── Orange header with SVG decorations ── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#EA580C] via-[#F06A1E] to-[#F97316] px-6 pb-8 pt-6 text-white">
          <SparklesSvg />
          <PlaneTrailSvg />

          {/* Badge */}
          <div className="relative z-10 mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm">
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none">
              <path d="M2 6h12M6 2v12M2 10l4-4 4 4 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="8" cy="8" r="6.5" stroke="white" strokeWidth="1.2" opacity="0.4"/>
            </svg>
            <span className="text-[10px] font-black uppercase tracking-[0.22em]">Limited Time Offer</span>
          </div>

          {/* Headline + illustration row */}
          <div className="relative z-10 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-[28px] font-black leading-[1.1] tracking-tight">
                Get ₹2,000 <span className="text-yellow-300">OFF</span><br />
                your first<br />booking!
              </h2>
              <p className="mt-2.5 text-[13px] leading-relaxed text-white/85">
                Drop your email — we&apos;ll send the<br />coupon code instantly. 🎁
              </p>
            </div>
            <div className="shrink-0 pb-1">
              <LandmarkSvg />
            </div>
          </div>

          {/* Wave divider */}
          <div className="absolute -bottom-px left-0 right-0">
            <svg viewBox="0 0 420 24" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full">
              <path d="M0 24 Q105 0 210 12 Q315 24 420 8 L420 24 Z" fill="white"/>
            </svg>
          </div>
        </div>

        {/* ── White form section ── */}
        <div className="px-6 pb-6 pt-4">
          {submitted ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                <svg className="h-8 w-8 text-emerald-500" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.15"/>
                  <path d="M7 12.5l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-base font-bold text-slate-800">Coupon sent!</p>
              <p className="text-sm text-slate-500">Check your inbox — happy travels! ✈️</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {/* Trust row */}
              <div className="flex items-center gap-4 rounded-xl bg-slate-50 px-4 py-2.5">
                {[
                  { icon: "✈️", label: "1,200+ trips booked" },
                  { icon: "⭐", label: "4.8 rated" },
                  { icon: "🔒", label: "100% secure" },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-1">
                    <span className="text-sm">{icon}</span>
                    <span className="text-[10px] font-semibold text-slate-500">{label}</span>
                  </div>
                ))}
              </div>

              <div className="relative">
                <svg className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M2 8l10 7 10-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full rounded-2xl border-2 border-slate-200 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-primary"
                />
              </div>

              <button
                type="submit"
                className="relative w-full overflow-hidden rounded-2xl bg-primary py-3.5 text-sm font-black tracking-wide text-white shadow-[0_6px_20px_-4px_rgba(234,88,12,0.55)] transition hover:bg-primary/90 hover:shadow-[0_8px_24px_-4px_rgba(234,88,12,0.6)]"
              >
                Claim My ₹2,000 Coupon →
              </button>

              <button
                type="button"
                onClick={dismiss}
                className="text-center text-xs text-slate-400 transition hover:text-slate-600"
              >
                No thanks, I&apos;ll pay full price
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 2. Sticky Mobile Bottom Bar ──────────────────────────────────────────────

function StickyMobileBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-[90] sm:hidden">
      <div
        className="flex items-center gap-3 px-4 pb-safe pt-3 pb-4"
        style={{
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: "0 -1px 0 rgba(0,0,0,0.06), 0 -8px 24px rgba(0,0,0,0.08)",
          paddingBottom: "max(16px, env(safe-area-inset-bottom))",
        }}
      >
        {/* Text */}
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold text-slate-900">Need help planning?</p>
          <p className="text-[11px] text-slate-400">Talk to an expert · Free</p>
        </div>

        {/* WhatsApp pill */}
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#25D366] px-4 py-2.5 text-[12px] font-bold text-[#25D366] transition active:bg-[#25D366]/10"
        >
          <MessageCircle className="h-4 w-4" strokeWidth={2} />
          WhatsApp
        </a>

        {/* Call pill */}
        <a
          href="tel:+919999999999"
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-[12px] font-bold text-white shadow-[0_4px_12px_rgba(234,88,12,0.35)] transition active:brightness-90"
        >
          <Phone className="h-4 w-4" strokeWidth={2} />
          Call
        </a>
      </div>
    </div>
  );
}

// ── 3. Floating "Get Best Price" CTA (Desktop) ───────────────────────────────

function FloatingBestPrice() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [dest, setDest] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[UNO Trips] Best price lead:", { name, phone, dest });
    setSubmitted(true);
    setTimeout(() => { setOpen(false); setSubmitted(false); }, 2500);
  };

  return (
    <div className="fixed right-0 top-1/2 z-[80] hidden -translate-y-1/2 flex-col items-end sm:flex">
      {open ? (
        <div className="w-72 overflow-hidden rounded-l-2xl border border-slate-200 bg-white shadow-[0_8px_40px_rgba(0,0,0,0.18)]">
          <div className="flex items-center justify-between bg-primary px-4 py-3">
            <p className="text-sm font-bold text-white">Get Best Price</p>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4">
            {submitted ? (
              <p className="py-4 text-center text-sm font-bold text-emerald-600">
                ✅ We&apos;ll call you shortly!
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone Number"
                    className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={dest}
                    onChange={(e) => setDest(e.target.value)}
                    placeholder="Destination (optional)"
                    className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary"
                  />
                </div>
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-sm font-bold text-white transition hover:bg-primary/90"
                >
                  Get Free Quote <ChevronRight className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex flex-col items-center gap-1.5 rounded-l-lg bg-primary px-2 py-4 text-white shadow-[0_4px_20px_rgba(234,88,12,0.4)] transition hover:bg-primary/90"
          aria-label="Get best price"
        >
          <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 16 16" fill="none">
            <path d="M8 1l-7 3.5 7 3.5 7-3.5L8 1zM1 11.5l7 3.5 7-3.5M1 7.5l7 3.5 7-3.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span
            className="whitespace-nowrap text-[9px] font-black uppercase tracking-wide"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            Best Price
          </span>
        </button>
      )}
    </div>
  );
}

// ── 4. Chatbot Widget ────────────────────────────────────────────────────────

type Message = { from: "bot" | "user"; text: string };

const QUICK_REPLIES = [
  "View holiday packages",
  "Best price guarantee?",
  "How to book?",
  "Talk to an expert",
];

const BOT_RESPONSES: { keywords: string[]; reply: string }[] = [
  {
    keywords: ["package", "holiday", "tour", "trip", "travel"],
    reply: "We have packages for Goa, Kerala, Himachal, Rajasthan, Dubai, Thailand & more! Starting from ₹9,999/person. Want me to show you trending packages? 🌍",
  },
  {
    keywords: ["price", "cost", "budget", "cheap", "affordable", "guarantee"],
    reply: "We offer the Best Price Guarantee — if you find the same package cheaper anywhere, we'll match it! 💰 Domestic packages start at ₹9,999 and international from ₹24,999.",
  },
  {
    keywords: ["book", "booking", "how", "process", "steps"],
    reply: "Booking is simple! 1️⃣ Search your destination 2️⃣ Pick a package 3️⃣ Select dates & guests 4️⃣ Pay securely online. Need help? Our experts are on call 24/7!",
  },
  {
    keywords: ["expert", "agent", "call", "talk", "support", "help", "human"],
    reply: `Our travel experts are available 24/7. 📞 Call us: +91 99999 99999 or WhatsApp us now! <a href="${whatsappHref}" target="_blank" class="underline font-semibold">Chat on WhatsApp →</a>`,
  },
  {
    keywords: ["goa"],
    reply: "Goa is one of our most popular destinations! 🏖️ We have beach packages starting from ₹9,999. Includes hotel, transfers & sightseeing. Want to know more?",
  },
  {
    keywords: ["kerala"],
    reply: "Kerala — God's Own Country! 🌴 Backwater cruises, hill stations & beaches. Packages from ₹12,999. Honeymoon & family packages available.",
  },
  {
    keywords: ["himachal", "manali", "shimla", "spiti"],
    reply: "Himachal Pradesh is magical! 🏔️ Snow-capped peaks, adventure sports & cozy stays. Packages from ₹11,999. Best time: Oct–June.",
  },
  {
    keywords: ["dubai", "international", "abroad", "foreign"],
    reply: "International packages starting ₹24,999! 🌏 Popular: Dubai, Thailand, Bali, Singapore, Europe. Includes flights, hotel & transfers.",
  },
  {
    keywords: ["cancel", "refund", "policy"],
    reply: "We offer flexible cancellation on most packages. 📋 Full refund available up to 7 days before travel date. Terms vary by package — want details?",
  },
  {
    keywords: ["hi", "hello", "hey", "namaste"],
    reply: "Hey there! 👋 I'm Voya, your personal travel assistant from UNO Trips. I can help you find packages, check prices, or connect you with an expert. What are you looking for?",
  },
];

function getBotReply(input: string): string {
  const lower = input.toLowerCase();
  for (const { keywords, reply } of BOT_RESPONSES) {
    if (keywords.some((k) => lower.includes(k))) return reply;
  }
  return "Great question! 🤔 I'll connect you with one of our travel experts who can help you better. You can also call us at +91 99999 99999 or browse our packages above!";
}

function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", text: "Hey! 👋 I'm Voya, your UNO Trips travel assistant. Ask me anything about packages, pricing or bookings!" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [badge, setBadge] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { from: "user", text: text.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);
    scrollToBottom();
    setTimeout(() => {
      setMessages((m) => [...m, { from: "bot", text: getBotReply(text) }]);
      setTyping(false);
      scrollToBottom();
    }, 900);
  };

  return (
    <div className="fixed bottom-[84px] right-5 z-[85] flex flex-col items-end gap-3 sm:bottom-6">
      {/* Chat window */}
      {open && (
        <div className="flex h-[480px] w-[340px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_-8px_rgba(0,0,0,0.25)]">
          {/* Header */}
          <div className="flex items-center gap-3 bg-primary px-4 py-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
              <Bot className="h-5 w-5 text-white" strokeWidth={1.8} />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-white">Voya · UNO Trips</p>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] text-white/80">Online · replies instantly</span>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                {msg.from === "bot" && (
                  <div className="mr-2 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary">
                    <Bot className="h-3.5 w-3.5 text-white" strokeWidth={2} />
                  </div>
                )}
                <div
                  className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                    msg.from === "user"
                      ? "rounded-br-sm bg-primary text-white"
                      : "rounded-bl-sm bg-white text-slate-800 shadow-sm"
                  }`}
                  dangerouslySetInnerHTML={{ __html: msg.text }}
                />
              </div>
            ))}
            {typing && (
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary">
                  <Bot className="h-3.5 w-3.5 text-white" strokeWidth={2} />
                </div>
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-sm">
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      className="h-1.5 w-1.5 rounded-full bg-slate-400"
                      style={{ animation: `bounce 1s infinite ${d * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          {messages.length <= 2 && (
            <div className="flex flex-wrap gap-1.5 border-t border-slate-100 bg-white px-3 py-2.5">
              {QUICK_REPLIES.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-[11px] font-semibold text-primary transition hover:bg-primary/10"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
            className="flex items-center gap-2 border-t border-slate-100 bg-white px-3 py-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[13px] outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary/90 disabled:opacity-40"
            >
              <Send className="h-4 w-4" strokeWidth={2} />
            </button>
          </form>
        </div>
      )}

      {/* Trigger button */}
      <button
        onClick={() => { setOpen((v) => !v); setBadge(false); }}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-[0_4px_20px_rgba(234,88,12,0.5)] transition hover:scale-105 hover:bg-primary/90"
        aria-label="Open chat"
      >
        {open ? <X className="h-6 w-6 text-white" /> : <MessageCircle className="h-7 w-7 text-white" strokeWidth={1.8} />}
        {badge && !open && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-black text-white">1</span>
        )}
      </button>

      <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)} }`}</style>
    </div>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────

export function LeadCaptureWidgets() {
  return (
    <>
      <ExitIntentPopup />
      <StickyMobileBar />
      <FloatingBestPrice />
      <ChatbotWidget />
    </>
  );
}
