# Tennessee Escape ’26

Interactive, mobile-first companion for a one-day road trip on **Friday, November 27, 2026**:
Gainesville, GA → Rock Island State Park → Cumberland Caverns → McMinnville → Isha Institute of Inner-sciences → Gainesville, GA.

**Live site:** https://pateldev2511.github.io/tennessee-escape-26/

## Features
- Cinematic hero with a departure countdown (America/New_York)
- Journey timeline with Plan / Live Trip modes, manual check-ins (We Arrived, Mark Completed, Skip, Running Late, Navigate Next), editable times and automatic schedule-conflict warnings
- Every time shown in both Central (America/Chicago) and Eastern (America/New_York), computed with `Intl` and IANA zones
- Leaflet map with verified stop coordinates, Google Maps deep links, complete-route link and per-segment fallbacks
- Booking center (statuses never change automatically; the cave time stays “pending” until a booked time is entered)
- Plan A/B/C switcher that recalculates the itinerary and flags affected bookings
- Live weather (Open-Meteo) and active alerts (NWS) for Rock Island, McMinnville and the Isha area
- Budget estimates, expense tracker, category chart, balances and settle-up
- Packing checklist, crew profiles, group notes, export/import of trip data
- Copy link, native share, WhatsApp, print/PDF, .ics calendar and Google Calendar, checklist download
- Dark/light mode, reduced-motion support, accessible touch targets

## Editing the trip
All trip content lives in [`src/data/trip.ts`](src/data/trip.ts): stops, times (wall-clock + IANA zone), plans, bookings, budget defaults and checklist.

## Data & privacy
There is no backend. Edits are stored in each visitor’s browser (`localStorage`), so they are **per device**. Use *Export my trip data* / *Import trip data* in the Group section to pass a copy between phones. Never put confirmation numbers or personal details in `trip.ts` — it is public.

### Optional: real shared group storage
For live collaboration, add a Supabase project (free tier) with a `trip_state(key text primary key, value jsonb, updated_at timestamptz)` table, Row Level Security restricted to invited users (magic-link auth), and swap `useLocal` in `src/lib/store.ts` for a hook that reads/writes that table. Keep the anon key in a build-time env var (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).

## APIs used (no keys required)
| Service | Purpose |
|---|---|
| [Open-Meteo](https://open-meteo.com/) | Forecast (CC BY 4.0) |
| [api.weather.gov](https://www.weather.gov/documentation/services-web-api) | Active NWS alerts |
| OpenStreetMap tiles | Map background |
| OSRM (build time only) | Drive-time estimates stored in `trip.ts` |

## Run locally
```bash
npm install
npm run dev        # http://localhost:5173/tennessee-escape-26/
npm run build      # outputs dist/
```

## Deploy
Run `npm run deploy` — it builds and pushes `dist/` to the `gh-pages` branch, which GitHub Pages serves.
For Netlify/Vercel instead: build command `npm run build`, output `dist`, and change `base` in `vite.config.ts` to `'/'` (and `SITE_URL` in `trip.ts`).

## Credits
Photos from Wikimedia Commons (authors and licences listed in the site footer and `src/data/images.ts`). Regenerate with `node scripts/process-images.mjs <dir>`.
