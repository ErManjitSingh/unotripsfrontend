"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type CategoryPillItem = {
  id: string;
  label: string;
  href: string;
  image: string;
  badge?: string;
};

const DEFAULT_ITEMS: CategoryPillItem[] = [
  {
    id: "easy",
    label: "Easy Book",
    href: "/packages",
    image:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=200&q=85",
    badge: "NEW",
  },
  {
    id: "honeymoon",
    label: "Honeymoon",
    href: "/packages?q=honeymoon",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=200&q=85",
  },
  {
    id: "luxury",
    label: "Luxury",
    href: "/packages?q=luxury",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&q=85",
  },
  {
    id: "adventure",
    label: "Adventure",
    href: "/packages?q=adventure",
    image:
      "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=200&q=85",
  },
];

export type CategoryPillsProps = {
  className?: string;
  items?: CategoryPillItem[];
};

export function CategoryPills({ className, items = DEFAULT_ITEMS }: CategoryPillsProps) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "mx-auto flex w-full items-center justify-evenly overflow-x-auto",
        "rounded-2xl border border-white/20 bg-white/10 px-2 py-3 backdrop-blur-md",
        "shadow-[0_8px_32px_-4px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.15)]",
        "sm:px-4 sm:py-4",
        "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
      aria-label="Holiday categories"
    >
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="shrink-0 flex items-center"
        >
          {i > 0 && <span className="h-8 w-px shrink-0 bg-white/20" />}
          <Link
            href={item.href}
            className="group relative flex items-center gap-3 rounded-xl mx-2 px-4 py-1 transition-all duration-200 hover:bg-white/10 sm:px-5"
          >
            {item.badge && (
              <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#E91E63] px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white shadow-md">
                {item.badge}
              </span>
            )}
            <span className="inline-flex h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-white/40 shadow-md transition-transform duration-300 group-hover:scale-105 sm:h-13 sm:w-13">
              <Image
                src={item.image}
                alt=""
                width={52}
                height={52}
                className="h-full w-full object-cover"
                sizes="52px"
              />
            </span>
            <span className="whitespace-nowrap text-xs font-bold tracking-wide text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)] sm:text-sm">
              {item.label}
            </span>
          </Link>
        </motion.div>
      ))}
    </motion.nav>
  );
}
