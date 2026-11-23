// ─────────────────────────────────────────────────────────────────────────────
// TENNESSEE ESCAPE '26 — single source of truth for the trip.
// Edit this file to change the itinerary. Times are wall-clock times in the
// IANA zone given on each stop (never hard-coded UTC offsets).
// ─────────────────────────────────────────────────────────────────────────────

export const ET = 'America/New_York'
export const CT = 'America/Chicago'
export type Zone = typeof ET | typeof CT

export const TRIP_DATE = '2026-11-27'
export const SITE_URL = 'https://pateldev2511.github.io/tennessee-escape-26/'

export type Category = 'Driving' | 'Waterfall' | 'Scenic viewpoint' | 'Adventure' | 'Dining' | 'Spiritual visit'
export type ImageKey = 'hero' | 'twin' | 'great' | 'gorge' | 'cave' | 'cave2' | 'cave3' | 'plateau' | 'road' | 'town' | 'town2'

export interface WallTime { date: string; time: string; tz: Zone }

export interface Coord {
  lat: number
  lng: number
  /** Where the coordinate came from — never invented. */
  source: string
}

export interface Stop {
  id: string
  order: number
  name: string
  place: string
  category: Category
  start: WallTime
  end?: WallTime
  /** Shown instead of the time when a booking is required but unconfirmed. */
  pendingLabel?: string
  durationLabel: string
  summary: string
  description: string
  activities: string[]
  cost: string
  difficulty: string
  weather: 'High' | 'Medium' | 'Low'
  optional?: boolean
  image: ImageKey
  coord: Coord
  mapsUrl: string
  navUrl: string
  officialUrl?: string
  officialLabel?: string
  bookingUrl?: string
  bookingLabel?: string
  phone?: string
  notes?: string[]
  safety?: string[]
  extraSchedule?: { time: string; text: string }[]
  /** Estimated drive to the next stop (OSRM / OpenStreetMap, no traffic). */
  driveNext?: { min: number; mi: number; to: string }
}

const enc = encodeURIComponent
export const dirTo = (dest: string, origin?: string) =>
  `https://www.google.com/maps/dir/?api=1${origin ? `&origin=${enc(origin)}` : ''}&destination=${enc(dest)}&travelmode=driving`
export const searchMaps = (q: string) => `https://www.google.com/maps/search/?api=1&query=${enc(q).replace(/%20/g, '+')}`

const t = (time: string, tz: Zone, date = TRIP_DATE): WallTime => ({ date, time, tz })

export const ROUTE_URL =
  'https://www.google.com/maps/dir/?api=1&origin=Gainesville%2C+GA&destination=Gainesville%2C+GA&waypoints=Twin+Falls+Overlook%2C+Rock+Island%2C+TN%7CCumberland+Caverns%2C+McMinnville%2C+TN%7CIsha+Institute+of+Inner-sciences%2C+McMinnville%2C+TN&travelmode=driving'

