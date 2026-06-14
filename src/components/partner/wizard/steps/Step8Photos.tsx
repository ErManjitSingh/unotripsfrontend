"use client";

import { useState } from "react";
import { Upload, X, Check, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PropertyWizardData, WizardAgreements } from "../shared/types";
import { useAuth } from "@/contexts/auth-context";

const MIN_PHOTOS = 3;
const MAX_PHOTOS = 10;

const REQUIRED_CATEGORIES = [
  { key: "exterior", label: "Exterior" },
  { key: "rooms",    label: "Rooms"    },
  { key: "lobby",    label: "Lobby"    },
];

const OPTIONAL_CATEGORIES = [
  { key: "pool",     label: "Pool"       },
  { key: "spa",      label: "Spa"        },
  { key: "gym",      label: "Gym"        },
  { key: "dining",   label: "Dining"     },
  { key: "garden",   label: "Garden"     },
  { key: "rooftop",  label: "Rooftop"    },
];

const AGREEMENTS_CONFIG = [
  { key: "terms_accepted" as const,        label: "I agree to the UNO Trips Partner Terms & Conditions" },
  { key: "cancellation_accepted" as const, label: "I understand and accept the Cancellation & Refund Policy" },
  { key: "payment_accepted" as const,      label: "I accept the Payment & Commission terms (15% platform fee)" },
  { key: "legal_accepted" as const,        label: "I confirm all information is accurate and I am authorised to list this property" },
];

interface Props {
  data: PropertyWizardData;
  setField: <K extends keyof PropertyWizardData>(key: K, val: PropertyWizardData[K]) => void;
  pendingUploads: number;
  onPendingChange: React.Dispatch<React.SetStateAction<number>>;
}

