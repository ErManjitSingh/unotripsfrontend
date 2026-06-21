# UnoTrips Frontend — Work Report

**Project:** Hotel Booking Frontend (Next.js 15 / Tailwind CSS)  
**Date:** June 2026  
**Files touched:** `hotel-travellers-view.tsx`, `hotel-booking-payment-step.tsx`, `hotel-detail-view.tsx`

---

## Session 1 — Checkout & Review Page Fixes

### 1. Sidebar Counter Layout (hotel-travellers-view.tsx)

**Problem:** The 4 guest/room counters (Nights, Adults, Rooms, Children) stacked vertically in the right sidebar, pushing the "Proceed to Payment" CTA below the fold.

**Fix:** Converted the 4-row stack into a 2×2 CSS grid (`grid-cols-2`). Each counter cell became a compact `h-5 w-5` button row. Combined the hotel identity block and summary header into a single row to save more vertical space.

**Result:** "Proceed to Payment" button is always visible without scrolling.

---

### 2. Price Mismatch Between Review & Payment Pages (hotel-travellers-view.tsx)

**Problem:** Review page showed ₹7,404 (frontend estimate) but payment page showed ₹6,750 (API total). Root cause: `CreateBookingPayload` sends **no pricing fields** — the server computes `total_amount` independently from its own internal rates, which differ from the frontend's displayed `ratePlan.price`.

**Fix:** Implemented an **auto-booking on page load**. When the user lands on the review page while authenticated, a silent booking is created immediately using their profile data to fetch the authoritative `total_amount` from the API. The result is stored in `confirmedPrice` state.

Key implementation details:
- `confirmedPrice` state (`useState<number | null>(null)`) stores the API-confirmed total
- `autoBookingAttempted` ref prevents double-firing in React Strict Mode / re-renders
- `idempotencyKeyRef` (UUID) deduplicates the silent pre-booking; reset after it completes so the real "Proceed" click creates a fresh booking with actual form data
- `payTotal` priority chain: `apiBooking?.total_amount ?? confirmedPrice ?? estimatedTotal`
- Sidebar label switches between "Est. Total / Calculating…" and "Amount Payable / Confirmed · incl. taxes & fees" based on whether a confirmed price is available

**Also fixed:** Stale `payTotal` bug in Razorpay payment handler — `amountPaise` was computed from `payTotal` before the `setApiBooking(created)` state update resolved. Fixed to use `created.total_amount` directly.

---

### 3. "Room Only (EP)" Raw Label on Payment Page (hotel-booking-payment-step.tsx)

**Problem:** Payment summary showed the raw backend code `Room Only (EP)` instead of a friendly label.

**Fix:** Added `getMealPlanLabel()` helper function to the payment step component:

```
EP / Room Only   →  "Room Only"
Breakfast only   →  "Bed & Breakfast"
Breakfast+Dinner →  "Half Board"
Full Board / AP  →  "Full Board"
```

---

### 4. HTML Entity Bug in Button Text (hotel-travellers-view.tsx)

**Problem:** The "Proceed" button rendered literally as `Confirm &amp; Proceed to Pay →` — the HTML entity was not decoded.

**Fix:** Changed the JSX string from `"Confirm &amp; Proceed to Pay →"` to `"Confirm & Proceed to Pay →"`.

---

## Session 2 — Mobile UX Improvements (Hotel Detail Page)

**Page:** `/hotel/haridwar/hotel-dev-rishi-haridwar-haridwar`  
**Viewport tested:** 390×844px (iPhone 14 Pro equivalent)

---

### 5. Compact Search Strip on Mobile (hotel-detail-view.tsx)

**Problem:** The `DetailSearchStrip` rendered 4 stacked form fields on mobile (~200px tall), consuming most of the above-the-fold space before the hotel name or gallery was visible.

**Fix:** Added a mobile-only compact bar (`sm:hidden`) that collapses the form to a single row:

```
[ 🔍  22 Jun → 23 Jun · 2 Guests, 1 Room         ∨ ]
```

Tapping the bar expands an inline panel with:
- Check-in / Check-out date buttons (side by side)
- Inline `HotelDateRangePicker` (single month, no popover positioning issues)
- Guests / Rooms steppers in a 2-column grid
- Search CTA button

The existing full form is wrapped in `hidden sm:block` so it only appears on tablets and up.

