"use client";

export interface StepConfig {
  key:         string;
  label:       string;
  description: string;
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconSave = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/>
    <polyline points="7 3 7 8 15 8"/>
  </svg>
);

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  steps:       StepConfig[];
  current:     number;
  children:    React.ReactNode;
  onBack:      () => void;
  onNext:      () => void;
  onSubmit:    () => void;
  onSaveDraft: () => void;
  canNext:     boolean;
  saving:      boolean;
  savingDraft: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function WizardShell({
  steps, current, children,
  onBack, onNext, onSubmit, onSaveDraft,
  canNext, saving, savingDraft,
}: Props) {
  const isFirst = current === 0;
  const isLast  = current === steps.length - 1;

  return (
    <div style={{
      background:   "#fff",
      border:       "1px solid #E5E5E5",
      borderRadius: 16,
      overflow:     "hidden",
    }}>

      {/* ── Progress stepper ────────────────────────────────────────── */}
      <div className="wizard-stepper-wrap">

        {/* DESKTOP stepper — visible ≥ 700px, unchanged from original */}
        <div className="wizard-stepper-desktop">
          <div style={{
            display: "flex", alignItems: "flex-start",
            marginBottom: 24, overflowX: "auto",
          }}>
            {steps.map((s, i) => {
              const done    = i < current;
              const active  = i === current;
              const isLastS = i === steps.length - 1;

              return (
                <div
                  key={s.key}
                  style={{ display: "flex", alignItems: "center", flex: isLastS ? "none" : 1, minWidth: 0 }}
                >
                  {/* Circle + label */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 700, transition: "all 0.2s",
                      background: done   ? "#0C0C0C"
                                : active ? "#C9A84C"
                                : "#F4F1EB",
                      color: done || active ? "#fff" : "#9B9B9B",
                    }}>
                      {done ? <IconCheck /> : i + 1}
                    </div>
                    <div style={{
                      fontSize: 10, fontWeight: 600, marginTop: 6,
                      whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.06em",
                      color: active ? "#0C0C0C" : done ? "#6B7280" : "#9B9B9B",
                    }}>
                      {s.label}
                    </div>
                  </div>

                  {/* Connector line */}
                  {!isLastS && (
                    <div style={{
                      flex: 1, height: 2,
                      marginBottom: 18, marginLeft: 4, marginRight: 4,
                      background: done ? "#0C0C0C" : "#E5E5E5",
                      transition: "background 0.3s",
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* MOBILE stepper — visible < 700px */}
        <div className="wizard-stepper-mobile">
          {/* Compact dot row */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
            {steps.map((s, i) => {
              const done    = i < current;
              const active  = i === current;
              const isLastS = i === steps.length - 1;

              return (
                <div key={s.key} style={{ display: "flex", alignItems: "center", flex: isLastS ? "none" : 1 }}>
                  {/* Dot */}
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700,
                    background: done   ? "#0C0C0C"
                              : active ? "#C9A84C"
                              : "#F4F1EB",
                    color: done || active ? "#fff" : "#9B9B9B",
                    transition: "all 0.2s",
                  }}>
                    {done ? <IconCheck /> : i + 1}
                  </div>

                  {/* Connector */}
                  {!isLastS && (
                    <div style={{
                      flex: 1, height: 2, marginLeft: 2, marginRight: 2,
                      background: done ? "#0C0C0C" : "#E5E5E5",
                      transition: "background 0.3s",
                    }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Current step label below dots */}
          <div style={{
            fontSize: 11, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.08em",
            color: "#C9A84C", marginBottom: 4,
          }}>
            Step {current + 1} of {steps.length}
          </div>
          <div style={{
            fontSize: 13, fontWeight: 600,
            color: "#0C0C0C", marginBottom: 16,
          }}>
            {steps[current].label}
          </div>
        </div>
      </div>

      {/* ── Step header (desktop only — mobile shows label inside stepper) ── */}
      <div className="wizard-step-header">
        <h2 style={{
          fontFamily: "inherit", fontSize: 20,
          fontWeight: 700, color: "#0C0C0C", marginBottom: 4,
        }}>
          {steps[current].label}
        </h2>
        <p style={{ fontSize: 13, color: "#9B9B9B", marginBottom: 24 }}>
          {steps[current].description}
        </p>
      </div>

      {/* ── Step description shown on mobile below the stepper ─────── */}
      <div className="wizard-step-desc-mobile">
        <p style={{ fontSize: 12, color: "#9B9B9B", marginBottom: 20, lineHeight: 1.5 }}>
          {steps[current].description}
        </p>
      </div>

      {/* ── Step content ────────────────────────────────────────────── */}
      <div className="wizard-content">
        {children}
      </div>

      {/* ── Navigation footer ───────────────────────────────────────── */}
      <div className="wizard-footer">

        {/* Left — Back + Save Draft */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            onClick={onBack}
            className="wizard-btn-back"
            style={{ visibility: isFirst ? "hidden" : "visible" }}
          >
            ← Back
          </button>

          <button
            type="button"
            onClick={onSaveDraft}
            disabled={savingDraft}
            className="wizard-btn-draft"
          >
            <IconSave />
            <span className="wizard-draft-label">
              {savingDraft ? "Saving..." : "Save as Draft"}
            </span>
          </button>
        </div>

        {/* Right — counter + Continue/Submit */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="wizard-step-counter">
            Step {current + 1} of {steps.length}
          </span>

          {isLast ? (
            <button
              type="button"
              onClick={onSubmit}
              disabled={!canNext || saving}
              className="wizard-btn-primary"
              style={{
                background: (!canNext || saving) ? "#E5E5E5" : "linear-gradient(135deg, #C9A84C 0%, #b8943e 100%)",
                color:      (!canNext || saving) ? "#9B9B9B" : "#fff",
                cursor:     (!canNext || saving) ? "not-allowed" : "pointer",
                boxShadow:  (!canNext || saving) ? "none" : "0 2px 12px rgba(201,168,76,0.3)",
              }}
            >
              {saving && (
                <span style={{
                  width: 14, height: 14,
                  border: "2px solid rgba(255,255,255,0.4)",
                  borderTopColor: "#fff", borderRadius: "50%",
                  animation: "wizSpin 0.7s linear infinite",
                  display: "inline-block",
                }} />
              )}
              <span className="wizard-submit-label">
                {saving ? "Submitting..." : "Submit for Review"}
              </span>
              {!saving && <span className="wizard-submit-arrow"> →</span>}
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              disabled={!canNext}
              className="wizard-btn-primary"
              style={{
                background: !canNext ? "#E5E5E5" : "linear-gradient(135deg, #C9A84C 0%, #b8943e 100%)",
                color:      !canNext ? "#9B9B9B" : "#fff",
                cursor:     !canNext ? "not-allowed" : "pointer",
                boxShadow:  !canNext ? "none" : "0 2px 12px rgba(201,168,76,0.3)",
              }}
            >
              <span className="wizard-continue-label">Continue</span>
              <span> →</span>
            </button>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes wizSpin { to { transform: rotate(360deg) } }

        /* ── Stepper wrapper padding ── */
        .wizard-stepper-wrap {
          padding: 28px 32px 0;
          border-bottom: 1px solid #E5E5E5;
        }

        /* ── Desktop: show full stepper with labels, hide mobile ── */
        .wizard-stepper-desktop  { display: block; }
        .wizard-stepper-mobile   { display: none;  }
        .wizard-step-header      { display: block; padding: 24px 32px 0; }
        .wizard-step-desc-mobile { display: none;  padding: 0 16px; }
        .wizard-content          { padding: 0 32px; }
        .wizard-step-counter     { font-size: 12px; color: #9B9B9B; }

        /* ── Footer ── */
        .wizard-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 32px;
          margin-top: 24px;
          border-top: 1px solid #E5E5E5;
          background: #F9F7F2;
          gap: 10px;
        }

        /* ── Back button ── */
        .wizard-btn-back {
          padding: 9px 18px; border-radius: 10px;
          border: 1.5px solid #E5E5E5;
          background: #fff; cursor: pointer;
          font-size: 13px; font-weight: 500;
          color: #6B7280; font-family: inherit;
          transition: all 0.15s; white-space: nowrap;
        }
        .wizard-btn-back:hover { border-color: #0C0C0C; color: #0C0C0C; }

        /* ── Save Draft button ── */
        .wizard-btn-draft {
          display: flex; align-items: center; gap: 6px;
          padding: 9px 14px; border-radius: 10px;
          border: 1.5px solid #E5E5E5;
          background: #fff; cursor: pointer;
          font-size: 13px; font-weight: 500;
          color: #6B7280; font-family: inherit;
          transition: all 0.2s; white-space: nowrap;
        }
        .wizard-btn-draft:hover { border-color: #0C0C0C; color: #0C0C0C; }
        .wizard-btn-draft:disabled { cursor: not-allowed; color: #9B9B9B; }

        /* ── Primary action button ── */
        .wizard-btn-primary {
          display: flex; align-items: center; gap: 6px;
          padding: 10px 22px; border-radius: 9999px;
          border: none; font-size: 14px; font-weight: 600;
          font-family: inherit; transition: all 0.2s;
          white-space: nowrap;
        }
        .wizard-btn-primary:hover { opacity: 0.9; }

        /* ── Mobile ── */
        @media (max-width: 699px) {
          /* Stepper */
          .wizard-stepper-wrap    { padding: 16px 14px 0; }
          .wizard-stepper-desktop { display: none;  }
          .wizard-stepper-mobile  { display: block; }

          /* Header — hide on mobile (shown inside stepper) */
          .wizard-step-header      { display: none; }
          .wizard-step-desc-mobile { display: block; }

          /* Content padding */
          .wizard-content { padding: 0 14px; }

          /* Footer */
          .wizard-footer {
            padding: 14px 14px 20px;
            margin-top: 16px;
            flex-wrap: nowrap;
            gap: 8px;
          }

          /* Hide step counter in footer on mobile (shown in stepper) */
          .wizard-step-counter { display: none; }

          /* Smaller back button on mobile */
          .wizard-btn-back {
            padding: 9px 12px;
            font-size: 12px;
          }

          /* Hide "Save as Draft" text on mobile, show icon only */
          .wizard-draft-label { display: none; }
          .wizard-btn-draft { padding: 9px 10px; }

          /* Smaller primary button */
          .wizard-btn-primary {
            padding: 10px 16px;
            font-size: 13px;
          }

          /* Shorten label on mobile */
          .wizard-submit-label { display: none; }
          .wizard-submit-arrow { display: inline; }
          .wizard-continue-label { font-size: 13px; }
        }
      `}} />
    </div>
  );
}