export const STOPS: Stop[] = [
  {
    id: 'depart', order: 1, name: 'Departure from Gainesville', place: 'Gainesville, Georgia, USA', category: 'Driving',
    start: t('03:30', ET), durationLabel: '≈ 4 h 42 min driving + breaks',
    summary: 'Our adventure begins before sunrise. Four friends, one car, two drivers.',
    description: 'Our adventure begins before sunrise. Four friends, one car, two drivers and a full day exploring Tennessee. Leave Gainesville around 3:30 AM Eastern and take the best safe highway route toward Rock Island State Park.',
    activities: ['Begin drive', 'Breakfast or coffee stop', 'Fuel and restrooms', 'Rotate drivers if necessary', 'Enjoy the scenery safely'],
    cost: 'Fuel + breakfast (see budget)', difficulty: 'Driving', weather: 'Medium', image: 'road',
    coord: { lat: 34.2978794, lng: -83.8240663, source: 'OpenStreetMap Nominatim — Gainesville city centre' },
    mapsUrl: searchMaps('Gainesville, GA'),
    navUrl: 'https://www.google.com/maps/dir/?api=1&origin=Gainesville%2C+GA&destination=Twin+Falls+Overlook%2C+Rock+Island+State+Park%2C+TN&travelmode=driving',
    notes: ['Start with a full fuel tank.', 'Clocks go back one hour when you cross into Central Time.', 'Plan approximately 4–5 hours including reasonable buffers, subject to real navigation estimates.'],
    driveNext: { min: 282, mi: 201.5, to: 'Twin Falls Overlook' },
  },
  {
    id: 'twin', order: 2, name: 'Twin Falls Overlook', place: 'Powerhouse Road, Rock Island State Park, TN', category: 'Waterfall',
    start: t('07:15', CT), end: t('08:00', CT), durationLabel: '45 min',
    summary: 'A dramatic waterfall system cascading from the cliffs into the river gorge.',
    description: 'The first major highlight of the trip. Twin Falls is a dramatic waterfall system cascading from the cliffs into the river gorge at Rock Island State Park. The viewpoint provides excellent opportunities to photograph the waterfalls and the surrounding rock formations.',
    activities: ['Scenic waterfall photography', 'View the cascading falls', 'Enjoy the natural landscape', 'Walk around the designated overlook area', 'Take group photographs'],
    cost: 'Free, subject to park policies', difficulty: 'Easy at the overlook', weather: 'High', image: 'twin',
    coord: { lat: 35.8087513, lng: -85.6335118, source: 'OpenStreetMap node 9288498311 — Twin Falls viewpoint' },
    mapsUrl: searchMaps('Twin Falls Overlook Powerhouse Road Rock Island TN'),
    navUrl: dirTo('Twin Falls Overlook, Rock Island State Park, TN'),
    officialUrl: 'https://tnstateparks.com/parks/rock-island', officialLabel: 'Official park page',
    safety: ['Do not enter restricted gorge areas, swim or wade near the powerhouse.', 'Confirm access before visiting — TVA operations may affect gorge access.'],
    driveNext: { min: 7, mi: 1.8, to: 'Great Falls Overlook' },
  },
  {
    id: 'great', order: 3, name: 'Great Falls Overlook', place: 'Great Falls, Rock Island State Park, TN', category: 'Scenic viewpoint',
    start: t('08:00', CT), end: t('08:35', CT), durationLabel: '35 min incl. repositioning', optional: true,
    summary: 'A different perspective of Rock Island’s powerful river and rocky landscape.',
    description: 'The second waterfall viewpoint provides a different perspective of Rock Island’s powerful river and rocky landscape. This is intended as a short scenic stop instead of a lengthy hike.',
    activities: ['View the falls from designated accessible viewpoints', 'Scenic photography', 'Short walk', 'Enjoy the morning landscape'],
    cost: 'Free, subject to park policies', difficulty: 'Easy', weather: 'High', image: 'great',
    coord: { lat: 35.801944, lng: -85.622222, source: 'Wikidata Q5599156 — Great Falls Dam (overlook area)' },
    mapsUrl: searchMaps('Great Falls Overlook Rock Island State Park TN'),
    navUrl: dirTo('Great Falls Overlook, Rock Island State Park, TN', 'Twin Falls Overlook, Rock Island State Park, TN'),
    officialUrl: 'https://tnstateparks.com/parks/rock-island', officialLabel: 'Official park page',
    notes: ['Optional stop — skip it if the overlook is closed or the day is running late.'],
    driveNext: { min: 38, mi: 18.6, to: 'Cumberland Caverns' },
  },
  {
    id: 'caverns', order: 4, name: 'Cumberland Caverns', place: '1437 Cumberland Caverns Road, McMinnville, TN 37110', category: 'Adventure',
    start: t('10:30', CT), end: t('12:30', CT), pendingLabel: 'Tour time pending booking confirmation',
    durationLabel: 'Check-in 10:30 · Tour 90 min (target 11:00)',
    summary: 'A vast underground cave system of limestone formations and expansive chambers.',
    description: 'Explore a vast natural underground cave system filled with limestone formations, expansive chambers and remarkable geological history. This is the main paid adventure activity. Recommended: Discovery Walking Tour.',
    activities: ['Guided cave exploration', 'Geological formations', 'Photography where permitted', 'Underground history and nature experience'],
    cost: '$32 / adult (13+) · ≈ $128 for 4 before fees', difficulty: 'Moderately strenuous · 350+ stone steps', weather: 'Low', image: 'cave',
    coord: { lat: 35.6662996, lng: -85.6834106, source: 'OpenStreetMap / US Census geocoder — 1437 Cumberland Caverns Rd' },
    mapsUrl: searchMaps('Cumberland Caverns 1437 Cumberland Caverns Road McMinnville TN'),
    navUrl: dirTo('Cumberland Caverns, 1437 Cumberland Caverns Road, McMinnville, TN'),
    officialUrl: 'https://cumberlandcaverns.com/cave-adventures/walking-tours/', officialLabel: 'Tour information',
    bookingUrl: 'https://cumberlandcaverns.com/book-now/', bookingLabel: 'Book 4 Cave Tickets', phone: '931-668-4396',
    notes: [
      'Discovery Walking Tour: 90 min · $32/adult · 350+ natural stone steps · uneven, possibly slippery · guided · moderately strenuous.',
      'Alternative if unavailable: Cardwell Mountain History Walking Tour — 45 min · $25/adult · easiest tour, no stairs, some uneven terrain.',
      'The 11:00 AM start is a desired time, not a verified slot.',
    ],
    safety: ['Cave paths include uneven natural stone and many steps.', 'Wear shoes with good grip.'],
    driveNext: { min: 17, mi: 7.9, to: 'Downtown McMinnville' },
  },
  {
    id: 'lunch', order: 5, name: 'Lunch in Downtown McMinnville', place: 'Downtown McMinnville, Tennessee', category: 'Dining',
    start: t('12:45', CT), end: t('14:00', CT), durationLabel: '75 min',
    summary: 'A relaxed nonvegetarian lunch — burgers, BBQ, chicken, steak or American.',
    description: 'After the cave adventure, enjoy a relaxed lunch in McMinnville. Choose a suitable local restaurant with nonvegetarian food. Allow enough time for food, restrooms and a break before the Isha visit.',
    activities: ['Burgers', 'BBQ', 'Chicken', 'Steak', 'American food'],
    cost: '$15–$25 per person', difficulty: 'Relaxed', weather: 'Low', image: 'town',
    coord: { lat: 35.683404, lng: -85.7699816, source: 'OpenStreetMap Nominatim — McMinnville town centre' },
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=restaurants+Downtown+McMinnville+TN',
    navUrl: dirTo('Downtown McMinnville, TN', 'Cumberland Caverns, McMinnville, TN'),
    notes: ['Restaurant not confirmed — no reservation exists.', 'Day after Thanksgiving: hours may differ from a normal Friday. Check the restaurant’s own listing before going.'],
    driveNext: { min: 26, mi: 16.5, to: 'Isha Institute' },
  },
  {
    id: 'isha', order: 6, name: 'Isha Institute of Inner-sciences', place: '951 Isha Lane, McMinnville, TN 37110', category: 'Spiritual visit',
    start: t('14:45', CT), end: t('16:45', CT), durationLabel: '≈ 2 hours',
    summary: 'The mandatory spiritual highlight, amid the Cumberland Plateau.',
    description: 'The mandatory destination and spiritual highlight of the trip. Isha Institute of Inner-sciences is located amid the natural beauty of Tennessee’s Cumberland Plateau. The campus offers serene spaces for reflection, yoga, meditation and quiet exploration.',
    activities: ['Check in at the Welcome Center', 'Adiyogi: The Abode of Yoga', 'Linga Bhairavi (where permitted)', 'Quiet reflection & campus walk'],
    cost: 'Free day visit (meals optional, $15/adult)', difficulty: 'Easy walking', weather: 'Medium', image: 'plateau',
    coord: { lat: 35.5648434, lng: -85.572773, source: 'Pin in the Google Maps link published on Isha’s official center page' },
    mapsUrl: searchMaps('Isha Institute of Inner-sciences 951 Isha Lane McMinnville TN'),
    navUrl: dirTo('Isha Institute of Inner-sciences, 951 Isha Lane, McMinnville, TN', 'Downtown McMinnville, TN'),
    officialUrl: 'https://isha.sadhguru.org/en/center/isha-institute-inner-sciences-usa', officialLabel: 'Official visitor page',
    extraSchedule: [
      { time: '2:45 PM', text: 'Arrive and check in at the Welcome Center.' },
      { time: '3:00 PM', text: 'Explore Adiyogi: The Abode of Yoga, following visitor guidance.' },
      { time: '3:30 PM', text: 'Visit other publicly accessible spaces, incl. Linga Bhairavi where permitted.' },
      { time: '4:00 PM', text: 'Quiet reflection, photography in permitted areas, relaxed campus walk.' },
      { time: '4:30 PM', text: 'Return toward the car.' },
      { time: '4:45 PM', text: 'Depart.' },
    ],
    notes: [
      'Official: open to visitors daily 8:30 AM – 8:00 PM CT. No fee for a day visit; RSVP not required for day visitors.',
      'The same page also asks day visitors to call ahead 24 hours so they can share schedule changes — worth doing.',
      'A separate event runs Nov 25–28, 2026 — confirm Friday visitor access before departure.',
      'Official directions: Isha Lane intersects Tennessee Highway 8; a large “Isha Institute of Inner Sciences” sign marks the entrance on Route 8. About 16 miles from central McMinnville.',
      'Official warning: “many GPS systems give incorrect or outdated directions” — look up directions in advance.',
      'Attire: avoid tight-fitting or revealing clothing. Shoes are removed before entering buildings.',
      'Do not assume every interior is open to casual visitors or that photography is allowed in meditation spaces.',
    ],
    driveNext: { min: 241, mi: 175.6, to: 'Gainesville, GA' },
  },
  {
    id: 'return', order: 7, name: 'Dinner & Return Drive', place: 'Isha Institute → Gainesville, GA', category: 'Driving',
    start: t('17:30', CT), end: t('23:00', ET), durationLabel: '≈ 4 h driving + dinner & breaks',
    summary: 'Early meal, then the safest open highway home. Fatigue beats deadlines.',
    description: 'Stop for an early meal or substantial food break before the return drive, according to confirmed restaurant hours. Drive back to Gainesville using the safest open highway route. Target arrival ~11:00 PM Friday – 1:00 AM Saturday Eastern.',
    activities: ['Dinner / substantial food break', 'Fuel', 'Restrooms', 'Driver changes', 'Fatigue breaks'],
    cost: 'Dinner + fuel (see budget)', difficulty: 'Long drive', weather: 'Medium', image: 'road',
    coord: { lat: 34.2978794, lng: -83.8240663, source: 'OpenStreetMap Nominatim — Gainesville city centre' },
    mapsUrl: searchMaps('Gainesville, GA'),
    navUrl: 'https://www.google.com/maps/dir/?api=1&origin=Isha+Institute+of+Inner-sciences%2C+951+Isha+Lane%2C+McMinnville%2C+TN&destination=Gainesville%2C+GA&travelmode=driving',
    safety: ['Driver fatigue is a major concern on the return trip. If tired, stop and rest — never drive to meet a deadline.', 'Expect Thanksgiving-weekend traffic.'],
  },
]

