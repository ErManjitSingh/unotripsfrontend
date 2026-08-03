"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { LEH_ADS } from "@/lib/meta/leh-tour-data";

const HimachalChatbot = dynamic(
  () =>
    import("@/components/meta/himachal-chatbot/himachal-chatbot").then(
      (m) => m.HimachalChatbot,
    ),
  { ssr: false },
);

export function LehDeferredChatbot() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const arm = () => {
      if (!cancelled) setReady(true);
    };
    const idle =
      "requestIdleCallback" in window
        ? window.requestIdleCallback(arm, { timeout: 4500 })
        : 0;
    const timer = window.setTimeout(arm, 3500);
    const onInteract = () => arm();
    window.addEventListener("scroll", onInteract, { once: true, passive: true });
    window.addEventListener("pointerdown", onInteract, { once: true });
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      if (idle && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(Number(idle));
      }
      window.removeEventListener("scroll", onInteract);
      window.removeEventListener("pointerdown", onInteract);
    };
  }, []);

  if (!ready) return null;

  return (
    <HimachalChatbot
      landingPage={LEH_ADS.landingPage}
      destination="Leh Ladakh"
      chatTitle="Leh Ladakh Tour Expert"
      leadName="Leh Chatbot Lead"
      greeting="Hello 👋 Welcome to Uno Trips Leh Ladakh tours. Let’s find your perfect route."
      questions={[
        {
          id: "route",
          text: "Which trip interests you?",
          options: ["Leh Nubra Pangong", "Family Tour", "Bike Trip", "Custom itinerary"],
        },
        {
          id: "date",
          text: "When are you travelling?",
          options: ["Within 15 days", "Next month", "Later"],
        },
        {
          id: "contact",
          text: "Share your 10-digit number for your free quote.",
          inputType: "mobile",
        },
      ]}
    />
  );
}
