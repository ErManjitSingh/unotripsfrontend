import { LeaveALightOnExperience } from "@/components/home/leave-a-light-on-experience";
import { cn } from "@/lib/utils";

export type LeaveALightOnProps = {
  className?: string;
};

/** Homepage-closing email signup, styled to match the rest of the site (white/orange). */
export function LeaveALightOn({ className }: LeaveALightOnProps) {
  return (
    <section className={cn("bg-surface py-16 sm:py-20", className)}>
      <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
        <LeaveALightOnExperience />
      </div>
    </section>
  );
}