export const OPTIONAL_AARTI = {
  title: 'Optional: Evening Aarti at Isha (6:00–7:00 PM CT, Fri–Sun)',
  text: 'Not in the default plan. Staying for Aarti pushes the Tennessee departure to ~7:15 PM CT and home arrival to roughly 1:00–3:00 AM ET Saturday — only if both drivers are well rested.',
}

// ── Alternative plans ───────────────────────────────────────────────────────
export type PlanId = 'A' | 'B' | 'C'
export interface Plan {
  id: PlanId
  name: string
  tagline: string
  stops: string[]
  overrides?: Record<string, Partial<Pick<Stop, 'start' | 'end' | 'durationLabel' | 'summary' | 'driveNext' | 'navUrl'>>>
  changes: string[]
  affectedBookings: string[]
}

export const PLANS: Plan[] = [
  {
    id: 'A', name: 'Plan A — Original Adventure', tagline: 'Waterfalls, caverns, lunch, Isha, home.',
    stops: ['depart', 'twin', 'great', 'caverns', 'lunch', 'isha', 'return'],
    changes: ['The full itinerary as planned.'], affectedBookings: [],
  },
  {
    id: 'B', name: 'Plan B — Heavy Rain', tagline: 'Skip wet overlooks, go underground.',
    stops: ['depart', 'caverns', 'lunch', 'isha', 'return'],
    overrides: {
      depart: { start: t('05:00', ET), durationLabel: '≈ 4 h 18 min driving + breaks', summary: 'Leave 90 min later and drive straight to the caverns (only if the tour is operating).', driveNext: { min: 258, mi: 185.9, to: 'Cumberland Caverns' }, navUrl: 'https://www.google.com/maps/dir/?api=1&origin=Gainesville%2C+GA&destination=Cumberland+Caverns%2C+1437+Cumberland+Caverns+Road%2C+McMinnville%2C+TN&travelmode=driving' },
      return: { start: t('17:00', CT), summary: 'Leave 30 min earlier for an earlier, safer arrival in the rain.' },
    },
    changes: ['Twin Falls and Great Falls skipped — unsafe outdoor trails and overlooks avoided.', 'Departure moves to ~5:00 AM ET (proposed).', 'Return departure ~5:00 PM CT (proposed) → earlier home arrival.'],
    affectedBookings: ['Cumberland Caverns — confirm the tour operates in heavy rain.'],
  },
  {
    id: 'C', name: 'Plan C — Cave Tickets Unavailable', tagline: 'More waterfall time, relaxed lunch, Isha.',
    stops: ['depart', 'twin', 'great', 'lunch', 'isha', 'return'],
    overrides: {
      great: { end: t('09:45', CT), durationLabel: 'Extended · consider a short permitted state-park walk', summary: 'Spend longer at Rock Island’s accessible viewpoints; a short permitted walk only if trails are open.', driveNext: { min: 24, mi: 15.3, to: 'Downtown McMinnville' } },
      lunch: { start: t('11:45', CT), end: t('13:30', CT), durationLabel: 'Relaxed, ~105 min', navUrl: dirTo('Downtown McMinnville, TN', 'Great Falls Overlook, Rock Island State Park, TN') },
      isha: { start: t('14:15', CT), end: t('16:45', CT), durationLabel: '≈ 2.5 hours' },
    },
    changes: ['Cumberland Caverns removed — no substitute cave is added.', 'Rock Island time extended.', 'Lunch earlier and longer; Isha arrival ~2:15 PM CT (proposed).', 'Any extra scenic stop only after confirming access and drive time.'],
    affectedBookings: ['Cumberland Caverns — cancel/refund any tickets if bought.'],
  },
]

