# Hotels and Packages API Migration Report

Backend: https://unohotels-backend.onrender.com/docs
Build: npm run build — PASSED

## API Endpoints Used

Hotels: /v1/hotels/search, /featured, /slugs, /{city}/{slug}, /related, availability-suggestions, /v1/destinations/*

Packages: /v1/packages, /v1/packages/{slug}, /categories, /categories/featured, /offers/active, /destinations/popular

## Files Created

- src/services/api.ts, hotels.ts, packages.ts
- src/hooks/use-hotels.ts, use-packages.ts, use-debounced-value.ts
- src/components/providers/query-provider.tsx
- src/components/ui/api-state.tsx
- src/components/home/trending-tours-api-section.tsx

## Files Modified

- package.json (@tanstack/react-query)
- src/lib/packages.ts, cms-api.ts, constants.ts
- app-providers, home-async-sections, hotels-exclusive-offers
- packages pages

## Removed Mock Data

- TRENDING_TOURS array (constants.ts)
- Hardcoded OFFERS (hotels-exclusive-offers.tsx)
- Laravel package fetch from cms-api.ts

## Remaining Notes

- Backend package list may be empty until admin publishes packages
- Blogs/destinations still use Laravel CMS (not hotels/packages)
- Use HOTELS_API_URL + NEXT_PUBLIC_API_BASE (not VITE_API_URL — Next.js project)