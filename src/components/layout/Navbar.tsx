"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Globe2, Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { MEGA_DESTINATIONS, NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type NavbarProps = {
  className?: string;
};

export function Navbar({ className }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const shell = scrolled
    ? "border-b border-slate-100/80 bg-white/95 shadow-sm backdrop-blur-xl"
    : "border-b border-transparent bg-transparent";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-[60] transition-all duration-300",
        shell,
        className,
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:h-[4.25rem] sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-accent to-orange-300 shadow-sm">
            <span className="font-display text-lg font-bold text-white">W</span>
          </span>
          <span className="font-display text-lg font-semibold lowercase tracking-tight text-ink sm:text-xl">
            wanderlux
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-sm font-medium text-slate-700">
                  Destinations
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-6 p-6 md:grid-cols-3 lg:w-[720px]">
                    {MEGA_DESTINATIONS.map((col) => (
                      <div key={col.region}>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary">
                          {col.region}
                        </p>
                        <ul className="space-y-2">
                          {col.items.map((item) => (
                            <li key={item.label}>
                              <NavigationMenuLink asChild>
                                <Link
                                  href={item.href}
                                  className="block rounded-lg px-2 py-1.5 text-sm text-slate-700 transition hover:bg-surface hover:text-primary"
                                >
                                  {item.label}
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {NAV_LINKS.filter((l) => l.label !== "Destinations").map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-surface hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-primary/30 hover:text-primary"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm"
          >
            <span className="relative flex h-5 w-7 overflow-hidden rounded-sm shadow-inner ring-1 ring-black/5">
              <Image
                src="https://flagcdn.com/w40/in.png"
                alt="India flag"
                width={28}
                height={20}
                className="h-full w-full object-cover"
              />
            </span>
            INR ₹
            <ChevronDown className="h-3.5 w-3.5 opacity-60" />
          </button>
          <Link
            href="#contact"
            className="px-3 text-sm font-medium text-slate-700 hover:text-primary"
          >
            Login
          </Link>
          <Button asChild size="sm" variant="accent" className="rounded-full px-5">
            <a href="#contact">Book Now</a>
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Button asChild size="sm" variant="accent" className="rounded-full px-4 text-xs sm:text-sm">
            <a href="#contact">Book</a>
          </Button>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 shadow-sm"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
            className="border-t border-slate-100 bg-white lg:hidden"
          >
            <div className="max-h-[calc(100vh-4rem)] space-y-1 overflow-y-auto px-4 py-4">
              <p className="px-2 text-xs font-semibold uppercase tracking-wide text-primary">
                Destinations
              </p>
              {MEGA_DESTINATIONS.map((col) => (
                <div key={col.region} className="py-2">
                  <p className="px-2 text-[11px] font-semibold text-slate-500">
                    {col.region}
                  </p>
                  <div className="mt-1 flex flex-col">
                    {col.items.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="rounded-lg px-2 py-2 text-sm text-slate-800 hover:bg-surface"
                        onClick={() => setOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              {NAV_LINKS.filter((l) => l.label !== "Destinations").map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-lg px-2 py-2 text-sm font-medium text-slate-800 hover:bg-surface"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
                <Globe2 className="h-4 w-4 text-primary" />
                <span className="text-sm text-slate-600">INR · India</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
