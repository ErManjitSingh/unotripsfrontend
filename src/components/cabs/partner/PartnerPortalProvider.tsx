"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileCheck2 } from "lucide-react";
import { useAuthOptional } from "@/contexts/auth-context";
import { getCabPartnerContext, type CabPartnerApplication, type CabPartnerContext } from "@/lib/cab-partner-api";
import {
  getPartnerAcceptedQuoteRequests,
  getPartnerQuoteRequests,
  getPartnerRecentlyClosedQuoteRequests,
  type CabTripRequest,
} from "@/lib/cab-quote-api";
import { PartnerShell } from "@/components/cabs/partner/PartnerShell";

type PartnerPortalValue = {
  context: CabPartnerContext;
  application: CabPartnerApplication;
  requests: CabTripRequest[];
  selectedByTravellerRequests: CabTripRequest[];
  recentlyClosedRequests: CabTripRequest[];
  setRequests: Dispatch<SetStateAction<CabTripRequest[]>>;
  quotesError: string;
  refreshQuotes: () => Promise<void>;
};

const PartnerPortalContext = createContext<PartnerPortalValue | null>(null);

export function usePartnerPortal() {
  const value = useContext(PartnerPortalContext);
  if (!value) throw new Error("usePartnerPortal must be used inside PartnerPortalProvider.");
  return value;
}

