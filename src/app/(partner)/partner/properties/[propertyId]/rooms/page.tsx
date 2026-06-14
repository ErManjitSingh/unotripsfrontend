"use client";

/**
 * src/app/(partner)/partner/properties/[propertyId]/rooms/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Manage Room Types — 1000% replica of unohotelsandresorts.com
 *
 * Features:
 *   • List all room types for a property
 *   • Add / Edit via inline slide-down form (no external Modal/RoomTypeForm dep)
 *   • Toggle Active / Inactive per room
 *   • Delete with confirmation
 *   • "Manage Rates" → links to /partner/rates (new frontend pattern, no modal)
 *   • Meal plan badges on each card
 *   • Amenity pill chips (max 5 shown + overflow count)
 *
 * API (new frontend token-based pattern):
 *   partnerApi.listRooms(token, propertyId)
 *   partnerApi.addRoom(token, propertyId, data)
 *   partnerApi.updateRoom(token, propertyId, roomId, data)
 *   partnerApi.deleteRoom(token, propertyId, roomId)
 */

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { partnerApi } from "@/lib/partner/api";
import {
  PARTNER_MEAL_PLAN_LABELS,
  MEAL_PLAN_CODES,
  MEAL_DEFAULT_PRICES,
  type RoomTypePayload,
  type PartnerMealKey,
  type MealPlans,
  type BedType,
} from "@/components/partner/wizard/shared/types";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PartnerRoomType {
  id:            string;
  name:          string;
  description?:  string;
  bed_type:      string;
  max_occupancy: number;
  size_sqft:     number;
  count:         number;
  base_price:    number;
  weekend_price?: number;
  amenities:     string[];
  meal_plans:    Partial<Record<PartnerMealKey, number>>;
  is_active:     boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtPrice(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function useToast() {
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  function show(msg: string, type: "success" | "error") {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ msg, type });
    timerRef.current = setTimeout(() => setToast(null), 3500);
  }
  const el = toast ? (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 500, background: toast.type === "success" ? "#16a34a" : "#dc2626", color: "#fff", boxShadow: "0 4px 20px rgba(0,0,0,0.2)", maxWidth: 340, animation: "roomsFadeIn 0.2s ease" }}>
      {toast.msg}
    </div>
  ) : null;
  return { success: (m: string) => show(m, "success"), error: (m: string) => show(m, "error"), el };
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Sk({ h = 14, w = "100%" }: { h?: number; w?: number | string }) {
  return <div style={{ height: h, width: w, borderRadius: 6, background: "linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)", backgroundSize: "200% 100%", animation: "roomsShimmer 1.4s infinite" }} />;
}

// ── Shared form styles ────────────────────────────────────────────────────────

const labelSt: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: "#6B7280",
  textTransform: "uppercase" as const, letterSpacing: "0.06em",
  display: "block", marginBottom: 6,
};

const inputSt: React.CSSProperties = {
  width: "100%", border: "1.5px solid #E5E5E5", borderRadius: 8,
  fontSize: 13, fontFamily: "inherit", outline: "none",
  boxSizing: "border-box" as const, transition: "border-color 0.18s",
  background: "#fff", color: "#0C0C0C",
};

function FI(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props} style={{ ...inputSt, height: 42, padding: "0 12px", ...props.style }}
      onFocus={e => { e.currentTarget.style.borderColor = "#C9A84C"; props.onFocus?.(e); }}
      onBlur={e  => { e.currentTarget.style.borderColor = "#E5E5E5"; props.onBlur?.(e); }}
    />
  );
}

function FS(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} style={{ ...inputSt, height: 42, padding: "0 12px", appearance: "none" as const, cursor: "pointer", ...props.style }}
      onFocus={e => { e.currentTarget.style.borderColor = "#C9A84C"; props.onFocus?.(e); }}
      onBlur={e  => { e.currentTarget.style.borderColor = "#E5E5E5"; props.onBlur?.(e); }}
    />
  );
}

function FTA(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea {...props} style={{ ...inputSt, padding: "10px 12px", resize: "vertical" as const, lineHeight: 1.6, ...props.style }}
      onFocus={e => { e.currentTarget.style.borderColor = "#C9A84C"; props.onFocus?.(e); }}
      onBlur={e  => { e.currentTarget.style.borderColor = "#E5E5E5"; props.onBlur?.(e); }}
    />
  );
}

