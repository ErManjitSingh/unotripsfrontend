"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import RoomForm from "../shared/RoomForm";
import type { PropertyWizardData, RoomTypePayload } from "../shared/types";

const BED_LABELS: Record<string, string> = {
  single:"Single",double:"Double",twin:"Twin",queen:"Queen",king:"King",bunk:"Bunk",
};

interface Props {
  data: PropertyWizardData;
  setField: <K extends keyof PropertyWizardData>(key: K, val: PropertyWizardData[K]) => void;
}

export default function Step6Rooms({ data, setField }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editIdx,  setEditIdx]  = useState<number|null>(null);

  function saveRoom(room: RoomTypePayload) {
    if (editIdx !== null) {
      const updated = [...data.room_types]; updated[editIdx] = room;
      setField("room_types", updated); setEditIdx(null);
    } else {
      setField("room_types", [...data.room_types, room]);
    }
    setShowForm(false);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        💡 Add at least <strong>1 room type</strong> to proceed. More room types can be added after approval.
      </div>

      {data.room_types.length > 0 && (
        <div className="space-y-2">
          {data.room_types.map((room, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
              <div>
                <p className="font-semibold text-slate-800">{room.name}</p>
                <p className="text-xs text-slate-400">
                  {BED_LABELS[room.bed_type]} · Max {room.max_occupancy} · {room.count} room{room.count > 1 ? "s" : ""} · ₹{room.base_price.toLocaleString()}/night
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditIdx(i); setShowForm(true); }} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">Edit</button>
                <button onClick={() => setField("room_types", data.room_types.filter((_, j) => j !== i))} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm ? (
        <RoomForm
          initial={editIdx !== null ? data.room_types[editIdx] : undefined}
          onSave={saveRoom}
          onCancel={() => { setShowForm(false); setEditIdx(null); }}
        />
      ) : (
        <Button variant="outline" onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Room Type
        </Button>
      )}

      {data.room_types.length === 0 && !showForm && (
        <div className="rounded-xl border-2 border-dashed border-slate-200 py-10 text-center">
          <p className="text-sm text-slate-400">No room types yet. Click "Add Room Type" above.</p>
        </div>
      )}
    </div>
  );
}