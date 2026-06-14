"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import type { NearbyAttraction } from "./types";

interface Props {
  attractions: NearbyAttraction[];
  onChange: (list: NearbyAttraction[]) => void;
}

const inputCls = "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20";

export default function AttractionInput({ attractions, onChange }: Props) {
  const [name, setName] = useState("");
  const [dist, setDist] = useState("");

  function add() {
    if (!name.trim() || !dist.trim()) return;
    onChange([...attractions, { name: name.trim(), distance_km: dist.trim() }]);
    setName(""); setDist("");
  }

  return (
    <div className="space-y-3">
      {attractions.length > 0 && (
        <div className="space-y-2">
          {attractions.map((a, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="flex items-center gap-2.5">
                <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">{a.distance_km} km</span>
                <span className="text-sm font-medium text-slate-800">{a.name}</span>
              </div>
              <button type="button" onClick={() => onChange(attractions.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-500">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="grid grid-cols-[1fr_100px_auto] items-end gap-2">
        <div>
          {attractions.length === 0 && <label className="mb-1.5 block text-xs font-semibold text-slate-600">Attraction Name</label>}
          <input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. City Palace" onKeyDown={e => e.key === "Enter" && add()} />
        </div>
        <div>
          {attractions.length === 0 && <label className="mb-1.5 block text-xs font-semibold text-slate-600">Distance (km)</label>}
          <input className={inputCls} type="number" value={dist} onChange={e => setDist(e.target.value)} placeholder="2.5" />
        </div>
        <button
          type="button" onClick={add} disabled={!name.trim() || !dist.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}