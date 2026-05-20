"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterForm() {
  return (
    <form
      className="relative mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row lg:mt-0 lg:max-w-lg"
      onSubmit={(e) => e.preventDefault()}
    >
      <Input
        type="email"
        required
        placeholder="you@example.com"
        className="h-12 flex-1 rounded-2xl border-slate-200 bg-white"
        name="email"
      />
      <Button type="submit" variant="accent" className="h-12 rounded-2xl px-6">
        Subscribe
      </Button>
    </form>
  );
}
