import { FAQ_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function FaqSection({ className }: { className?: string }) {
  return (
    <section id="faq" className={cn("bg-surface py-8 sm:py-10 lg:py-12", className)}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            FAQ
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Common questions
          </h2>
          <p className="mt-3 text-sm text-slate-600 sm:text-base">
            Straight answers about how we plan trips, visas, and cancellations — same
            content as our structured FAQ markup for search engines.
          </p>
        </div>

        <div className="mt-5 space-y-2">
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.question}
              className="group rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm open:shadow-md"
            >
              <summary className="cursor-pointer list-none font-display text-base font-semibold text-ink outline-none marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-2">
                  {item.question}
                  <span className="text-primary transition group-open:rotate-180">⌄</span>
                </span>
              </summary>
              <p className="mt-3 border-t border-slate-100 pt-3 text-sm leading-relaxed text-slate-600">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