// ── RoomForm (inline, no external dependency) ─────────────────────────────────

const ROOM_AMENITIES = [
  "AC","WiFi","TV","Mini Bar","Safe","Balcony",
  "Sea View","Lake View","Garden View","Jacuzzi",
  "Bathtub","Coffee Maker","Microwave","Kitchenette",
];

const BED_TYPES: { value: BedType; label: string }[] = [
  { value: "single", label: "Single Bed"  },
  { value: "double", label: "Double Bed"  },
  { value: "twin",   label: "Twin Beds"   },
  { value: "queen",  label: "Queen Bed"   },
  { value: "king",   label: "King Bed"    },
  { value: "bunk",   label: "Bunk Beds"   },
];

const MEAL_ICONS: Record<PartnerMealKey, string> = {
  breakfast: "☕", lunch: "🍱", dinner: "🍽️",
};
const MEAL_DESCRIPTIONS: Record<PartnerMealKey, string> = {
  breakfast: "Morning meal included",
  lunch:     "Midday meal included",
  dinner:    "Evening meal included",
};

const cardSt: React.CSSProperties = {
  padding: 18, borderRadius: 10, border: "1px solid #E5E5E5",
  background: "#fff", display: "flex", flexDirection: "column", gap: 14,
};

interface RoomFormProps {
  initial?:  Partial<PartnerRoomType>;
  onSave:    (data: RoomTypePayload) => void;
  onCancel:  () => void;
  loading:   boolean;
}