// ── Bookings ────────────────────────────────────────────────────────────────
export type BookingStatus = 'Not booked' | 'Pending' | 'Booked' | 'Cancelled' | 'Not required' | 'Needs confirmation'
export const BOOKING_STATUSES: BookingStatus[] = ['Not booked', 'Pending', 'Booked', 'Cancelled', 'Not required', 'Needs confirmation']

export interface Booking {
  id: string
  stopId: string
  title: string
  detail: string[]
  defaultStatus: BookingStatus
  priority?: 'CRITICAL'
  url?: string
  urlLabel?: string
  phone?: string
  hasTime?: boolean
}

export const BOOKINGS: Booking[] = [
  {
    id: 'caverns', stopId: 'caverns', title: 'Cumberland Caverns', priority: 'CRITICAL', defaultStatus: 'Not booked', hasTime: true,
    detail: ['4 adult tickets', 'Discovery Walking Tour', '$32 per adult · ≈ $128 before fees', 'Target 11:00 AM Central (unverified)', 'Fallback: Cardwell Mountain tour, 45 min, $25'],
    url: 'https://cumberlandcaverns.com/book-now/', urlLabel: 'Book 4 Cave Tickets', phone: '931-668-4396',
  },
  {
    id: 'isha', stopId: 'isha', title: 'Isha Institute', defaultStatus: 'Needs confirmation',
    detail: ['General day visit · 4 visitors', 'Free standard entry', 'No general RSVP required', 'Holiday/program access (event Nov 25–28) — confirm'],
    url: 'https://isha.sadhguru.org/en/center/isha-institute-inner-sciences-usa', urlLabel: 'Official visitor page',
  },
  {
    id: 'rockisland', stopId: 'twin', title: 'Rock Island State Park', defaultStatus: 'Not required',
    detail: ['General park & overlook visit', 'No standard entrance reservation', 'Check site access & gorge conditions'],
    url: 'https://tnstateparks.com/parks/rock-island', urlLabel: 'Park conditions',
  },
]