export function PartnerPortalProvider({ children }: { children: ReactNode }) {
  const auth = useAuthOptional();
  const router = useRouter();
  const [context, setContext] = useState<CabPartnerContext | null>(null);
  const [requests, setRequests] = useState<CabTripRequest[]>([]);
  const [selectedByTravellerRequests, setSelectedByTravellerRequests] = useState<CabTripRequest[]>([]);
  const [recentlyClosedRequests, setRecentlyClosedRequests] = useState<CabTripRequest[]>([]);
  const [quotesError, setQuotesError] = useState("");
  const [contextError, setContextError] = useState("");
  const [loading, setLoading] = useState(true);

  const accessToken = auth?.getAccessToken() ?? null;
  const authReady = !auth?.isLoading;

  useEffect(() => {
    if (!authReady) return;
    if (!accessToken) {
      const redirect = encodeURIComponent(
        typeof window !== "undefined" ? window.location.pathname : "/cabs/partner/dashboard",
      );
      window.location.assign(`/login?redirect=${redirect}`);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setContextError("");
    getCabPartnerContext(accessToken)
      .then((next) => {
        if (!cancelled) setContext(next);
      })
      .catch((reason) => {
        if (!cancelled) {
          setContext(null);
          setContextError(reason instanceof Error ? reason.message : "Could not load partner status.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authReady, accessToken]);

  const approved = context?.application?.onboarding_status === "approved";

  const refreshQuotes = useCallback(async () => {
    if (!accessToken || !approved) return;
    try {
      const [openResult, acceptedResult, historyResult] = await Promise.allSettled([
        getPartnerQuoteRequests(accessToken),
        getPartnerAcceptedQuoteRequests(accessToken),
        getPartnerRecentlyClosedQuoteRequests(accessToken),
      ]);
      if (openResult.status === "rejected") throw openResult.reason;
      setRequests(openResult.value);
      // Keep the open inbox working even if an older backend has not exposed
      // the accepted-offers endpoint yet.
      setSelectedByTravellerRequests(acceptedResult.status === "fulfilled" ? acceptedResult.value : []);
      setRecentlyClosedRequests(historyResult.status === "fulfilled" ? historyResult.value : []);
      setQuotesError("");
    } catch (reason) {
      setQuotesError(reason instanceof Error ? reason.message : "Could not load quote requests.");
    }
  }, [accessToken, approved]);

  useEffect(() => {
    if (!accessToken || !approved) return;
    void refreshQuotes();
    const interval = window.setInterval(() => {
      void refreshQuotes();
    }, 45_000);
    return () => window.clearInterval(interval);
  }, [accessToken, approved, refreshQuotes]);

  const value = useMemo<PartnerPortalValue | null>(() => {
    if (!context?.application) return null;
    return {
      context,
      application: context.application,
      requests,
      selectedByTravellerRequests,
      recentlyClosedRequests,
      setRequests,
      quotesError,
      refreshQuotes,
    };
  }, [context, requests, selectedByTravellerRequests, recentlyClosedRequests, quotesError, refreshQuotes]);

  if (!authReady || loading) {
    return (
      <PartnerShell
        application={{
          id: "",
          registration_type: "agency",
          onboarding_status: "approved",
          onboarding_step: 1,
          owner_name: "Partner",
          business_name: "Partner",
          primary_phone: "",
          email: null,
          city: "",
          state: "",
          address: null,
          gstin: null,
          business_registration_number: null,
          organization_type: null,
          pincode: null,
          years_in_business: null,
          website: null,
          preferred_working_areas: [],
          date_of_birth: null,
          gender: null,
          aadhaar_provided: false,
          driving_license_provided: false,
          pan_provided: false,
          review_notes: null,
          documents: [],
        }}
        pendingQuotes={0}
        onLogout={() => {
          auth?.logout();
          router.push("/cabs");
        }}
      >
        <div className="grid min-h-40 place-items-center">
          <span className="h-7 w-7 animate-spin rounded-full border-4 border-orange-100 border-t-[#ef6614]" />
        </div>
      </PartnerShell>
    );
  }

  if (contextError) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#fffaf7] p-5">
        <section className="max-w-md rounded-3xl border border-orange-100 bg-white p-7 text-center shadow-xl shadow-orange-100/30">
          <FileCheck2 className="mx-auto h-10 w-10 text-[#ef6614]" />
          <h1 className="mt-4 text-2xl font-black">Couldn’t load your partner account</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">{contextError}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex rounded-xl bg-[#ef6614] px-4 py-3 text-sm font-bold text-white"
          >
            Try again
          </button>
        </section>
      </main>
    );
  }

  if (!context?.is_cab_partner || !context.application) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#fffaf7] p-5">
        <section className="max-w-md rounded-3xl border border-orange-100 bg-white p-7 text-center shadow-xl shadow-orange-100/30">
          <FileCheck2 className="mx-auto h-10 w-10 text-[#ef6614]" />
          <h1 className="mt-4 text-2xl font-black">No cab partner application found</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            This login isn’t linked to a cab partner application. Start onboarding or sign in with the account you used to apply.
          </p>
          <Link
            href="/cabs/list-your-cab"
            className="mt-6 inline-flex rounded-xl bg-[#ef6614] px-4 py-3 text-sm font-bold text-white"
          >
            Start / continue application
          </Link>
        </section>
      </main>
    );
  }

  if (context.application.onboarding_status !== "approved") {
    const status = context.application.onboarding_status.replaceAll("_", " ");
    return (
      <main className="grid min-h-screen place-items-center bg-[#fffaf7] p-5">
        <section className="max-w-md rounded-3xl border border-orange-100 bg-white p-7 text-center shadow-xl shadow-orange-100/30">
          <FileCheck2 className="mx-auto h-10 w-10 text-[#ef6614]" />
          <h1 className="mt-4 text-2xl font-black">Your account is still being verified</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Your partner portal opens after admin approval. Current status:{" "}
            <strong className="capitalize text-[#192131]">{status}</strong>.
          </p>
          <Link
            href="/cabs/list-your-cab"
            className="mt-6 inline-flex rounded-xl bg-[#ef6614] px-4 py-3 text-sm font-bold text-white"
          >
            View application status
          </Link>
        </section>
      </main>
    );
  }

  if (!value) {
    return (
      <PartnerShell
        application={context.application}
        pendingQuotes={0}
        onLogout={() => {
          auth?.logout();
          router.push("/cabs");
        }}
      >
        <div className="grid min-h-40 place-items-center">
          <span className="h-7 w-7 animate-spin rounded-full border-4 border-orange-100 border-t-[#ef6614]" />
        </div>
      </PartnerShell>
    );
  }

  const needsReplyCount = requests.filter((r) => !(r.quotes && r.quotes.length > 0)).length;

  return (
    <PartnerPortalContext.Provider value={value}>
      <PartnerShell
        application={value.application}
        pendingQuotes={needsReplyCount}
        onLogout={() => {
          auth?.logout();
          router.push("/cabs");
        }}
      >
        {children}
      </PartnerShell>
    </PartnerPortalContext.Provider>
  );
}
