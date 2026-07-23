"use client";

import { useEffect, useState } from "react";

const MANALI = { lat: 32.24, lon: 77.19 } as const;

const WEATHER_CODE: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with heavy hail",
};

type WeatherState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ok";
      temp: number;
      code: number;
      label: string;
    };

export function WeatherWidget() {
  const [state, setState] = useState<WeatherState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${MANALI.lat}&longitude=${MANALI.lon}` +
      `&current=temperature_2m,weather_code&timezone=Asia%2FKolkata`;

    async function load() {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error("Weather unavailable");
        const data = (await res.json()) as {
          current?: { temperature_2m?: number; weather_code?: number };
        };
        const temp = data.current?.temperature_2m;
        const code = data.current?.weather_code;
        if (typeof temp !== "number" || typeof code !== "number") {
          throw new Error("Incomplete weather data");
        }
        if (cancelled) return;
        setState({
          status: "ok",
          temp: Math.round(temp),
          code,
          label: WEATHER_CODE[code] || "Current conditions",
        });
      } catch {
        if (!cancelled) {
          setState({
            status: "error",
            message: "Live weather temporarily unavailable",
          });
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="hs1-weather" aria-live="polite">
      <h3>Live Weather - Manali</h3>
      <p className="place">Open-Meteo · Lat {MANALI.lat}, Lon {MANALI.lon}</p>
      {state.status === "loading" ? (
        <p className="desc">Fetching current temperature…</p>
      ) : null}
      {state.status === "error" ? <p className="err">{state.message}</p> : null}
      {state.status === "ok" ? (
        <>
          <p className="temp">{state.temp}°C</p>
          <p className="desc">{state.label}</p>
          <p className="meta">Updated just now · Free Open-Meteo API</p>
        </>
      ) : null}
    </div>
  );
}