export default function Step8Photos({ data, setField, pendingUploads, onPendingChange }: Props) {
  const { getAccessToken } = useAuth();
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  function getCategoryImages(categoryKey: string): string[] {
    return data.photo_categories.find(c => c.category === categoryKey)?.images ?? [];
  }

  function setCategoryImages(categoryKey: string, images: string[]) {
    const updated = [...data.photo_categories];
    const idx = updated.findIndex(c => c.category === categoryKey);
    if (idx >= 0) updated[idx] = { ...updated[idx], images };
    else updated.push({ category: categoryKey, label: categoryKey, images });
    setField("photo_categories", updated);
  }

  async function handleUpload(categoryKey: string, files: FileList) {
    const token = getAccessToken();
    if (!token) return;

    const newPending = files.length;
    onPendingChange((p: number) => p + newPending);
    setUploading(u => ({ ...u, [categoryKey]: true }));

    const uploaded: string[] = [];

    for (const file of Array.from(files)) {
      try {
        const form = new FormData();
        form.append("file", file);
        form.append("category", categoryKey);
        // Use /api/partner proxy — avoids CORS, works from unotrips.com
        const res = await fetch("/api/partner/v1/partner/photos/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        });
        if (res.ok) {
          const json = await res.json();
          uploaded.push(json?.data?.url ?? json?.url);
        }
      } catch { /* skip failed */ }
    }

    const current = getCategoryImages(categoryKey);
    setCategoryImages(categoryKey, [...current, ...uploaded].slice(0, MAX_PHOTOS));
    onPendingChange((p: number) => Math.max(0, p - newPending));
    setUploading(u => ({ ...u, [categoryKey]: false }));
  }

  function removeImage(categoryKey: string, url: string) {
    setCategoryImages(categoryKey, getCategoryImages(categoryKey).filter(u => u !== url));
  }

  function toggleAgreement(key: keyof WizardAgreements) {
    setField("agreements", { ...data.agreements, [key]: !data.agreements[key] });
  }

  const allAgreed = Object.values(data.agreements).every(Boolean);

  return (
    <div className="space-y-6">
      {/* Required categories */}
      <div>
        <p className="mb-3 text-sm font-semibold text-slate-800">Required Photos <span className="text-red-500">*</span></p>
        <p className="mb-4 text-xs text-slate-400">Minimum {MIN_PHOTOS} photos per category</p>
        <div className="space-y-4">
          {REQUIRED_CATEGORIES.map(cat => {
            const images = getCategoryImages(cat.key);
            const done = images.length >= MIN_PHOTOS;
            return (
              <PhotoCategoryBlock
                key={cat.key} catKey={cat.key} label={cat.label}
                images={images} required done={done}
                isUploading={uploading[cat.key]}
                onUpload={files => handleUpload(cat.key, files)}
                onRemove={url => removeImage(cat.key, url)}
              />
            );
          })}
        </div>
      </div>

      {/* Optional categories */}
      <div>
        <p className="mb-3 text-sm font-semibold text-slate-800">Optional Photos</p>
        <div className="space-y-4">
          {OPTIONAL_CATEGORIES.map(cat => {
            const images = getCategoryImages(cat.key);
            return (
              <PhotoCategoryBlock
                key={cat.key} catKey={cat.key} label={cat.label}
                images={images} required={false} done={images.length > 0}
                isUploading={uploading[cat.key]}
                onUpload={files => handleUpload(cat.key, files)}
                onRemove={url => removeImage(cat.key, url)}
              />
            );
          })}
        </div>
      </div>

      {pendingUploads > 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          ⏳ {pendingUploads} photo{pendingUploads > 1 ? "s" : ""} uploading — please wait before submitting.
        </div>
      )}

      {/* Agreements */}
      <div className="space-y-3 border-t border-slate-100 pt-4">
        <p className="text-sm font-semibold text-slate-800">Partner Agreements <span className="text-red-500">*</span></p>
        {AGREEMENTS_CONFIG.map(({ key, label }) => (
          <label key={key} className="flex cursor-pointer items-start gap-3">
            <div className={cn(
              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
              data.agreements[key] ? "border-primary bg-primary" : "border-slate-300 bg-white"
            )}>
              {data.agreements[key] && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
              <input type="checkbox" className="sr-only" checked={data.agreements[key]} onChange={() => toggleAgreement(key)} />
            </div>
            <span className="text-sm text-slate-700">{label}</span>
          </label>
        ))}
        {!allAgreed && (
          <p className="text-xs text-amber-600">Please accept all agreements to submit your listing.</p>
        )}
      </div>
    </div>
  );
}

function PhotoCategoryBlock({ catKey, label, images, required, done, isUploading, onUpload, onRemove }: {
  catKey: string; label: string; images: string[]; required: boolean; done: boolean;
  isUploading?: boolean; onUpload: (f: FileList) => void; onRemove: (url: string) => void;
}) {
  return (
    <div className={cn("overflow-hidden rounded-xl border-2 transition-colors", done ? "border-green-300" : "border-slate-200")}>
      <div className={cn("flex items-center justify-between px-4 py-3", done ? "bg-green-50" : "bg-slate-50")}>
        <div className="flex items-center gap-2.5">
          <Camera className="h-4 w-4 text-slate-500" />
          <p className="text-sm font-semibold text-slate-800">{label}</p>
          {required && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">Required</span>}
        </div>
        <span className={cn("text-xs font-semibold", done ? "text-green-700" : "text-slate-400")}>
          {images.length}/{MAX_PHOTOS} {done ? "✓" : `(min ${MIN_PHOTOS})`}
        </span>
      </div>
      <div className="p-4">
        {images.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {images.map(url => (
              <div key={url} className="group relative h-20 w-20 overflow-hidden rounded-lg border border-slate-200">
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  onClick={() => onRemove(url)}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
        {images.length < MAX_PHOTOS && (
          <label className={cn(
            "flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed px-4 py-3 text-sm font-medium transition-colors",
            isUploading ? "cursor-not-allowed opacity-50" : "border-slate-300 text-slate-500 hover:border-primary hover:text-primary"
          )}>
            <Upload className="h-4 w-4" />
            {isUploading ? "Uploading…" : `Upload ${label} Photos`}
            <input
              type="file" multiple accept="image/*" className="sr-only"
              disabled={isUploading}
              onChange={e => e.target.files && onUpload(e.target.files)}
            />
          </label>
        )}
      </div>
    </div>
  );
}