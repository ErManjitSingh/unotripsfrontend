"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CalendarCheck2,
  CarFront,
  Check,
  CheckCircle2,
  FileText,
  Headphones,
  LockKeyhole,
  Loader2,
  MapPin,
  ShieldCheck,
  Upload,
  UserRound,
} from "lucide-react";
import { searchCabLocations, type CabLocation } from "@/lib/cabs-location-api";
import { useAuthOptional } from "@/contexts/auth-context";
import {
  createCabPartnerApplication,
  draftApplicationToFormState,
  getCabPartnerContext,
  submitCabPartnerApplication,
  type CabPartnerContext,
  updateCabPartnerApplication,
  uploadCabPartnerDocument,
} from "@/lib/cab-partner-api";
import { trackEvent, trackOnce } from "@/lib/marketing-tracking";

type BusinessType = "agency" | "individual";
type PartnerAuth = NonNullable<ReturnType<typeof useAuthOptional>>;

const STEPS = [
  "You are",
  "Your details",
  "Documents",
  "Review",
];

function OnboardingStepper({
  activeStep,
  allComplete = false,
}: {
  /** 0-indexed current step. Steps before this are complete. */
  activeStep: number;
  /** When true, every step shows a completed check (e.g. approved). */
  allComplete?: boolean;
}) {
  return (
    <ol
      className="mx-auto grid max-w-4xl grid-cols-4 gap-2 sm:gap-5"
      aria-label="Partner onboarding progress"
    >
      {STEPS.map((label, index) => {
        const complete = allComplete || index < activeStep;
        const active = !allComplete && index === activeStep;
        const lineFilled = allComplete || index < activeStep;
        return (
          <li key={label} className="relative text-center">
            <div className="relative flex items-center justify-center">
              <span
                className={`relative z-10 grid h-8 w-8 place-items-center rounded-full text-xs font-extrabold sm:h-9 sm:w-9 sm:text-sm ${
                  complete
                    ? "bg-emerald-500 text-white"
                    : active
                      ? "bg-[#ef6614] text-white shadow-[0_8px_16px_-8px_rgba(239,102,20,0.9)]"
                      : "bg-slate-100 text-slate-500"
                }`}
              >
                {complete ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                ) : (
                  index + 1
                )}
              </span>
              {index < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`absolute left-[calc(50%+18px)] right-[calc(-50%+18px)] top-1/2 h-0.5 -translate-y-1/2 sm:left-[calc(50%+20px)] sm:right-[calc(-50%+20px)] ${
                    lineFilled ? "bg-emerald-400" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
            <p
              className={`mt-2 text-[9px] font-bold sm:text-[10px] ${
                active || allComplete ? "text-[#292229]" : "text-slate-500"
              }`}
            >
              {label}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

const INDIAN_STATES_AND_UTS = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const BENEFITS = [
  {
    icon: CalendarCheck2,
    title: "More bookings",
    detail: "Access a steady stream of verified trip requests.",
  },
  {
    icon: ShieldCheck,
    title: "Reliable payments",
    detail: "Get paid on time, with clear trip records.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Grow your business",
    detail: "Build your brand and expand your reach.",
  },
  {
    icon: Headphones,
    title: "24×7 partner support",
    detail: "We are here whenever you need help.",
  },
];

function OptionMark({ active }: { active: boolean }) {
  return (
    <span
      className={`grid h-6 w-6 place-items-center rounded-full border-2 transition ${active ? "border-[#ef6614] bg-[#ef6614] text-white" : "border-slate-300 bg-white text-transparent"}`}
    >
      <Check className="h-3.5 w-3.5" />
    </span>
  );
}

function PartnerAccountStart({
  auth,
  onReady,
}: {
  auth: PartnerAuth;
  onReady: (values: Record<string, string>) => void;
}) {
  const [mode, setMode] = useState<"register" | "login">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mode === "register") trackOnce("cab_partner_registration_started", "cab_partner_registration_started");
    setError("");
    const normalizedPhone = phone
      .replace(/\D/g, "")
      .replace(/^91(?=\d{10}$)/, "");
    if (mode === "register") {
      if (name.trim().length < 2) return setError("Enter your full name.");
      if (!/^\S+@\S+\.\S+$/.test(email.trim()))
        return setError("Enter a valid email address.");
      if (!/^\d{10}$/.test(normalizedPhone))
        return setError("Enter a valid 10-digit mobile number.");
      if (password.length < 8)
        return setError("Your password must be at least 8 characters.");
      if (password !== confirmPassword)
        return setError("Passwords do not match.");
    }
    setSaving(true);
    try {
      if (mode === "register") {
        await auth.register({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: normalizedPhone,
        });
        trackEvent("cab_partner_account_created", { registration_method: "email" });
        onReady({
          full_name: name.trim(),
          email_address: email.trim(),
          email_id: email.trim(),
          mobile_number: normalizedPhone,
        });
      } else {
        await auth.login(email.trim(), password);
      }
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "We could not continue with this account. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mx-auto mt-3 grid min-h-[calc(100dvh-64px)] max-w-[980px] overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_28px_70px_-42px_rgba(48,35,39,0.38)] lg:grid-cols-[0.9fr_1.1fr]">
      <div className="relative overflow-hidden bg-[linear-gradient(155deg,#251411_0%,#5c260f_50%,#ef6614_125%)] p-7 text-white sm:p-10">
        <div className="absolute -right-20 top-8 h-64 w-64 rounded-full bg-orange-300/20 blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em]">
            <CarFront className="h-4 w-4" /> UNO Cabs partner
          </span>
          <h1 className="mt-7 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
            Start with your partner account.
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/75">
            Your account saves every step securely, lets you resume anytime, and
            keeps your verification documents private.
          </p>
          <div className="mt-10 space-y-4">
            {[
              "Save and resume your application",
              "Upload documents securely",
              "Track your approval in one place",
            ].map((item) => (
              <p
                key={item}
                className="flex items-center gap-3 text-sm font-semibold"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-white/15">
                  <Check className="h-4 w-4 text-orange-200" />
                </span>
                {item}
              </p>
            ))}
          </div>
        </div>
      </div>
      <div className="p-7 sm:p-10">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#ef6614]">
          Step 1 · Account
        </p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-[#292229]">
          {mode === "register" ? "Create your account" : "Welcome back"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#6f6570]">
          {mode === "register"
            ? "Use the details you want linked to your cab partner profile."
            : "Sign in to continue your saved cab partner application."}
        </p>
        <form onSubmit={submit} className="mt-7 space-y-4" noValidate>
          {mode === "register" && (
            <>
              <label className="block text-xs font-extrabold text-[#403641]">
                Full name
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  className="mt-1.5 h-12 w-full rounded-xl border border-[#e5dfe1] px-3 text-sm font-medium outline-none transition focus:border-[#ef6614] focus:ring-4 focus:ring-orange-100"
                  placeholder="Enter your full name"
                />
              </label>
              <label className="block text-xs font-extrabold text-[#403641]">
                Mobile number
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  inputMode="numeric"
                  autoComplete="tel"
                  className="mt-1.5 h-12 w-full rounded-xl border border-[#e5dfe1] px-3 text-sm font-medium outline-none transition focus:border-[#ef6614] focus:ring-4 focus:ring-orange-100"
                  placeholder="10-digit mobile number"
                />
              </label>
            </>
          )}
          <label className="block text-xs font-extrabold text-[#403641]">
            Email address
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              autoComplete="email"
              className="mt-1.5 h-12 w-full rounded-xl border border-[#e5dfe1] px-3 text-sm font-medium outline-none transition focus:border-[#ef6614] focus:ring-4 focus:ring-orange-100"
              placeholder="name@example.com"
            />
          </label>
          <label className="block text-xs font-extrabold text-[#403641]">
            Password
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              autoComplete={
                mode === "register" ? "new-password" : "current-password"
              }
              className="mt-1.5 h-12 w-full rounded-xl border border-[#e5dfe1] px-3 text-sm font-medium outline-none transition focus:border-[#ef6614] focus:ring-4 focus:ring-orange-100"
              placeholder={
                mode === "register"
                  ? "Create at least 8 characters"
                  : "Enter your password"
              }
            />
          </label>
          {mode === "register" && (
            <label className="block text-xs font-extrabold text-[#403641]">
              Confirm password
              <input
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                type="password"
                autoComplete="new-password"
                className="mt-1.5 h-12 w-full rounded-xl border border-[#e5dfe1] px-3 text-sm font-medium outline-none transition focus:border-[#ef6614] focus:ring-4 focus:ring-orange-100"
                placeholder="Re-enter your password"
              />
            </label>
          )}
          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-700"
            >
              {error}
            </p>
          )}
          <button
            disabled={saving}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#ef6614] text-sm font-extrabold text-white shadow-[0_12px_22px_-12px_rgba(239,102,20,0.9)] transition hover:bg-[#d95511] disabled:cursor-not-allowed disabled:opacity-65"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving
              ? mode === "register"
                ? "Creating your account…"
                : "Signing you in…"
              : mode === "register"
                ? "Create account & continue"
                : "Sign in & continue"}
          </button>
        </form>
        <button
          type="button"
          onClick={() => {
            setMode((current) =>
              current === "register" ? "login" : "register",
            );
            setError("");
          }}
          className="mt-5 w-full text-center text-xs font-bold text-[#d95717]"
        >
          {mode === "register"
            ? "Already have an account? Sign in"
            : "New to UNO Cabs? Create an account"}
        </button>
      </div>
    </section>
  );
}

export function PartnerOnboarding() {
  const router = useRouter();
  const auth = useAuthOptional();
  const [step, setStep] = useState(0);
  const [businessType, setBusinessType] = useState<BusinessType>("agency");
  const [submitted, setSubmitted] = useState(false);
  const [actionError, setActionError] = useState("");
  const [stepSaving, setStepSaving] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const [uploadState, setUploadState] = useState<
    Record<string, "uploading" | "uploaded" | "error">
  >({});
  const [uploadedDocuments, setUploadedDocuments] = useState<
    Record<string, string>
  >({});
  const [basicValues, setBasicValues] = useState<Record<string, string>>({});
  const [detailValues, setDetailValues] = useState<Record<string, string>>({});
  const [existingPartner, setExistingPartner] =
    useState<CabPartnerContext | null>(null);
  const [partnerContextLoading, setPartnerContextLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [draftResumed, setDraftResumed] = useState(false);
  const [contextError, setContextError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const hydratedDraftRef = useRef(false);
  const accessToken = auth?.getAccessToken() ?? null;
  const authReady = !auth?.isLoading;

  useEffect(() => {
    if (!auth?.user || hydratedDraftRef.current) return;
    setBasicValues((current) => ({
      ...current,
      full_name: current.full_name || auth.user?.name || "",
      email_address: current.email_address || auth.user?.email || "",
      email_id: current.email_id || auth.user?.email || "",
      mobile_number: current.mobile_number || auth.user?.phone || "",
    }));
  }, [auth?.user]);

  useEffect(() => {
    if (!authReady) return;

    if (!accessToken) {
      setExistingPartner(null);
      setPartnerContextLoading(false);
      setContextError("");
      return;
    }

    let cancelled = false;
    setPartnerContextLoading(true);
    setContextError("");

    getCabPartnerContext(accessToken)
      .then((context) => {
        if (cancelled) return;
        setExistingPartner(context);
        const application = context.application;
        if (
          application?.onboarding_status === "draft" ||
          application?.onboarding_status === "rejected"
        ) {
          if (!hydratedDraftRef.current) {
            const restored = draftApplicationToFormState(application);
            setBusinessType(restored.businessType);
            setBasicValues(restored.basicValues);
            setDetailValues(restored.detailValues);
            setUploadedDocuments(restored.uploadedDocuments);
            setUploadState(restored.uploadState);
            setStep(restored.step);
            setDraftReady(true);
            setDraftResumed(true);
            hydratedDraftRef.current = true;
          } else {
            setDraftReady(true);
          }
        }
      })
      .catch((error) => {
        if (cancelled) return;
        setExistingPartner(null);
        setContextError(
          error instanceof Error
            ? error.message
            : "Could not load your saved application. You can still continue.",
        );
      })
      .finally(() => {
        if (!cancelled) setPartnerContextLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authReady, accessToken]);

  useEffect(() => {
    if (existingPartner?.application?.onboarding_status === "approved") {
      router.replace("/cabs/partner/dashboard");
    }
  }, [existingPartner?.application?.onboarding_status, router]);

  const valuesForDraft = () => {
    if (!formRef.current)
      throw new Error("Please complete your partner details first.");
    const values = new FormData(formRef.current);
    const value = (name: string) =>
      String(values.get(name) ?? basicValues[name] ?? "").trim();
    return {
      registration_type: businessType,
      owner_name:
        basicValues.full_name || auth?.user?.name || value("full_name"),
      business_name:
        businessType === "agency"
          ? value("business_agency_name") || undefined
          : undefined,
      primary_phone: (
        basicValues.mobile_number ||
        auth?.user?.phone ||
        value("mobile_number")
      ).replace(/\s/g, ""),
      email:
        basicValues.email_address ||
        auth?.user?.email ||
        value("email_id") ||
        value("email_address") ||
        undefined,
      city: value("city_town"),
      state: value("state"),
    };
  };

  const ensureDraft = async () => {
    if (draftReady) return;
    const token = auth?.getAccessToken();
    if (!token) throw new Error("Please sign in to securely upload documents.");
    const payload = valuesForDraft();
    if (
      !payload.owner_name ||
      !payload.primary_phone ||
      !payload.city ||
      !payload.state
    ) {
      throw new Error(
        "Please complete your name, phone, city and state before uploading documents.",
      );
    }
    await createCabPartnerApplication(token, payload);
    setDraftReady(true);
  };

  const saveDetails = async () => {
    const token = auth?.getAccessToken();
    if (!token) throw new Error("Create your partner account first.");
    if (!formRef.current)
      throw new Error("Please complete your partner details first.");
    const form = new FormData(formRef.current);
    const value = (name: string) =>
      String(form.get(name) ?? basicValues[name] ?? "").trim();
    const secretOrOmit = (name: string) => {
      const raw = value(name);
      if (!raw || raw === "Provided securely") return undefined;
      return raw;
    };
    const common = {
      owner_name: basicValues.full_name || auth?.user?.name || "",
      primary_phone: (
        basicValues.mobile_number ||
        auth?.user?.phone ||
        ""
      ).replace(/\s/g, ""),
      email: basicValues.email_address || auth?.user?.email || "",
      city: value("city_town"),
      state: value("state"),
      pincode: value("pincode"),
      address:
        businessType === "agency"
          ? value("business_address")
          : value("address"),
      ...(secretOrOmit("pan_number")
        ? { pan: secretOrOmit("pan_number") }
        : {}),
    };
    const payload =
      businessType === "agency"
        ? {
            ...common,
            business_name: value("business_agency_name"),
            gstin: value("gst_number") || null,
            business_registration_number:
              value("business_registration_number") || null,
            organization_type: value("type_of_organization") || null,
            years_in_business: value("years_in_business"),
            website: value("website") || null,
            preferred_working_areas: value("preferred_working_city_area")
              ? [value("preferred_working_city_area")]
              : [],
          }
        : {
            ...common,
            date_of_birth: value("date_of_birth"),
            gender: value("gender"),
            ...(secretOrOmit("aadhaar_number")
              ? { aadhaar_number: secretOrOmit("aadhaar_number") }
              : {}),
            ...(secretOrOmit("driving_license_number")
              ? {
                  driving_license_number: secretOrOmit(
                    "driving_license_number",
                  ),
                }
              : {}),
            years_driving_experience:
              value("years_of_driving_experience") || null,
          };
    await updateCabPartnerApplication(token, payload);
  };

  const next = async () => {
    setActionError("");
    if (step === 0 && formRef.current) {
      const values = Object.fromEntries(
        new FormData(formRef.current).entries(),
      ) as Record<string, string>;
      if (!values.terms) {
        setActionError(
          "Please accept the Terms & Conditions and Privacy Policy to continue.",
        );
        return;
      }
      setBasicValues((current) => ({ ...current, ...values }));
    }
    if (step === 1) {
      if (!formRef.current?.checkValidity()) {
        formRef.current?.reportValidity();
        setActionError("Complete the required fields before continuing.");
        return;
      }
      const values = Object.fromEntries(
        new FormData(formRef.current).entries(),
      ) as Record<string, string>;
      const validationError = validatePartnerDetails(businessType, values);
      if (validationError) {
        setActionError(validationError);
        return;
      }
      setDetailValues(values);
      if (!auth?.getAccessToken()) {
        setActionError(
          "Your session has expired. Please sign in again to continue your saved application.",
        );
        return;
      }
      setStepSaving(true);
      try {
        await ensureDraft();
        await saveDetails();
      } catch (error) {
        setActionError(
          error instanceof Error
            ? error.message
            : "Could not save your partner application.",
        );
        return;
      } finally {
        setStepSaving(false);
      }
    }
    if (step === STEPS.length - 1) {
      if (!confirmed) {
        setActionError(
          "Please confirm that your submitted information is correct.",
        );
        return;
      }
      const requiredDocuments =
        businessType === "agency"
          ? ["business_registration", "pan_card", "bank_proof", "address_proof"]
          : ["identity_proof", "bank_proof", "address_proof"];
      const missing = requiredDocuments.filter(
        (document) => !uploadedDocuments[document],
      );
      if (missing.length) {
        setActionError(
          "Upload all required documents before submitting your application.",
        );
        return;
      }
      setStepSaving(true);
      try {
        const token = auth?.getAccessToken();
        if (!token) throw new Error("Create your partner account first.");
        await submitCabPartnerApplication(token);
        trackEvent("cab_partner_application_submitted", { business_type: businessType });
        setSubmitted(true);
      } catch (error) {
        setActionError(
          error instanceof Error
            ? error.message
            : "Could not submit your application.",
        );
      } finally {
        setStepSaving(false);
      }
      return;
    }
    setStep((value) => value + 1);
  };

  const back = () => setStep((value) => Math.max(0, value - 1));

  const uploadFile = async (documentType: string, file: File) => {
    const token = auth?.getAccessToken();
    if (!token || !draftReady) {
      setActionError(
        "Your account session is required before documents can be uploaded. Please sign in again.",
      );
      return;
    }
    if (
      !/^(application\/pdf|image\/jpeg|image\/png)$/.test(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setUploadState((current) => ({ ...current, [documentType]: "error" }));
      setActionError("Upload a clear PDF, JPG, or PNG file smaller than 5 MB.");
      return;
    }
    setUploadState((current) => ({ ...current, [documentType]: "uploading" }));
    try {
      await uploadCabPartnerDocument(token, documentType, file);
      setUploadState((current) => ({ ...current, [documentType]: "uploaded" }));
      setUploadedDocuments((current) => ({
        ...current,
        [documentType]: file.name,
      }));
    } catch {
      setUploadState((current) => ({ ...current, [documentType]: "error" }));
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,#fff8ef_0%,transparent_30%),linear-gradient(135deg,#f7fafc_0%,#ffffff_45%,#fffaf5_100%)] px-3 py-3 text-[#272129] sm:px-5 sm:py-4">
      <header className="mx-auto flex h-10 max-w-[1800px] items-center justify-between px-1">
        <Link
          href="/cabs"
          className="leading-none"
          aria-label="Back to UNO Cabs"
        >
          <span className="text-xl font-black tracking-tight text-[#ef6614]">
            Uno<span className="text-[#192131]">Cabs</span>
          </span>
          <span className="mt-1 block text-[8px] font-semibold tracking-wide text-[#748092]">
            Your city. Your ride. Your price.
          </span>
        </Link>
        <a
          href="tel:+919876543210"
          className="flex items-center gap-2 text-right"
        >
          <Headphones className="h-4 w-4 text-[#ef6614]" />
          <span>
            <small className="block text-[9px] font-semibold text-[#7c8390]">
              24×7 Partner Support
            </small>
            <strong className="block text-[11px] text-[#283141]">
              +91 98765 43210
            </strong>
          </span>
        </a>
      </header>

      {partnerContextLoading ? (
        <div className="grid min-h-[calc(100dvh-64px)] place-items-center gap-3 text-center">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-orange-100 border-t-[#ef6614]" />
          <p className="text-sm font-semibold text-slate-600">
            Loading your saved partner application…
          </p>
        </div>
      ) : !auth ? (
        <div className="mx-auto mt-12 max-w-md rounded-2xl border border-red-200 bg-red-50 p-5 text-center text-sm font-semibold text-red-800">
          We could not start account sign-in. Please refresh the page and try
          again.
        </div>
      ) : !auth.isAuthenticated ? (
        <PartnerAccountStart
          auth={auth}
          onReady={(values) =>
            setBasicValues((current) => ({ ...current, ...values }))
          }
        />
      ) : existingPartner?.application &&
        !["draft", "rejected"].includes(
          existingPartner.application.onboarding_status,
        ) ? (
        <PartnerApplicationStatus application={existingPartner.application} />
      ) : (
        <section className="mx-auto mt-3 grid min-h-[calc(100dvh-64px)] max-w-[1800px] overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_28px_70px_-42px_rgba(48,35,39,0.38)] lg:grid-cols-[330px_1fr]">
          <aside className="relative overflow-hidden bg-[linear-gradient(160deg,#fffaf4_0%,#fff0df_54%,#f9e3cd_100%)] px-4 py-3 lg:block lg:px-5 lg:py-5">
            <div className="relative z-10 flex items-center gap-3 lg:hidden">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/85 text-[#ef6614] shadow-sm">
                <CarFront className="h-4.5 w-4.5" />
              </span>
              <span className="min-w-0 flex-1">
                <strong className="block text-sm font-extrabold text-[#2b2730]">Partner onboarding</strong>
                <small className="block truncate text-[11px] text-[#706772]">Your progress is saved automatically.</small>
              </span>
              <span className="rounded-full bg-white/75 px-2 py-1 text-[10px] font-extrabold text-[#d95717]">4 steps</span>
            </div>

            <div className="absolute inset-x-0 bottom-[162px] hidden h-40 bg-[linear-gradient(180deg,transparent,rgba(227,151,84,0.13))] lg:block" />
            <div className="pointer-events-none absolute -right-12 top-32 hidden h-56 w-56 rounded-full bg-orange-200/35 blur-3xl lg:block" />
            <div className="relative z-10 hidden lg:block">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#d95717]">
                <CarFront className="h-3.5 w-3.5" /> Partner with UnoCabs
              </span>
              <h1 className="mt-3 text-2xl font-black leading-tight tracking-tight text-[#1e2432] sm:text-[27px]">
                {submitted ? (
                  <>
                    Thank you for
                    <br />
                    partnering with
                    <br />
                    UnoCabs!
                  </>
                ) : (
                  <>
                    Grow your business
                    <br />
                    with UnoCabs.
                  </>
                )}
              </h1>
              <p className="mt-2 max-w-[250px] text-sm leading-5 text-[#4f5868]">
                {submitted
                  ? "We’re excited to have you on board. Get ready to grow your business with more bookings and happy customers."
                  : "Join thousands of verified partners who are earning more and building strong customer trust."}
              </p>
            </div>
            <div className="relative z-10 hidden h-[155px] overflow-hidden lg:mt-4 lg:block">
              <div
                aria-hidden="true"
                className="absolute inset-x-3 bottom-8 h-20 opacity-60"
              >
                <span className="absolute bottom-0 left-[4%] h-9 w-5 rounded-t bg-orange-200/60" />
                <span className="absolute bottom-0 left-[15%] h-16 w-7 rounded-t-sm bg-orange-200/60" />
                <span className="absolute bottom-0 left-[32%] h-12 w-6 rounded-t bg-orange-200/60" />
                <span className="absolute bottom-0 left-[48%] h-20 w-8 rounded-t-sm bg-orange-200/60" />
                <span className="absolute bottom-0 left-[68%] h-14 w-6 rounded-t bg-orange-200/60" />
                <span className="absolute bottom-0 left-[84%] h-[72px] w-7 rounded-t-sm bg-orange-200/60" />
              </div>
              <MapPin className="absolute left-1/2 top-2 z-20 h-8 w-8 -translate-x-1/2 fill-orange-300 text-orange-400 drop-shadow-sm sm:h-9 sm:w-9" />
              <div
                aria-hidden="true"
                className="absolute bottom-1 left-1/2 z-0 h-5 w-[82%] -translate-x-1/2 rounded-[50%] bg-orange-300/70 blur-[1px]"
              />
              <Image
                src="/images/cabs/uno-cabs-dzire-sidebar.png"
                alt="White UNO Cabs sedan"
                width={1693}
                height={929}
                priority
                className="absolute bottom-0 left-1/2 z-10 h-[98px] w-[108%] -translate-x-1/2 object-contain object-bottom sm:h-[120px]"
              />
            </div>
            <div className="relative z-10 hidden border-t border-orange-200/50 pt-4 lg:mt-4 lg:block lg:space-y-3">
              {BENEFITS.map(({ icon: Icon, title, detail }) => (
                <div key={title} className="flex gap-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/75 text-[#ef6614] shadow-sm">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>
                    <strong className="block text-xs font-extrabold text-[#35313a]">
                      {title}
                    </strong>
                    <small className="mt-0.5 block text-[11px] leading-4 text-[#59616e]">
                      {detail}
                    </small>
                  </span>
                </div>
              ))}
            </div>
            <div className="relative z-10 hidden rounded-xl border border-white/70 bg-white/55 p-2.5 text-center text-xs leading-5 text-[#645762] lg:mt-4 lg:block">
              <strong className="block text-[11px] not-italic text-[#4f4650]">
                Trusted by 1000+ Partners
              </strong>
              <span className="mt-0.5 block text-amber-500">★★★★★</span>
              <small className="block text-[10px] font-bold not-italic">
                4.8/5 Partner Rating
              </small>
            </div>
          </aside>

          <div className="px-5 py-5 sm:px-8 sm:py-6 lg:px-10">
            {contextError && (
              <div className="mx-auto mb-4 max-w-[1280px] rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {contextError}
              </div>
            )}
            {draftResumed &&
              existingPartner?.application?.onboarding_status ===
                "rejected" && (
                <div className="mx-auto mb-4 max-w-[1280px] rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
                  <strong className="font-extrabold">
                    Application needs changes.
                  </strong>{" "}
                  {existingPartner.application.review_notes
                    ? existingPartner.application.review_notes
                    : "Update your details or documents, then submit again for review."}
                </div>
              )}
            {draftResumed &&
              existingPartner?.application?.onboarding_status !==
                "rejected" && (
                <div className="mx-auto mb-4 max-w-[1280px] rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                  <strong className="font-extrabold">Draft restored.</strong> We
                  loaded your saved partner application. Continue from step{" "}
                  {step + 1} — your details are already filled in.
                </div>
              )}
            <OnboardingStepper activeStep={step} />

            {submitted ? (
              <SuccessScreen />
            ) : (
              <form ref={formRef} className="mx-auto mt-3 max-w-[1280px]">
                {step === 0 && (
                  <BusinessTypeStep
                    type={businessType}
                    onSelect={setBusinessType}
                    defaults={basicValues}
                  />
                )}
                {step === 1 && (
                  <BusinessDetailsStep
                    type={businessType}
                    defaults={detailValues}
                  />
                )}
                {step === 2 && (
                  <DocumentsStep
                    type={businessType}
                    uploadState={uploadState}
                    uploadedDocuments={uploadedDocuments}
                    onUpload={uploadFile}
                  />
                )}
                {step === 3 && (
                  <VerificationStep
                    type={businessType}
                    values={{ ...basicValues, ...detailValues }}
                    uploadedDocuments={uploadedDocuments}
                    confirmed={confirmed}
                    onConfirm={setConfirmed}
                    onEditDetails={() => setStep(1)}
                    onEditDocuments={() => setStep(2)}
                  />
                )}
                <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                  {step === 0 ? (
                    <Link
                      href="/cabs"
                      className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#ded7d4] px-4 text-xs font-extrabold text-[#4c414b] transition hover:border-[#ef6614]"
                    >
                      Back to UNO Cabs
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled={stepSaving}
                      onClick={back}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#ded7d4] px-4 text-xs font-extrabold text-[#4c414b] transition hover:border-[#ef6614] disabled:opacity-50"
                    >
                      <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={stepSaving}
                    onClick={next}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#ef6614] px-6 text-xs font-extrabold text-white shadow-[0_12px_22px_-12px_rgba(239,102,20,0.8)] transition hover:bg-[#d95511] disabled:cursor-not-allowed disabled:opacity-65"
                  >
                    {stepSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                    {stepSaving ? (
                      step === STEPS.length - 1 ? (
                        "Submitting application…"
                      ) : (
                        "Saving your details…"
                      )
                    ) : (
                      <>
                        {step === STEPS.length - 1
                          ? "Submit for verification"
                          : "Continue"}{" "}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
                <p className="mt-3 flex items-center justify-center gap-2 text-center text-[11px] text-[#7d737b]">
                  <LockKeyhole className="h-3.5 w-3.5" /> Your information is
                  safe and secure with us.
                </p>
                {actionError && (
                  <p
                    role="alert"
                    className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-center text-xs font-semibold text-red-700"
                  >
                    {actionError}
                  </p>
                )}
              </form>
            )}
          </div>
        </section>
      )}
    </main>
  );
}

function PartnerApplicationStatus({
  application,
}: {
  application: NonNullable<CabPartnerContext["application"]>;
}) {
  const preferredAreas = application.preferred_working_areas ?? [];
  const values = {
    business_agency_name: application.business_name || "—",
    full_name: application.owner_name,
    city_town: application.city,
    state: application.state,
    email_id: application.email || "—",
    mobile_number: application.primary_phone,
    business_address: application.address || "—",
    address: application.address || "—",
    gst_number: application.gstin || "—",
    business_registration_number:
      application.business_registration_number || "—",
    type_of_organization: application.organization_type || "—",
    pincode: application.pincode || "—",
    years_in_business: application.years_in_business || "—",
    website: application.website || "—",
    preferred_working_city_area: preferredAreas.join(", ") || "—",
    date_of_birth: application.date_of_birth || "—",
    gender: application.gender || "—",
    aadhaar_number: application.aadhaar_provided ? "Provided securely" : "—",
    pan_number: application.pan_provided ? "Provided securely" : "—",
    driving_license_number: application.driving_license_provided
      ? "Provided securely"
      : "—",
  };
  const documents = Object.fromEntries(
    (application.documents ?? []).map((document) => [
      document.document_type,
      document.file_name || document.document_type,
    ]),
  );
  const statusMessage =
    application.onboarding_status === "draft"
      ? "Your application is saved as a draft. Complete the remaining steps and submit it for review."
      : application.onboarding_status === "rejected"
        ? `Changes are needed before we can approve this application.${application.review_notes ? ` ${application.review_notes}` : ""}`
        : application.onboarding_status === "approved"
          ? "Your cab partner account is approved. Opening your dashboard…"
          : "Your application and uploaded documents are being reviewed.";
  const allComplete = application.onboarding_status === "approved";
  const activeStep =
    application.onboarding_status === "draft"
      ? Math.min(
          Math.max((application.onboarding_step ?? 1) - 1, 0),
          STEPS.length - 1,
        )
      : STEPS.length - 1;
  return (
    <section className="mx-auto mt-3 max-w-[1320px] rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_28px_70px_-42px_rgba(48,35,39,0.38)] sm:p-8">
      <OnboardingStepper activeStep={activeStep} allComplete={allComplete} />
      <div className="mt-6">
        <VerificationStep
          type={
            application.registration_type === "individual"
              ? "individual"
              : "agency"
          }
          values={values}
          uploadedDocuments={documents}
        />
      </div>
      <p
        className={`mt-4 rounded-xl px-4 py-3 text-center text-sm font-semibold ${
          application.onboarding_status === "rejected"
            ? "bg-red-50 text-red-800"
            : application.onboarding_status === "draft"
              ? "bg-slate-100 text-slate-700"
              : "bg-amber-50 text-amber-800"
        }`}
      >
        Application status: {application.onboarding_status.replace(/_/g, " ")}.{" "}
        {statusMessage}
      </p>
      {application.onboarding_status === "draft" ||
      application.onboarding_status === "rejected" ? (
        <div className="mt-4 text-center">
          <Link
            href="/cabs/list-your-cab"
            className="inline-flex rounded-lg bg-[#ef6614] px-4 py-2.5 text-xs font-extrabold text-white"
          >
            {application.onboarding_status === "rejected"
              ? "Edit and resubmit"
              : "Continue application"}
          </Link>
        </div>
      ) : null}
    </section>
  );
}

function BusinessTypeStep({
  type,
  onSelect,
  defaults = {},
}: {
  type: BusinessType;
  onSelect: (type: BusinessType) => void;
  defaults?: Record<string, string>;
}) {
  const choices = [
    {
      value: "agency" as const,
      title: "Taxi agency / company",
      description: "I represent a registered taxi agency or transport company.",
      benefits: [
        "Manage multiple vehicles & drivers",
        "Receive corporate & bulk trip requests",
        "Grow your business with UNO Cabs",
      ],
      icon: BriefcaseBusiness,
    },
    {
      value: "individual" as const,
      title: "Individual taxi operator",
      description: "I am an individual taxi driver or vehicle owner.",
      benefits: [
        "Operate independently",
        "Get direct customer trip requests",
        "Flexible & simple onboarding",
      ],
      icon: UserRound,
    },
  ];
  return (
    <>
      <div>
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#ef6614]">
          Step 1 of 4
        </p>
        <h2 className="mt-1 text-xl font-black tracking-tight sm:text-2xl">
          Who are you registering as?
        </h2>
        <p className="mt-1 text-xs text-[#6f6570] sm:text-sm">
          Pick one — cab agency/fleet, or individual owner-driver.
        </p>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-2.5 text-xs text-emerald-950">
        <span className="flex items-center gap-1.5 font-extrabold">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Account ready
        </span>
        <span>{defaults.full_name}</span>
        <span>{defaults.mobile_number}</span>
        <span className="max-w-full truncate">{defaults.email_address}</span>
      </div>
      <fieldset className="mt-4">
        <legend className="text-xs font-extrabold sm:text-sm">
          I am registering as <span className="text-[#ef6614]">*</span>
        </legend>
        <div className="mt-2 grid gap-3 md:grid-cols-2">
          {choices.map(({ value, title, description, icon: Icon }) => {
            const active = value === type;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onSelect(value)}
                className={`relative min-h-[128px] rounded-xl border p-3 text-left transition sm:p-4 ${active ? "border-[#ef6614] bg-[#fffaf6] shadow-[0_14px_26px_-24px_rgba(239,102,20,0.85)]" : "border-slate-200 bg-white hover:border-orange-200"}`}
              >
                <span className="absolute left-3 top-3">
                  <OptionMark active={active} />
                </span>
                <span
                  className={`mx-auto grid h-9 w-9 place-items-center rounded-xl ${active ? "bg-orange-100 text-[#ef6614]" : "bg-slate-100 text-slate-500"}`}
                >
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <h3 className="mt-2 text-center text-xs font-black sm:text-sm">
                  {title}
                </h3>
                <p className="mx-auto mt-1 max-w-[210px] text-center text-[10px] leading-4 text-[#6d6370] sm:text-[11px]">
                  {description}
                </p>
              </button>
            );
          })}
        </div>
      </fieldset>
      <div className="mt-3 rounded-lg border border-orange-100 bg-[#fff8f2] px-3 py-2 text-[10px] leading-4 text-[#6d6370] sm:text-[11px]">
        <span className="mr-2 inline-grid h-4 w-4 place-items-center rounded-full border border-[#ef6614] text-[10px] font-bold text-[#ef6614]">
          i
        </span>{" "}
        You can add more vehicles and operating cities after approval.
      </div>
      <label className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-[#68606a]">
        <input
          name="terms"
          type="checkbox"
          defaultChecked={Boolean(defaults.terms)}
          className="mt-0.5 h-4 w-4 accent-[#ef6614]"
        />
        I agree to the{" "}
        <a href="#terms" className="font-bold text-[#ef6614]">
          Terms &amp; Conditions
        </a>{" "}
        and{" "}
        <a href="#privacy" className="font-bold text-[#ef6614]">
          Privacy Policy
        </a>
        .
      </label>
    </>
  );
}

function fieldName(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function validatePartnerDetails(
  type: BusinessType,
  values: Record<string, string>,
): string | null {
  const value = (name: string) => values[name]?.trim() || "";
  const required =
    type === "agency"
      ? [
          ["business_agency_name", "business / agency name"],
          ["type_of_organization", "organization type"],
          ["pan_number", "PAN number"],
          ["business_address", "business address"],
          ["city_town", "city / town"],
          ["state", "state"],
          ["pincode", "pincode"],
          ["years_in_business", "years in business"],
        ]
      : [
          ["date_of_birth", "date of birth"],
          ["gender", "gender"],
          ["aadhaar_number", "Aadhaar number"],
          ["address", "address"],
          ["city_town", "city / town"],
          ["state", "state"],
          ["pincode", "pincode"],
        ];
  const missing = required.find(([name]) => !value(name));
  if (missing) return `Enter your ${missing[1]} to continue.`;
  if (!/^\d{6}$/.test(value("pincode")))
    return "Enter a valid 6-digit pincode.";
  const pan = value("pan_number").replace(/\s/g, "").toUpperCase();
  if (pan && !/^[A-Z]{5}\d{4}[A-Z]$/.test(pan))
    return "Enter a valid PAN number (for example, ABCDE1234F).";
  if (
    type === "individual" &&
    !/^\d{12}$/.test(value("aadhaar_number").replace(/\s/g, ""))
  )
    return "Enter a valid 12-digit Aadhaar number.";
  const gst = value("gst_number").replace(/\s/g, "").toUpperCase();
  if (gst && !/^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d][Z][A-Z\d]$/.test(gst))
    return "Enter a valid GST number or leave it blank.";
  return null;
}

function CabLocationField({
  label,
  placeholder,
  optional = false,
  compact = false,
  defaultValue = "",
}: {
  label: string;
  placeholder: string;
  optional?: boolean;
  compact?: boolean;
  defaultValue?: string;
}) {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<CabLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    if (query.trim().length < 3) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    let active = true;
    const timer = window.setTimeout(() => {
      setLoading(true);
      searchCabLocations(query)
        .then((places) => {
          if (active) setSuggestions(places);
        })
        .catch(() => {
          if (active) setSuggestions([]);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 300);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query]);

  const fieldHeight = compact ? "h-9" : "h-10";
  const textSize = compact ? "text-[10px] sm:text-[11px]" : "text-xs";
  return (
    <label
      className={`relative block ${compact ? "text-[10px] sm:text-[11px]" : "text-[11px]"} font-extrabold text-[#403641]`}
    >
      {label} {!optional && <span className="text-[#ef6614]">*</span>}
      {optional && (
        <span className="font-medium text-[#8b8189]">(Optional)</span>
      )}
      <span
        className={`mt-1 ${fieldHeight} flex items-center overflow-hidden rounded-lg border border-[#e5dfe1] bg-white focus-within:border-[#ef6614] focus-within:ring-2 focus-within:ring-orange-100`}
      >
        <MapPin className="ml-2.5 h-3.5 w-3.5 shrink-0 text-[#ef6614]" />
        <input
          required={!optional}
          name={fieldName(label)}
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          placeholder={placeholder}
          autoComplete="off"
          className={`min-w-0 flex-1 bg-transparent px-2.5 ${textSize} font-medium outline-none placeholder:font-normal placeholder:text-[#aba1a9]`}
        />
        {loading && (
          <span className="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-orange-100 border-t-[#ef6614]" />
        )}
      </span>
      {open && query.trim().length >= 3 && (
        <ul className="absolute inset-x-0 top-[calc(100%+5px)] z-40 max-h-56 overflow-y-auto rounded-xl border border-orange-100 bg-white py-1 shadow-[0_18px_36px_-18px_rgba(64,34,19,0.35)]">
          {suggestions.map((place) => (
            <li key={place.place_id}>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setQuery(place.label);
                  setSuggestions([]);
                  setOpen(false);
                }}
                className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-orange-50"
              >
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#ef6614]" />
                <span>
                  <strong className="block text-[11px] text-[#403842]">
                    {place.locality || place.label.split(",")[0]}
                  </strong>
                  <small className="mt-0.5 block text-[10px] text-[#766d74]">
                    {[place.district, place.state, place.country]
                      .filter(Boolean)
                      .join(", ") || place.label}
                  </small>
                </span>
              </button>
            </li>
          ))}
          {!loading && suggestions.length === 0 && (
            <li className="px-3 py-2 text-[10px] font-medium text-[#766d74]">
              No matching location found. Keep typing to search another town or
              city.
            </li>
          )}
        </ul>
      )}
    </label>
  );
}

function BusinessDetailsStep({
  type,
  defaults = {},
}: {
  type: BusinessType;
  defaults?: Record<string, string>;
}) {
  const isAgency = type === "agency";
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_28px_-26px_rgba(36,30,38,0.4)] sm:p-5">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#ef6614]">
          Step 2 of 4
        </p>
        <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
          {isAgency
            ? "Tell us about your business."
            : "Tell us about yourself."}
        </h2>
        <p className="mt-1 text-sm text-[#6f6570]">
          Fill only what&apos;s asked. You can fix mistakes later if we ask.
        </p>
      </div>
      {isAgency ? (
        <OrganisationFields defaults={defaults} />
      ) : (
        <IndividualFields defaults={defaults} />
      )}
    </section>
  );
}

function OrganisationFields({
  defaults = {},
}: {
  defaults?: Record<string, string>;
}) {
  return (
    <div className="mt-4 space-y-3">
      <div className="grid gap-3 lg:grid-cols-3">
        <OnboardingInput
          label="Business / agency name"
          placeholder="Enter business name"
          defaultValue={defaults.business_agency_name}
        />
        <OnboardingInput
          label="Business registration number"
          optional
          placeholder="Enter registration number"
          defaultValue={defaults.business_registration_number}
        />
        <OnboardingSelect
          label="Type of organization"
          placeholder="Select type"
          options={[
            "Proprietorship",
            "Partnership",
            "Private limited company",
            "LLP",
          ]}
          defaultValue={defaults.type_of_organization}
        />
        <OnboardingInput
          label="GST number"
          optional
          placeholder="Enter GST number"
          defaultValue={defaults.gst_number}
        />
        <OnboardingInput
          label="PAN number"
          placeholder="Enter PAN number"
          defaultValue={
            defaults.pan_number === "Provided securely"
              ? ""
              : defaults.pan_number
          }
        />
      </div>
      <OnboardingTextarea
        label="Business address"
        placeholder="Enter complete business address"
        defaultValue={defaults.business_address}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <CabLocationField
          label="City / town"
          placeholder="Search city or town"
          defaultValue={defaults.city_town}
        />
        <OnboardingSelect
          label="State"
          placeholder="Select state"
          options={INDIAN_STATES_AND_UTS}
          defaultValue={defaults.state}
        />
        <OnboardingInput
          label="Pincode"
          placeholder="Enter pincode"
          defaultValue={defaults.pincode}
        />
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        <OnboardingSelect
          label="Years in business"
          placeholder="Select experience"
          options={["Less than 1 year", "1–3 years", "3–5 years", "5+ years"]}
          defaultValue={defaults.years_in_business}
        />
        <OnboardingInput
          label="Website"
          optional
          placeholder="Enter website (if any)"
          defaultValue={defaults.website}
        />
      </div>
      <CabLocationField
        label="Preferred working city / area"
        placeholder="Search a city, town or operating area"
        defaultValue={defaults.preferred_working_city_area}
      />
      <p className="text-[10px] text-[#827881]">
        You can add multiple cities later from your partner dashboard.
      </p>
    </div>
  );
}

function IndividualFields({
  defaults = {},
}: {
  defaults?: Record<string, string>;
}) {
  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center gap-3 rounded-xl bg-[#fff8f2] px-3 py-2.5 text-sm text-[#665a63]">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-orange-100 text-[#ef6614]">
          <UserRound className="h-4 w-4" />
        </span>
        <span>
          <strong className="block text-xs text-[#362d36]">
            Personal contact details are already saved.
          </strong>
          <small className="block text-[11px]">
            Add only the information needed to verify your driving profile.
          </small>
        </span>
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        <OnboardingInput
          label="Date of birth"
          type="date"
          placeholder="DD / MM / YYYY"
          defaultValue={defaults.date_of_birth}
        />
        <OnboardingSelect
          label="Gender"
          placeholder="Select gender"
          options={["Female", "Male", "Non-binary", "Prefer not to say"]}
          defaultValue={defaults.gender}
        />
        <OnboardingInput
          label="Aadhaar number"
          placeholder="Enter 12-digit Aadhaar number"
          defaultValue={
            defaults.aadhaar_number === "Provided securely"
              ? ""
              : defaults.aadhaar_number
          }
        />
        <OnboardingInput
          label="PAN number"
          optional
          placeholder="Enter PAN number"
          defaultValue={
            defaults.pan_number === "Provided securely"
              ? ""
              : defaults.pan_number
          }
        />
      </div>
      <OnboardingTextarea
        label="Address"
        placeholder="Enter your complete address"
        defaultValue={defaults.address}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <CabLocationField
          label="City / town"
          placeholder="Search city or town"
          defaultValue={defaults.city_town}
        />
        <OnboardingSelect
          label="State"
          placeholder="Select state"
          options={INDIAN_STATES_AND_UTS}
          defaultValue={defaults.state}
        />
        <OnboardingInput
          label="Pincode"
          placeholder="Enter 6-digit pincode"
          defaultValue={defaults.pincode}
        />
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        <OnboardingInput
          label="Driving license number"
          optional
          placeholder="Enter driving license number"
          defaultValue={
            defaults.driving_license_number === "Provided securely"
              ? ""
              : defaults.driving_license_number
          }
        />
        <OnboardingSelect
          label="Years of driving experience"
          optional
          placeholder="Select experience"
          options={["Less than 1 year", "1–3 years", "3–5 years", "5+ years"]}
          defaultValue={defaults.years_of_driving_experience}
        />
      </div>
    </div>
  );
}

function OnboardingInput({
  label,
  placeholder,
  optional,
  prefix,
  type = "text",
  defaultValue = "",
}: {
  label: string;
  placeholder: string;
  optional?: boolean;
  prefix?: string;
  type?: string;
  defaultValue?: string;
}) {
  return (
    <label className="block text-[11px] font-extrabold text-[#403641]">
      {label} {!optional && <span className="text-[#ef6614]">*</span>}
      {optional && (
        <span className="font-medium text-[#8b8189]">(Optional)</span>
      )}
      <span className="mt-1.5 flex h-10 items-center overflow-hidden rounded-lg border border-[#e5dfe1] bg-white focus-within:border-[#ef6614] focus-within:ring-2 focus-within:ring-orange-100">
        {prefix && (
          <span className="border-r border-[#eee8e5] px-2.5 text-[11px] text-[#605762]">
            {prefix}
          </span>
        )}
        <input
          required={!optional}
          type={type}
          name={fieldName(label)}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent px-3 text-xs font-medium outline-none placeholder:font-normal placeholder:text-[#aba1a9]"
        />
      </span>
    </label>
  );
}

function OnboardingSelect({
  label,
  placeholder,
  options,
  optional,
  defaultValue = "",
}: {
  label: string;
  placeholder: string;
  options: string[];
  optional?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="block text-[11px] font-extrabold text-[#403641]">
      {label} {!optional && <span className="text-[#ef6614]">*</span>}
      {optional && (
        <span className="font-medium text-[#8b8189]">(Optional)</span>
      )}
      <select
        required={!optional}
        name={fieldName(label)}
        defaultValue={defaultValue || ""}
        className="mt-1.5 h-10 w-full rounded-lg border border-[#e5dfe1] bg-white px-3 text-xs font-medium text-[#746a73] outline-none focus:border-[#ef6614] focus:ring-2 focus:ring-orange-100"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function OnboardingTextarea({
  label,
  placeholder,
  defaultValue = "",
}: {
  label: string;
  placeholder: string;
  defaultValue?: string;
}) {
  return (
    <label className="block text-[11px] font-extrabold text-[#403641]">
      {label} <span className="text-[#ef6614]">*</span>
      <textarea
        required
        name={fieldName(label)}
        rows={2}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-1.5 w-full resize-none rounded-lg border border-[#e5dfe1] px-3 py-2.5 text-xs font-medium outline-none placeholder:font-normal placeholder:text-[#aba1a9] focus:border-[#ef6614] focus:ring-2 focus:ring-orange-100"
      />
    </label>
  );
}

function DocumentsStep({
  type,
  uploadState,
  uploadedDocuments = {},
  onUpload,
}: {
  type: BusinessType;
  uploadState: Record<string, "uploading" | "uploaded" | "error">;
  uploadedDocuments?: Record<string, string>;
  onUpload: (documentType: string, file: File) => Promise<void>;
}) {
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});
  const businessDocs =
    type === "agency"
      ? [
          { title: "Business registration certificate", required: true },
          { title: "GST certificate", required: false },
          { title: "PAN card", required: true },
          { title: "Cancelled cheque / bank proof", required: true },
        ]
      : [
          { title: "Aadhaar card", required: true },
          { title: "Driving licence", required: false },
          { title: "PAN card", required: false },
          { title: "Cancelled cheque / bank proof", required: true },
        ];
  const otherDocs =
    type === "agency"
      ? [
          { title: "Address proof", required: true },
          { title: "ID proof (Aadhaar / driving licence)", required: false },
          { title: "Vehicle RC (if available)", required: false },
        ]
      : [
          { title: "Address proof", required: true },
          { title: "Vehicle RC", required: false },
          { title: "Vehicle insurance (if available)", required: false },
        ];
  const chooseFile = async (documentType: string, file: File) => {
    setSelectedFiles((current) => ({ ...current, [documentType]: file }));
    await onUpload(documentType, file);
  };
  const fileLabel = (documentType: string) =>
    selectedFiles[documentType]?.name || uploadedDocuments[documentType];
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_28px_-26px_rgba(36,30,38,0.4)] sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#ef6614]">
            Step 3 of 4
          </p>
          <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
            Upload your papers.
          </h2>
          <p className="mt-1 text-sm text-[#6f6570]">
            Clear photos of documents are fine. Required ones are marked — optional can wait.
          </p>
        </div>
        <div className="flex max-w-xs items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs leading-5 text-[#566478]">
          <ShieldCheck className="h-5 w-5 shrink-0 text-blue-600" />
          <span>
            <strong className="block text-[#35445a]">
              Your data is safe with us
            </strong>
            Private files are uploaded after secure sign-in.
          </span>
        </div>
      </div>
      <DocumentGroup
        title={type === "agency" ? "Business documents" : "Personal documents"}
        icon={BriefcaseBusiness}
        docs={businessDocs}
        columns="lg:grid-cols-4"
        fileLabel={fileLabel}
        onChooseFile={chooseFile}
        uploadState={uploadState}
      />
      <DocumentGroup
        title="Other documents"
        icon={FileText}
        docs={otherDocs}
        columns="lg:grid-cols-3"
        fileLabel={fileLabel}
        onChooseFile={chooseFile}
        uploadState={uploadState}
      />
      <div className="mt-4 rounded-xl border border-orange-100 bg-[#fff8f2] px-4 py-3 text-xs leading-5 text-[#655962]">
        <strong className="flex items-center gap-2 text-[#403641]">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-orange-100 text-[#ef6614]">
            !
          </span>{" "}
          Note:
        </strong>
        <ul className="mt-1 list-disc pl-8">
          <li>
            Documents upload privately after secure sign-in and draft creation.
          </li>
          <li>Ensure all documents are valid and clearly visible.</li>
        </ul>
      </div>
    </section>
  );
}

function DocumentGroup({
  title,
  icon: Icon,
  docs,
  columns,
  fileLabel,
  onChooseFile,
  uploadState,
}: {
  title: string;
  icon: typeof FileText;
  docs: { title: string; required: boolean }[];
  columns: string;
  fileLabel: (documentType: string) => string | undefined;
  onChooseFile: (documentType: string, file: File) => void;
  uploadState: Record<string, "uploading" | "uploaded" | "error">;
}) {
  return (
    <section className="mt-5">
      <h3 className="flex items-center gap-2 text-sm font-extrabold">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-orange-50 text-[#ef6614]">
          <Icon className="h-4 w-4" />
        </span>
        {title}
      </h3>
      <div className={`mt-3 grid gap-3 ${columns}`}>
        {docs.map((doc) => (
          <DocumentUploadCard
            key={doc.title}
            {...doc}
            fileName={fileLabel(documentTypeFor(doc.title))}
            status={uploadState[documentTypeFor(doc.title)]}
            onChooseFile={(file) =>
              onChooseFile(documentTypeFor(doc.title), file)
            }
          />
        ))}
      </div>
    </section>
  );
}

function documentTypeFor(title: string): string {
  const normalized = title.toLowerCase();
  if (normalized.includes("registration")) return "business_registration";
  if (normalized.includes("gst")) return "gst_certificate";
  if (normalized.includes("pan")) return "pan_card";
  if (normalized.includes("cheque") || normalized.includes("bank"))
    return "bank_proof";
  if (normalized.includes("vehicle rc")) return "vehicle_rc";
  if (normalized.includes("insurance")) return "vehicle_insurance";
  if (
    normalized.includes("driving licence") ||
    normalized.includes("driving license")
  )
    return "driving_license";
  if (normalized.includes("address")) return "address_proof";
  if (
    normalized.includes("aadhaar") ||
    normalized.includes("id proof") ||
    normalized.includes("identity")
  )
    return "identity_proof";
  return "identity_proof";
}

function DocumentUploadCard({
  title,
  required,
  fileName,
  status,
  onChooseFile,
}: {
  title: string;
  required: boolean;
  fileName?: string;
  status?: "uploading" | "uploaded" | "error";
  onChooseFile: (file: File) => void;
}) {
  const inputId = `upload-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <article className="rounded-xl border border-[#e5e0e2] bg-white p-3">
      <div className="flex min-h-9 items-start justify-between gap-2">
        <span>
          <h4 className="text-[11px] font-extrabold leading-4 text-[#403641]">
            {title}
          </h4>
          <p
            className={`mt-1 text-[10px] font-bold ${required ? "text-red-500" : "text-[#8a8189]"}`}
          >
            {required ? "Required" : "Optional"}
          </p>
        </span>
        <span className="grid h-4 w-4 place-items-center rounded-full border border-slate-300 text-[9px] font-bold text-slate-500">
          i
        </span>
      </div>
      <input
        id={inputId}
        type="file"
        accept="application/pdf,image/jpeg,image/png"
        onChange={(event) => {
          const selected = event.target.files?.[0];
          if (selected) onChooseFile(selected);
        }}
        className="sr-only"
      />
      <label
        htmlFor={inputId}
        className={`mt-3 grid h-16 cursor-pointer place-items-center rounded-lg border border-dashed transition ${status === "uploaded" ? "border-emerald-300 bg-emerald-50 text-emerald-600" : "border-[#d9dfe8] bg-[#fbfcff] text-[#ef6614] hover:border-[#ef6614] hover:bg-orange-50"}`}
      >
        {status === "uploading" ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-orange-200 border-t-[#ef6614]" />
        ) : status === "uploaded" ? (
          <Check className="h-6 w-6" />
        ) : (
          <Upload className="h-6 w-6" />
        )}
      </label>
      <p className="mt-2 truncate text-center text-[9px] font-semibold text-[#6f6874]">
        {status === "uploading"
          ? "Uploading…"
          : status === "uploaded"
            ? `Uploaded: ${fileName || "file"}`
            : status === "error"
              ? "Upload failed — choose again"
              : "PDF, JPG, PNG (Max 5MB)"}
      </p>
    </article>
  );
}

function VerificationStep({
  type,
  values,
  uploadedDocuments,
  confirmed,
  onConfirm,
  onEditDetails,
  onEditDocuments,
}: {
  type: BusinessType;
  values: Record<string, string>;
  uploadedDocuments: Record<string, string>;
  confirmed?: boolean;
  onConfirm?: (value: boolean) => void;
  onEditDetails?: () => void;
  onEditDocuments?: () => void;
}) {
  const field = (name: string) => values[name]?.trim() || "—";
  const summary =
    type === "agency"
      ? [
          ["Registration type", "Taxi agency / company"],
          ["Business / agency name", field("business_agency_name")],
          ["Registration number", field("business_registration_number")],
          ["Type of organization", field("type_of_organization")],
          ["GST number", field("gst_number")],
          ["PAN number", field("pan_number")],
          ["Business address", field("business_address")],
          ["City", field("city_town")],
          ["State", field("state")],
          ["Years in business", field("years_in_business")],
          ["Preferred cities", field("preferred_working_city_area")],
        ]
      : [
          ["Registration type", "Individual taxi operator"],
          ["Full name", field("full_name")],
          ["Mobile number", field("mobile_number")],
          ["Email ID", field("email_id")],
          ["Aadhaar number", field("aadhaar_number")],
          ["PAN number", field("pan_number")],
          ["Address", field("address")],
          ["City", field("city_town")],
          ["State", field("state")],
          ["Driving experience", field("years_of_driving_experience")],
        ];
  const labels: Record<string, string> = {
    business_registration: "Business registration certificate",
    gst_certificate: "GST certificate",
    pan_card: "PAN card",
    bank_proof: "Cancelled cheque / bank proof",
    address_proof: "Address proof",
    identity_proof:
      type === "agency"
        ? "ID proof (Aadhaar / driving licence)"
        : "Aadhaar card",
    vehicle_rc: "Vehicle RC",
    driving_license: "Driving licence",
    vehicle_insurance: "Vehicle insurance",
  };
  const documents = Object.entries(uploadedDocuments);
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_28px_-26px_rgba(36,30,38,0.4)] sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#ef6614]">
            Step 4 of 4
          </p>
          <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
            Review &amp; verify.
          </h2>
          <p className="mt-1 text-sm text-[#6f6570]">
            Please review your details before we verify your account.
          </p>
        </div>
        <div className="flex max-w-xs items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-2 text-xs leading-5 text-[#53665b]">
          <LockKeyhole className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>
            <strong className="block text-[#355340]">
              Your information is secure
            </strong>
            We use bank-level encryption to protect your data.
          </span>
        </div>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1.05fr]">
        <ReviewCard
          title="Business summary"
          icon={BriefcaseBusiness}
          onEdit={onEditDetails}
        >
          <dl className="mt-4 grid grid-cols-[0.9fr_1.1fr] gap-x-4 gap-y-2 text-[11px] leading-4 sm:text-xs">
            {summary.map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="font-semibold text-[#716772]">{label}</dt>
                <dd className="font-bold text-[#3e3640]">{value}</dd>
              </div>
            ))}
          </dl>
        </ReviewCard>
        <ReviewCard
          title="Uploaded documents"
          icon={FileText}
          onEdit={onEditDocuments}
        >
          {documents.length ? (
            <ul className="mt-3 divide-y divide-slate-100">
              {documents.map(([type, fileName]) => (
                <li
                  key={type}
                  className="flex items-center justify-between gap-3 py-2 text-[11px] sm:text-xs"
                >
                  <span>
                    <strong className="block font-semibold text-[#514751]">
                      {labels[type] ?? type}
                    </strong>
                    <small className="text-slate-500">{fileName}</small>
                  </span>
                  <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold text-amber-700">
                    Uploaded
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-xs text-slate-500">
              No documents uploaded yet.
            </p>
          )}
        </ReviewCard>
      </div>
      <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-950">
        <strong className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-blue-600">
            i
          </span>{" "}
          What happens next?
        </strong>
        <p className="mt-1 pl-8">
          After submission, our team will verify your details and documents. You
          will receive an email/SMS once your account is approved.
        </p>
      </div>
      {onConfirm && (
        <label className="mt-4 flex items-center gap-2 text-xs font-medium text-[#605761]">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(event) => onConfirm(event.target.checked)}
            className="h-4 w-4 accent-[#ef6614]"
          />
          I confirm that all the information provided is true and correct.
        </label>
      )}
    </section>
  );
}

function ReviewCard({
  title,
  icon: Icon,
  children,
  onEdit,
}: {
  title: string;
  icon: typeof FileText;
  children: ReactNode;
  onEdit?: () => void;
}) {
  return (
    <article className="rounded-xl border border-[#e6e1e3] p-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-extrabold">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-orange-50 text-[#ef6614]">
            <Icon className="h-4 w-4" />
          </span>
          {title}
        </h3>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="text-xs font-bold text-[#ef6614]"
          >
            Edit
          </button>
        )}
      </div>
      {children}
    </article>
  );
}

function SuccessScreen() {
  return (
    <section className="mx-auto max-w-5xl py-8 text-center sm:py-12">
      <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-500 text-white shadow-[0_0_0_12px_rgba(34,197,94,0.1),0_0_0_24px_rgba(34,197,94,0.06)]">
        <Check className="h-11 w-11" />
      </span>
      <h2 className="mt-8 text-3xl font-black tracking-tight sm:text-4xl">
        Application sent for review
      </h2>
      <p className="mt-2 text-sm text-[#6e6570] sm:text-base">
        Our team will check your details. You&apos;ll get an email when you&apos;re approved.
      </p>
      <ol className="mx-auto mt-7 max-w-lg space-y-3 text-left text-sm text-[#466151]">
        {[
          "We verify your documents (usually 1–2 working days).",
          "After approval, add your cars and set pricing.",
          "Then open Trip requests and start sending quotes.",
        ].map((item, index) => (
          <li key={item} className="flex gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-100 text-xs font-black text-emerald-700">
              {index + 1}
            </span>
            <span className="pt-0.5 font-semibold">{item}</span>
          </li>
        ))}
      </ol>
      <div className="mx-auto mt-6 flex max-w-3xl flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between">
        <Link
          href="/cabs/list-your-cab"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#d8d1d5] px-5 text-sm font-extrabold text-[#413842]"
        >
          View application status
        </Link>
        <Link
          href="/cabs"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#ef6614] px-5 text-sm font-extrabold text-white shadow-[0_12px_22px_-12px_rgba(239,102,20,0.8)]"
        >
          Return to UNO Cabs <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <p className="mt-5 text-xs text-[#726974]">
        Need help? Email{" "}
        <a href="mailto:partners@unocabs.com" className="font-bold text-[#ef6614]">
          partners@unocabs.com
        </a>
      </p>
    </section>
  );
}