// ── Budget ──────────────────────────────────────────────────────────────────
export const EXPENSE_CATEGORIES = ['Tickets', 'Fuel', 'Breakfast', 'Lunch', 'Dinner & snacks', 'Misc'] as const
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]

export interface BudgetLine { id: string; label: string; category: ExpenseCategory; low: number; high: number }
export const BUDGET_DEFAULTS: BudgetLine[] = [
  { id: 'cave', label: 'Cumberland Caverns Discovery Tour (4)', category: 'Tickets', low: 128, high: 128 },
  { id: 'park', label: 'Rock Island State Park', category: 'Tickets', low: 0, high: 0 },
  { id: 'isha', label: 'Isha Institute day visit', category: 'Tickets', low: 0, high: 0 },
  { id: 'bfast', label: 'Breakfast / coffee', category: 'Breakfast', low: 25, high: 45 },
  { id: 'lunch', label: 'Lunch', category: 'Lunch', low: 60, high: 100 },
  { id: 'dinner', label: 'Dinner / snacks', category: 'Dinner & snacks', low: 60, high: 120 },
  { id: 'fuel', label: 'Fuel (preliminary)', category: 'Fuel', low: 45, high: 80 },
  { id: 'misc', label: 'Miscellaneous', category: 'Misc', low: 10, high: 25 },
]

