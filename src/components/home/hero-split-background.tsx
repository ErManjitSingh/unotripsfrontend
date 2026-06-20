"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const SLIDES = [
  {
    city: "Himachal",
    label: "Alpine Valleys",
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1800&q=90",
    alt: "Himachal Pradesh — snow-capped Himalayan peaks",
    objectPosition: "center 40%",
  },
  {
    city: "Ladakh",
    label: "High Desert",
    src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1800&q=90",
    alt: "Ladakh — serene mountain lake landscape",
    objectPosition: "center 50%",
  },
  {
    city: "Rajasthan",
    label: "Royal Palaces",
    src: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1800&q=90",
    alt: "Rajasthan — Mehrangarh Fort, Jodhpur",
    objectPosition: "center 45%",
  },
  {
    city: "Kerala",
    label: "Backwaters",
    src: "https://images.unsplash.com/photo-1593693411515-c20261bcad6e?w=1800&q=90",
    alt: "Kerala — lush backwaters and palm groves",
    objectPosition: "center 50%",
  },
] as const;

const INTERVAL_MS = 5500;
const FADE_MS = 1200;

export function HeroSplitBackground() {
  const [active, setActive] = useState(0);
  const [zoomKeys, setZoomKeys] = useState([0, 0, 0, 0]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function goTo(index: number) {
    setActive(index);
    setZoomKeys((prev) => prev.map((k, i) => (i === index ? k + 1 : k)));
    // restart the interval so it doesn't immediately skip
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(advance, INTERVAL_MS);
  }

  function advance() {
    setActive((prev) => {
      const next = (prev + 1) % SLIDES.length;
      setZoomKeys((keys) => keys.map((k, i) => (i === next ? k + 1 : k)));
      return next;
    });
  }

  useEffect(() => {
    timerRef.current = setInterval(advance, INTERVAL_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0d1117]">
      <style>{`
        @keyframes heroKenBurns {
          from { transform: scale(1.0); }
          to   { transform: scale(1.13); }
        }
      `}</style>

      {/* Slides */}
      {SLIDES.map((slide, i) => (
        <div
          key={slide.city}
          className="absolute inset-0 overflow-hidden"
          style={{
            opacity: i === active ? 1 : 0,
            transition: `opacity ${FADE_MS}ms ease-in-out`,
            zIndex: i === active ? 1 : 0,
          }}
        >
          <Image
            key={`${slide.city}-${zoomKeys[i]}`}
            src={slide.src}
            alt={slide.alt}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
            style={{
              objectPosition: slide.objectPosition,
              animation: `heroKenBurns ${INTERVAL_MS + FADE_MS}ms ease-out forwards`,
            }}
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-black/65" />
        </div>
      ))}

      {/* Dot navigation — bottom of hero */}
      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center">
        <div className="flex items-center gap-2">
          {SLIDES.map((_, j) => (
            <button
              key={j}
              type="button"
              onClick={() => goTo(j)}
              aria-label={`Go to ${SLIDES[j].city}`}
              className="pointer-events-auto focus:outline-none"
            >
              <span
                className="block h-[3px] rounded-full transition-all duration-500"
                style={{
                  width: j === active ? "28px" : "8px",
                  background: j === active ? "#FBBF24" : "rgba(255,255,255,0.35)",
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