function RoomForm({ initial, onSave, onCancel, loading }: RoomFormProps) {
  const [name,        setName]        = useState(initial?.name        ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [bedType,     setBedType]     = useState<BedType>(initial?.bed_type as BedType ?? "king");
  const [maxOcc,      setMaxOcc]      = useState(initial?.max_occupancy ?? 2);
  const [sqft,        setSqft]        = useState(initial?.size_sqft ?? 300);
  const [count,       setCount]       = useState(initial?.count ?? 1);
  const [basePrice,   setBasePrice]   = useState(initial?.base_price ?? 0);
  const [weekendPrice,setWeekendPrice]= useState(initial?.weekend_price ?? "");
  const [amenities,   setAmenities]   = useState<string[]>(initial?.amenities ?? []);
  const [mealPlans,   setMealPlans]   = useState<MealPlans>(initial?.meal_plans ?? {});
  const [isActive,    setIsActive]    = useState(initial?.is_active ?? true);
  const [errors,      setErrors]      = useState<Record<string, string>>({});

  function toggleAmenity(a: string) {
    setAmenities(p => p.includes(a) ? p.filter(x => x !== a) : [...p, a]);
  }

  function toggleMeal(meal: PartnerMealKey) {
    setMealPlans(p => {
      const n = { ...p };
      if (meal in n) delete n[meal]; else n[meal] = MEAL_DEFAULT_PRICES[meal];
      return n;
    });
  }

  function setMealPrice(meal: PartnerMealKey, price: number) {
    setMealPlans(p => ({ ...p, [meal]: price }));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!name.trim())   e.name       = "Room name is required";
    if (basePrice <= 0) e.basePrice  = "Base price must be greater than ₹0";
    if (maxOcc < 1)     e.maxOcc     = "At least 1 guest required";
    if (count < 1)      e.count      = "At least 1 room required";
    for (const meal of MEAL_PLAN_CODES) {
      if (meal in mealPlans && (mealPlans[meal] ?? 0) <= 0) {
        e.meals = `${PARTNER_MEAL_PLAN_LABELS[meal]} price must be > ₹0`; break;
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    onSave({
      name:          name.trim(),
      description:   description.trim(),
      bed_type:      bedType,
      max_occupancy: maxOcc,
      size_sqft:     sqft,
      count,
      base_price:    basePrice,
      weekend_price: weekendPrice ? Number(weekendPrice) : undefined,
      amenities,
      meal_plans:    mealPlans,
      is_active:     isActive,
      images:        (initial as any)?.images ?? [],
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Basic details */}
      <div style={cardSt}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#0C0C0C" }}>Room Details</div>
        <div>
          <label style={labelSt}>Room Name *</label>
          <FI value={name} onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: "" })); }} placeholder="e.g. Deluxe King Room" />
          {errors.name && <p style={{ fontSize: 11, color: "#dc2626", margin: "4px 0 0" }}>{errors.name}</p>}
        </div>
        <div>
          <label style={labelSt}>Description</label>
          <FTA value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Briefly describe this room type…" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={labelSt}>Bed Type *</label>
            <FS value={bedType} onChange={e => setBedType(e.target.value as BedType)}>
              {BED_TYPES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
            </FS>
          </div>
          <div>
            <label style={labelSt}>Max Occupancy *</label>
            <FI type="number" min={1} max={10} value={maxOcc} onChange={e => { setMaxOcc(Number(e.target.value)); setErrors(p => ({ ...p, maxOcc: "" })); }} />
            {errors.maxOcc && <p style={{ fontSize: 11, color: "#dc2626", margin: "4px 0 0" }}>{errors.maxOcc}</p>}
          </div>
          <div>
            <label style={labelSt}>Size (sq ft)</label>
            <FI type="number" min={0} value={sqft} onChange={e => setSqft(Number(e.target.value))} />
          </div>
          <div>
            <label style={labelSt}>Number of Rooms *</label>
            <FI type="number" min={1} value={count} onChange={e => { setCount(Number(e.target.value)); setErrors(p => ({ ...p, count: "" })); }} />
            {errors.count && <p style={{ fontSize: 11, color: "#dc2626", margin: "4px 0 0" }}>{errors.count}</p>}
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div style={cardSt}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#0C0C0C" }}>Room Amenities</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {ROOM_AMENITIES.map(a => {
            const on = amenities.includes(a);
            return (
              <button key={a} type="button" onClick={() => toggleAmenity(a)}
                style={{ padding: "5px 13px", borderRadius: 9999, fontSize: 12, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", border: `1.5px solid ${on ? "#C9A84C" : "#E5E5E5"}`, background: on ? "rgba(201,168,76,0.08)" : "#fff", color: on ? "#7A5F18" : "#6B7280", fontWeight: on ? 600 : 400 }}>
                {a}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pricing */}
      <div style={cardSt}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#0C0C0C" }}>Pricing</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={labelSt}>Base Price / Night (₹) *</label>
            <FI type="number" min={0} value={basePrice} onChange={e => { setBasePrice(Number(e.target.value)); setErrors(p => ({ ...p, basePrice: "" })); }} />
            {errors.basePrice && <p style={{ fontSize: 11, color: "#dc2626", margin: "4px 0 0" }}>{errors.basePrice}</p>}
          </div>
          <div>
            <label style={labelSt}>Weekend Price / Night (₹)</label>
            <FI type="number" min={0} value={weekendPrice} placeholder="Optional" onChange={e => setWeekendPrice(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Meal Plans */}
      <div style={cardSt}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0C0C0C", marginBottom: 4 }}>Meal Options</div>
          <p style={{ fontSize: 12, color: "#6B7280", margin: 0 }}>Optional — enable meals and set price per person per night.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {MEAL_PLAN_CODES.map(meal => {
            const enabled = meal in mealPlans;
            const price   = mealPlans[meal] ?? 0;
            return (
              <div key={meal} style={{ padding: "12px 14px", borderRadius: 9, border: `1.5px solid ${enabled ? "#C9A84C" : "#E5E5E5"}`, background: enabled ? "rgba(201,168,76,0.04)" : "#fafaf9", transition: "all 0.15s" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", flex: 1 }}>
                    <input type="checkbox" checked={enabled} onChange={() => toggleMeal(meal)} style={{ width: 15, height: 15, accentColor: "#C9A84C", cursor: "pointer", flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0C0C0C" }}>{MEAL_ICONS[meal]} {PARTNER_MEAL_PLAN_LABELS[meal]}</div>
                      <div style={{ fontSize: 11, color: "#9B9B9B", marginTop: 1 }}>{MEAL_DESCRIPTIONS[meal]}</div>
                    </div>
                  </label>
                  {enabled && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      <span style={{ fontSize: 13, color: "#6B7280" }}>₹</span>
                      <input type="number" min={1} value={price} onChange={e => setMealPrice(meal, Number(e.target.value))}
                        style={{ width: 90, padding: "7px 9px", borderRadius: 7, border: "1.5px solid #C9A84C", fontSize: 13, fontFamily: "inherit", outline: "none", textAlign: "right" as const }} />
                      <span style={{ fontSize: 11, color: "#9B9B9B", whiteSpace: "nowrap" as const }}>/person/night</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {errors.meals && <p style={{ fontSize: 11, color: "#dc2626", marginTop: -4 }}>{errors.meals}</p>}
      </div>

      {/* Status */}
      <div style={{ ...cardSt, flexDirection: "row" as const, alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#0C0C0C" }}>Room Status</div>
          <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>Inactive rooms are hidden from guests</div>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} style={{ width: 16, height: 16, accentColor: "#C9A84C", cursor: "pointer" }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: isActive ? "#16a34a" : "#9B9B9B" }}>{isActive ? "Active" : "Inactive"}</span>
        </label>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
        <button type="button" onClick={onCancel}
          style={{ padding: "9px 18px", borderRadius: 10, border: "1.5px solid #E5E5E5", background: "#fff", cursor: "pointer", fontSize: 13, fontFamily: "inherit", color: "#6B7280" }}>
          Cancel
        </button>
        <button type="button" onClick={handleSave} disabled={loading}
          style={{ padding: "9px 22px", borderRadius: 9999, background: loading ? "rgba(201,168,76,0.4)" : "linear-gradient(135deg,#C9A84C 0%,#b8943e 100%)", color: "#fff", border: "none", cursor: loading ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit", boxShadow: loading ? "none" : "0 2px 8px rgba(201,168,76,0.3)", display: "inline-flex", alignItems: "center", gap: 8 }}>
          {loading && <span style={{ width: 13, height: 13, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "#fff", animation: "roomsSpin 0.7s linear infinite", display: "inline-block" }} />}
          {loading ? "Saving…" : initial ? "Update Room" : "Add Room"}
        </button>
      </div>
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function PropertyRoomsPage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const { getAccessToken } = useAuth();
  const toast = useToast();
  const token = getAccessToken();

  const [loading,  setLoading]  = useState(true);
  const [rooms,    setRooms]    = useState<PartnerRoomType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editRoom, setEditRoom] = useState<PartnerRoomType | null>(null);
  const [saving,   setSaving]   = useState(false);

  // ── Load rooms ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!token || !propertyId) return;
    let cancelled = false;
    setLoading(true);

    partnerApi.listRooms(token, propertyId)
      .then(data => { if (!cancelled) setRooms((data as PartnerRoomType[]) ?? []); })
      .catch(() => toast.error("Failed to load rooms."))
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, propertyId]);

  // ── Add / Edit ─────────────────────────────────────────────────────────────

  async function handleSave(data: RoomTypePayload) {
    if (!token) return;
    setSaving(true);
    try {
      if (editRoom) {
        const updated = await partnerApi.updateRoom(token, propertyId, editRoom.id, data as unknown as Record<string, unknown>);
        setRooms(rs => rs.map(r => r.id === editRoom.id ? (updated as PartnerRoomType) : r));
        toast.success("Room type updated.");
      } else {
        const created = await partnerApi.addRoom(token, propertyId, data as unknown as Record<string, unknown>);
        setRooms(rs => [...rs, created as PartnerRoomType]);
        toast.success("Room type added.");
      }
      setShowForm(false);
      setEditRoom(null);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ── Toggle active ──────────────────────────────────────────────────────────

  async function toggleActive(room: PartnerRoomType) {
    if (!token) return;
    try {
      const updated = await partnerApi.updateRoom(token, propertyId, room.id, { is_active: !room.is_active });
      setRooms(rs => rs.map(r => r.id === room.id ? (updated as PartnerRoomType) : r));
      toast.success(`Room ${(updated as PartnerRoomType).is_active ? "activated" : "deactivated"}.`);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to update status.");
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  async function handleDelete(id: string) {
    if (!token) return;
    if (!confirm("Delete this room type? This cannot be undone.")) return;
    try {
      await partnerApi.deleteRoom(token, propertyId, id);
      setRooms(rs => rs.filter(r => r.id !== id));
      toast.success("Room type deleted.");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to delete room.");
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div>
      {toast.el}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <Link href={`/partner/properties/${propertyId}`}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#9B9B9B", marginBottom: 10, textDecoration: "none" }}
            onMouseEnter={e => e.currentTarget.style.color = "#0C0C0C"}
            onMouseLeave={e => e.currentTarget.style.color = "#9B9B9B"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m19 12H5M12 5l-7 7 7 7"/></svg>
            Back to Property
          </Link>
          <h1 style={{ fontFamily: "inherit", fontSize: 26, fontWeight: 700, color: "#0C0C0C", letterSpacing: "-0.02em", marginBottom: 4 }}>
            Manage Room Types
          </h1>
          <p style={{ fontSize: 14, color: "#6B7280" }}>
            {loading ? "Loading…" : `${rooms.length} room type${rooms.length !== 1 ? "s" : ""} configured`}
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditRoom(null); }}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#0C0C0C", color: "#fff", borderRadius: 9999, fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer", fontFamily: "inherit", transition: "opacity 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          + Add Room Type
        </button>
      </div>

      {/* Inline Add form */}
      {showForm && !editRoom && (
        <div style={{ background: "#fff", border: "1.5px solid #C9A84C", borderRadius: 12, padding: "24px", marginBottom: 20 }}>
          <h3 style={{ fontFamily: "inherit", fontSize: 16, fontWeight: 700, color: "#0C0C0C", marginBottom: 20 }}>Add Room Type</h3>
          <RoomForm onSave={handleSave} onCancel={() => { setShowForm(false); setEditRoom(null); }} loading={saving} />
        </div>
      )}

      {/* Room list */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {Array.from({ length: 3 }).map((_, i) => <Sk key={i} h={120} />)}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {rooms.map(room => (
            <div key={room.id}>
              {/* Room card */}
              <div style={{ background: "#fff", border: `1px solid ${room.is_active ? "#E5E5E5" : "#F0EDE6"}`, borderRadius: 12, padding: "18px 22px", opacity: room.is_active ? 1 : 0.65, transition: "opacity 0.2s" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>

                  {/* Left — info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                      <h3 style={{ fontFamily: "inherit", fontSize: 17, fontWeight: 600, color: "#0C0C0C" }}>{room.name}</h3>
                      <span style={{ padding: "2px 8px", background: room.is_active ? "#f0fdf4" : "#f8f8f8", border: `1px solid ${room.is_active ? "#bbf7d0" : "#e0e0e0"}`, borderRadius: 9999, fontSize: 10, fontWeight: 600, color: room.is_active ? "#15803d" : "#888" }}>
                        {room.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginBottom: 10 }}>
                      <span style={{ fontSize: 13, color: "#6B7280" }}>🛏 {room.bed_type.charAt(0).toUpperCase() + room.bed_type.slice(1)} Bed</span>
                      <span style={{ fontSize: 13, color: "#6B7280" }}>👥 Max {room.max_occupancy} guests</span>
                      {room.size_sqft > 0 && <span style={{ fontSize: 13, color: "#6B7280" }}>📐 {room.size_sqft} sq ft</span>}
                      <span style={{ fontSize: 13, color: "#6B7280" }}>🔑 {room.count} room{room.count !== 1 ? "s" : ""}</span>
                    </div>

                    {/* Amenity chips */}
                    {room.amenities.length > 0 && (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: Object.keys(room.meal_plans ?? {}).length > 0 ? 8 : 0 }}>
                        {room.amenities.slice(0, 5).map(a => (
                          <span key={a} style={{ padding: "2px 8px", background: "#F9F7F2", border: "1px solid #E5E5E5", borderRadius: 4, fontSize: 11, color: "#6B7280" }}>{a}</span>
                        ))}
                        {room.amenities.length > 5 && <span style={{ fontSize: 11, color: "#9B9B9B" }}>+{room.amenities.length - 5} more</span>}
                      </div>
                    )}

                    {/* Meal plan badges */}
                    {Object.keys(room.meal_plans ?? {}).length > 0 && (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                        {(Object.entries(room.meal_plans ?? {}) as [PartnerMealKey, number][]).map(([meal, price]) => (
                          <span key={meal} style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 500, background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.3)", color: "#7A5F18" }}>
                            🍽️ {PARTNER_MEAL_PLAN_LABELS[meal]} — {fmtPrice(price)}/person/night
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right — price + actions */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, flexShrink: 0 }}>
                    <div style={{ textAlign: "right" as const }}>
                      <div style={{ fontFamily: "inherit", fontSize: 22, fontWeight: 700, color: "#0C0C0C" }}>{fmtPrice(room.base_price)}</div>
                      <div style={{ fontSize: 11, color: "#9B9B9B" }}>per night (base)</div>
                      {room.weekend_price && <div style={{ fontSize: 12, color: "#6B7280" }}>Weekend: {fmtPrice(room.weekend_price)}</div>}
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      {/* Manage Rates → links to rates page (new frontend pattern, no modal) */}
                      <Link href={`/partner/rates?propertyId=${propertyId}&roomId=${room.id}`}
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 9999, border: "1.5px solid rgba(201,168,76,0.45)", background: "rgba(201,168,76,0.06)", fontSize: 12, cursor: "pointer", fontFamily: "inherit", color: "#7A5F18", fontWeight: 600, textDecoration: "none", transition: "background 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(201,168,76,0.12)"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(201,168,76,0.06)"}
                      >
                        📅 Manage Rates
                      </Link>

                      <button onClick={() => toggleActive(room)}
                        style={{ padding: "6px 14px", borderRadius: 9999, border: "1px solid #E5E5E5", background: "#fff", fontSize: 12, cursor: "pointer", fontFamily: "inherit", color: "#6B7280", transition: "border-color 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = "#0C0C0C"}
                        onMouseLeave={e => e.currentTarget.style.borderColor = "#E5E5E5"}
                      >
                        {room.is_active ? "Deactivate" : "Activate"}
                      </button>

                      <button onClick={() => { setEditRoom(room); setShowForm(false); }}
                        style={{ padding: "6px 14px", borderRadius: 9999, border: "1px solid #E5E5E5", background: "#fff", fontSize: 12, cursor: "pointer", fontFamily: "inherit", color: "#6B7280", transition: "border-color 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = "#0C0C0C"}
                        onMouseLeave={e => e.currentTarget.style.borderColor = "#E5E5E5"}
                      >
                        Edit
                      </button>

                      <button onClick={() => handleDelete(room.id)}
                        style={{ padding: "6px 14px", borderRadius: 9999, border: "1px solid #fecaca", background: "#fef2f2", fontSize: 12, cursor: "pointer", fontFamily: "inherit", color: "#dc2626", transition: "background 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#fee2e2"}
                        onMouseLeave={e => e.currentTarget.style.background = "#fef2f2"}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inline edit form — renders below the room being edited */}
              {editRoom?.id === room.id && (
                <div style={{ background: "#fff", border: "1.5px solid #C9A84C", borderRadius: "0 0 12px 12px", borderTop: "none", padding: "24px", marginTop: -1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <h3 style={{ fontFamily: "inherit", fontSize: 16, fontWeight: 700, color: "#0C0C0C" }}>Edit: {room.name}</h3>
                    <button onClick={() => setEditRoom(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#9B9B9B", lineHeight: 1 }}>✕</button>
                  </div>
                  <RoomForm initial={room} onSave={handleSave} onCancel={() => setEditRoom(null)} loading={saving} />
                </div>
              )}
            </div>
          ))}

          {/* Empty state */}
          {rooms.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 24px", background: "#fff", border: "1px solid #E5E5E5", borderRadius: 12 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🛏</div>
              <h3 style={{ fontFamily: "inherit", fontSize: 20, fontWeight: 600, color: "#0C0C0C", marginBottom: 8 }}>No room types yet</h3>
              <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 20 }}>Add at least one room type to start accepting bookings.</p>
              <button onClick={() => { setShowForm(true); setEditRoom(null); }}
                style={{ padding: "10px 22px", background: "#0C0C0C", color: "#fff", borderRadius: 9999, fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                Add Room Type
              </button>
            </div>
          )}
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes roomsShimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes roomsFadeIn  { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes roomsSpin    { to{transform:rotate(360deg)} }
      ` }} />
    </div>
  );
}