// ── Checklist ───────────────────────────────────────────────────────────────
export const CHECKLIST: Record<string, string[]> = {
  Car: ['Fuel', 'Tire condition', 'Phone charger', 'Offline maps', 'Vehicle insurance', 'Emergency kit'],
  Clothing: ['Walking shoes with good grip', 'Warm jacket', 'Layered clothing', 'Rain jacket', 'Spare socks'],
  Personal: ['ID', 'Wallet', 'Water', 'Snacks', 'Phone power bank', 'Camera'],
  Bookings: ['Four cave tickets', 'Cave check-in time confirmed', 'Isha visitor hours confirmed', 'State park access checked', 'Food options checked'],
  Safety: ['Drivers rested', 'Weather checked', 'Route downloaded', 'Return driver plan agreed'],
}

export const TRAVELERS_DEFAULT = [
  { id: 't1', name: 'Traveler 1', driver: true, emoji: '🧭' },
  { id: 't2', name: 'Traveler 2', driver: true, emoji: '📸' },
  { id: 't3', name: 'Traveler 3', driver: false, emoji: '🗺️' },
  { id: 't4', name: 'Traveler 4', driver: false, emoji: '🎒' },
]

export const WEATHER_POINTS = [
  { id: 'rock', name: 'Rock Island', lat: 35.8087513, lng: -85.6335118 },
  { id: 'mcm', name: 'McMinnville', lat: 35.683404, lng: -85.7699816 },
  { id: 'isha', name: 'Isha Institute area', lat: 35.5648434, lng: -85.572773 },
]

export const WARNINGS = [
  'Rock Island gorge access can change due to dam operations.',
  'Cave paths include uneven natural stone and many steps.',
  'Confirm holiday operating hours before departure.',
  'Driver fatigue is a major concern on the return trip.',
]

export const SHARE_MESSAGE = `🏞️ TENNESSEE ESCAPE ’26

Friday, November 27

4 friends. 1 car. 3 amazing destinations.

💦 Rock Island Waterfalls
🦇 Cumberland Caverns
🧘 Isha Institute

Check out our complete interactive itinerary, maps, booking links and travel plan!

${SITE_URL}`
