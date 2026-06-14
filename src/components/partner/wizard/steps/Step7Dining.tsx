"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import DiningForm from "../shared/DiningForm";
import type { PropertyWizardData, DiningVenue } from "../shared/types";

interface Props {
  data: PropertyWizardData;
  setField: <K extends keyof PropertyWizardData>(key: K, val: PropertyWizardData[K]) => void;
}

export default function Step7Dining({ data, setField }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editIdx,  setEditIdx]  = useState<number|null>(null);

  function saveVenue(venue: DiningVenue) {
    if (editIdx !== null) {
      const updated = [...data.dining_venues]; updated[editIdx] = venue;
      setField("dining_venues", updated); setEditIdx(null);
    } else {
      setField("dining_venues", [...data.dining_venues, venue]);
    }
    setShowForm(false);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        🍽️ This step is <strong>optional</strong> — skip if your property has no dining facilities.
      </div>

      {data.dining_venues.length > 0 && (
        <div className="space-y-2">
          {data.dining_venues.map((venue, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
              <div>
                <p className="font-semibold text-slate-800">{venue.name}</p>
                <p className="text-xs text-slate-400">
                  {venue.cuisine} · {venue.timing}
                  {venue.open_to_public && " · Open to public"}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditIdx(i); setShowForm(true); }} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">Edit</button>
                <button onClick={() => setField("dining_venues", data.dining_venues.filter((_, j) => j !== i))} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm ? (
        <DiningForm
          initial={editIdx !== null ? data.dining_venues[editIdx] : undefined}
          onSave={saveVenue}
          onCancel={() => { setShowForm(false); setEditIdx(null); }}
        />
      ) : (
        <Button variant="outline" onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Dining Venue
        </Button>
      )}
    </div>
  );
}