Also added `ChevronDown` to the Lucide imports and `mobileExpanded` state.

---

### 6. Swipeable Image Carousel on Mobile (hotel-detail-view.tsx)

**Problem:** The `DetailGallery` used a CSS grid (`grid-cols-1` on mobile) that stacked 3 images vertically within a constrained height, making none of them large enough to be useful.

**Fix:** Added a mobile-only (`sm:hidden`) CSS scroll-snap carousel:
- Horizontal `overflow-x-auto` with `snap-x snap-mandatory`
- Shows up to 10 photos, one per slide, full-width
- Slide counter badge (e.g. "1/10") in bottom-right corner
- Dot indicators that animate (active dot is wider: `w-5` vs `w-1.5`)
- Clicking any slide opens the full-screen lightbox
- Scrollbar hidden via inline style (`scrollbarWidth: none`)

The existing 3-image desktop grid is wrapped in `hidden sm:grid` and unchanged.

Added `activeSlide` state and `carouselRef` / `carouselPhotos` locals inside `DetailGallery`.

---

### 7. Hide Desktop Sidebar on Mobile (hotel-detail-view.tsx)

**Problem:** `GallerySidebarLayout` used `flex-col` on mobile, placing the `BookingSummary` sidebar below the gallery. On mobile this sidebar is redundant — the `MobileBookingBar` (fixed bottom bar) already shows price and CTA.

**Fix:** Added `hidden lg:block` to the sidebar wrapper div in `GallerySidebarLayout`. The sidebar is now invisible on mobile/tablet, appearing only on `lg` (1024px+) breakpoint.

---

### 8. Fixed Sticky Hotel Header Top Offset (hotel-detail-view.tsx)

**Problem:** The hotel name/rating sticky header had `top-[128px]` on mobile — calibrated for the old tall search form. With the compact search the header would stick at the wrong position.

**Fix:** Changed `top-[128px]` → `top-[116px]` for mobile. Desktop values unchanged (`sm:top-[132px]`, `lg:top-[72px]`).

---

### 9. Scroll-to-Top Button Clears Mobile Booking Bar (hotel-detail-view.tsx)

**Problem:** The scroll-to-top button was fixed at `bottom-6` (24px), placing it directly behind the `MobileBookingBar` (which is ~64px tall). The buttons visually overlapped.

**Fix:** When `stickyVisible` is true (mobile bar is shown), the scroll button shifts up: `bottom-[76px]` on mobile, `lg:bottom-6` on desktop. This keeps the button above the bar without affecting the desktop layout.

---

### 10. "Book Now" → "View Rooms" → "Proceed →" Flow (hotel-detail-view.tsx)

**Problem:** "Book Now" in the `MobileBookingBar` only scrolled within the page to the rooms section — it didn't navigate anywhere. After selecting a room on mobile, there was **no CTA** to proceed to checkout (the desktop sidebar holding "Proceed to Checkout" was hidden per fix #7).

**Fix (two parts):**

**Part A — Correct scroll offset.**  
Replaced `scrollIntoView()` + CSS `scroll-mt-24` (96px) with a manual `window.scrollTo()` using explicit offsets: 130px on mobile (matching the 116px header + breathing room), 80px on desktop.

**Part B — Smart mobile CTA.**  
Updated `MobileBookingBar` to accept `bookingHref` and `selectedRoomName` props. The bar now has two states:

| State | Left side | Right side |
|---|---|---|
| No room selected | Price (₹/night) + free cancellation badge | "View Rooms" button → scrolls to room tabs |
| Room selected | "Selected room" label + room name & plan | "Proceed →" Link → navigates to checkout URL |

`roomSelection` (already tracked in `HotelDetailView` state) provides `bookingHref` and `roomName + planCode` to the bar. No extra API call needed.

---

## Summary of Files Changed

| File | Changes |
|---|---|
| `src/components/hotels/hotel-travellers-view.tsx` | Counter 2×2 grid, auto-booking for price, confirmedPrice state, fixed amountPaise bug, sidebar labels, HTML entity fix |
| `src/components/hotels/hotel-booking-payment-step.tsx` | Added `getMealPlanLabel()`, fixed packageName display, improved amount payable section |
| `src/components/hotels/hotel-detail-view.tsx` | Compact mobile search, image carousel, hide sidebar on mobile, sticky header offset, scroll button positioning, smart mobile booking bar |
