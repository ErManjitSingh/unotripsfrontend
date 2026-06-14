"use client";

import PropertyWizard from "@/components/partner/wizard/PropertyWizard";

export default function NewPropertyPage() {
  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontFamily: "inherit", fontSize: 28,
          fontWeight: 700, color: "#0C0C0C",
          letterSpacing: "-0.02em", marginBottom: 6,
        }}>
          List a New Property
        </h1>
        <p style={{ fontSize: 14, color: "#6B7280" }}>
          Complete all steps to submit your property for review. Approval takes 24–48 hours.
        </p>
      </div>
      <PropertyWizard />
    </div>
  );
}