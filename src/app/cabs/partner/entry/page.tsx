"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Clock3, ShieldAlert } from "lucide-react";
import { useAuthOptional } from "@/contexts/auth-context";
import { getCabPartnerContext, type CabPartnerContext } from "@/lib/cab-partner-api";

export default function CabPartnerEntryPage() {
  const auth = useAuthOptional();
  const router = useRouter();
  const [context, setContext] = useState<CabPartnerContext | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = auth?.getAccessToken();
    if (!auth?.isLoading && !token) {
      window.location.assign("/login?redirect=%2Fcabs%2Fpartner%2Fentry");
      return;
    }
    if (!token) return;
    getCabPartnerContext(token)
      .then((next) => {
        setContext(next);
        if (next.application?.onboarding_status === "approved") {
          router.replace("/cabs/partner/dashboard");
        }
      })
      .catch((reason: unknown) =>
        setError(reason instanceof Error ? reason.message : "Could not load your cab partner account."),
      );
  }, [auth, router]);

  if (auth?.isLoading || (!context && !error)) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#fffaf7] text-sm font-semibold text-[#706772]">
        Checking your cab partner account…
      </main>
    );
  }
  if (error) {
    return (
      <Notice
        icon={<ShieldAlert className="h-12 w-12 text-[#ef6614]" />}
        title="We couldn’t load your cab partner status."
        detail={error}
        link="/cabs"
        action="Back to UNO Cabs"
      />
    );
  }
  if (!context?.is_cab_partner) {
    return (
      <Notice
        title="Become a UNO Cabs partner"
        detail="Create your application to list your cab business and start receiving verified trip requests after approval."
        link="/cabs/list-your-cab"
        action="Start application"
      />
    );
  }
  if (context.application?.onboarding_status === "approved") {
    return (
      <main className="grid min-h-screen place-items-center bg-[#fffaf7] text-sm font-semibold text-[#706772]">
        Opening your partner dashboard…
      </main>
    );
  }
  return (
    <Notice
      icon={<Clock3 className="h-12 w-12 text-[#ef6614]" />}
      title="Your application is being reviewed"
      detail="Our team will verify your details and documents. We’ll notify you once your account is approved."
      link="/cabs/list-your-cab"
      action="View application status"
    />
  );
}

function Notice({
  icon,
  title,
  detail,
  link,
  action,
}: {
  icon?: ReactNode;
  title: string;
  detail: string;
  link: string;
  action: string;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#fffaf7] p-6 text-center">
      <div className="max-w-lg rounded-3xl border border-orange-100 bg-white p-8 shadow-xl shadow-orange-100/30">
        {icon}
        <h1 className="mt-4 text-2xl font-black">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-[#706772]">{detail}</p>
        <Link href={link} className="mt-6 inline-flex rounded-xl bg-[#ef6614] px-4 py-2.5 text-sm font-bold text-white">
          {action}
        </Link>
      </div>
    </main>
  );
}
