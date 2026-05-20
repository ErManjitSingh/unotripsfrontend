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
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=128&q=80",
    badge: "NEW",
  },
  {
    id: "honeymoon",
    label: "Honeymoon",
    href: "/packages?q=honeymoon",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=128&q=80",
  },
  {
    id: "luxury",
    label: "Luxury",
    href: "/packages?q=luxury",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=128&q=80",
  },
  {
    id: "adventure",
    label: "Adventure",
    href: "/packages?q=adventure",
    image:
      "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=128&q=80",
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
        "mx-auto flex w-full items-center justify-evenly overflow-x-auto rounded-full border border-[#ECECEC] bg-white px-1 py-2 shadow-[0_8px_32px_-6px_rgba(15,23,42,0.16),0_2px_12px_-2px_rgba(15,23,42,0.06)] sm:px-2",
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
          transition={{ delay: 0.08 + i * 0.04 }}
          className={cn("shrink-0", i > 0 && "border-l border-[#EEEEEE]")}
        >
          <Link
            href={item.href}
            className="group relative flex items-center justify-center gap-1.5 px-1 py-0.5 transition-colors hover:bg-[#FAFAFA] sm:gap-2 sm:px-1.5"
          >
            {item.badge ? (
              <span className="absolute -top-2 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-[#E91E63] px-1.5 py-px text-[7px] font-bold uppercase leading-none text-white shadow-sm sm:text-[8px]">
                {item.badge}
              </span>
            ) : null}
            <span className="inline-flex h-9 w-9 shrink-0 overflow-hidden rounded-full border border-[#E0E0E0] bg-white shadow-sm transition-transform duration-300 group-hover:scale-[1.03] sm:h-10 sm:w-10">
              <Image
                src={item.image}
                alt=""
                width={40}
                height={40}
                className="h-full w-full object-cover"
                sizes="40px"
              />
            </span>
            <span className="whitespace-nowrap text-[10px] font-semibold leading-none text-[#212121] sm:text-[11px]">
              {item.label}
            </span>
          </Link>
        </motion.div>
      ))}
    </motion.nav>
  );
}
