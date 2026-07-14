"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Car, Check, PhoneCall, ShieldCheck, Sparkles, UsersRound, X } from "lucide-react";

import { cn } from "@/lib/utils";

type VehicleOption = Record<string, any>;

type Props = {
  open: boolean;
  options: VehicleOption[];
  selectedIndex: number;
  onClose: () => void;
  onSelect: (index: number) => void;
};

const fallbackImage = "/images/cabs/sedan-generated.png";
const fallbackNames = ["Sedan", "SUV", "Innova Crysta", "Ertiga"];
const fallbackFeatures = ["Comfortable", "Spacious", "Extra Comfort", "Value for Money"];

export function ChangeVehicleModal({ open, options, selectedIndex, onClose, onSelect }: Props) {
  const [draftIndex, setDraftIndex] = useState(selectedIndex);

  useEffect(() => {
    if (open) setDraftIndex(selectedIndex);
  }, [open, selectedIndex]);

  if (!open) return null;

  const vehicleOptions: VehicleOption[] = options.length ? options : fallbackNames.map((name, index) => ({ id: name, name, extra: index * 7000, seats: index ? 6 : 4, luggage: 3 }));

  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/45" role="dialog" aria-modal="true" aria-label="Change vehicle">
      <div className="absolute inset-y-0 right-0 flex w-full max-w-[620px] flex-col bg-white shadow-[-18px_0_45px_rgba(16,24,40,0.18)]">
        <header className="flex shrink-0 items-center gap-4 border-b border-slate-100 bg-white px-5 py-5 sm:px-7">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#FFF3EB] text-primary"><Car className="h-7 w-7" /></div>
          <div className="min-w-0 flex-1"><h2 className="text-xl font-extrabold tracking-tight text-[#172033]">Change Vehicle</h2><p className="mt-1 text-sm text-slate-500">Choose a vehicle that fits your comfort</p></div>
          <button type="button" onClick={onClose} aria-label="Close vehicle selector" className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-50 hover:text-[#172033]"><X className="h-6 w-6" /></button>
        </header>

        <div className="flex-1 overflow-y-auto bg-[#FBFCFE] px-5 py-5 sm:px-7">
          <div className="space-y-4">
            {vehicleOptions.map((vehicle, index) => {
              const selected = draftIndex === index;
              const extra = Number(vehicle.extra ?? index * 7000);
              const name = vehicle.name ?? fallbackNames[index] ?? "Private vehicle";
              const feature = vehicle.feature ?? fallbackFeatures[index] ?? "Comfortable";
              return (
                <button key={vehicle.id ?? `${name}-${index}`} type="button" onClick={() => setDraftIndex(index)} className={cn("block w-full rounded-2xl border bg-white p-4 text-left shadow-[0_3px_14px_rgba(16,24,40,0.07)] transition", selected ? "border-2 border-primary bg-[#FFFDFC]" : "border-slate-100 hover:border-[#FFB27A]")}>
                  <div className="flex items-center gap-4">
                    <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-[#F1F3F6] sm:h-28 sm:w-40"><Image src={vehicle.img ?? fallbackImage} alt={name} fill className="object-contain" sizes="160px" /></div>
                    <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><h3 className="text-base font-extrabold text-[#172033] sm:text-lg">{name}</h3><p className="mt-2 flex items-center gap-2 text-xs text-slate-500"><UsersRound className="h-4 w-4" />{vehicle.seats ?? (index ? 6 : 4)} Seater <span className="text-slate-300">·</span> <UsersRound className="h-4 w-4" />{vehicle.luggage ?? 3} Luggage</p></div><span className="shrink-0 text-sm font-bold text-slate-600">{extra ? `+₹${extra.toLocaleString("en-IN")}` : "Included"}</span></div><div className="mt-3 flex flex-wrap gap-2"><span className="rounded-full bg-[#F1F3F6] px-3 py-1 text-[11px] font-semibold text-slate-600">AC</span><span className="rounded-full bg-[#F1F3F6] px-3 py-1 text-[11px] font-semibold text-slate-600">{feature}</span></div></div><div className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full border-2", selected ? "border-primary bg-primary text-white" : "border-slate-200 bg-white")}>{selected && <Check className="h-4 w-4" />}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl border border-slate-100 bg-white p-3"><div className="flex items-center gap-2"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#FFF3EB] text-primary"><ShieldCheck className="h-4 w-4" /></span><span className="text-[10px] font-bold text-[#172033]">Professional Drivers<br /><small className="font-medium text-slate-500">Verified & experienced</small></span></div><div className="flex items-center gap-2"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#FFF3EB] text-primary"><Sparkles className="h-4 w-4" /></span><span className="text-[10px] font-bold text-[#172033]">Clean & Sanitized<br /><small className="font-medium text-slate-500">Regularly cleaned vehicles</small></span></div><div className="flex items-center gap-2"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#FFF3EB] text-primary"><PhoneCall className="h-4 w-4" /></span><span className="text-[10px] font-bold text-[#172033]">24/7 Support<br /><small className="font-medium text-slate-500">We’re always here to help</small></span></div></div>
        </div>

        <footer className="shrink-0 border-t border-slate-200 bg-white px-5 py-4 sm:px-7"><div className="flex gap-3"><button type="button" onClick={onClose} className="h-12 flex-1 rounded-xl border border-slate-300 bg-white text-sm font-bold text-[#172033]">Cancel</button><button type="button" onClick={() => { onSelect(draftIndex); onClose(); }} className="h-12 flex-[2] rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF8A2B] text-sm font-bold text-white shadow-[0_8px_20px_rgba(255,107,0,0.22)]">Update Vehicle</button></div><p className="mt-3 text-center text-xs text-slate-500">Price difference will be updated in your package summary</p></footer>
      </div>
    </div>
  );
}
