# Visual direction — Electric London

## Positioning

An editorial neo-travel interface: London as a sequence of bold visual chapters rather than a conventional travel dashboard.

Keywords:
- editorial
- urban
- energetic
- immersive
- contemporary
- playful but premium
- spatial
- legible

Avoid:
- generic travel-app templates
- flag and red-phone-box clichés
- tiny dashboard cards
- excessive glassmorphism
- heavy shadows
- multiple competing accent colors on one screen
- text directly over busy images without contrast treatment

## Image system

Use a hybrid system.

### Day covers

Editorial photographic composition:
- recognizable landmark or destination
- cropped subject or architectural silhouette
- giant date behind or around the subject
- layered gradients and shapes
- depth through overlap, scale and parallax
- subtle grain or texture

For the prototype, create local abstract/editorial placeholder visuals with CSS and SVG. Do not depend on fragile remote image URLs.

### Activity and Saved cards

Use real photography later because recognition matters. Design the media container and overlay system now.

### Illustration

Use simple textural illustration for:
- open days
- empty states
- onboarding
- possibility and exploration
- closing moments

Illustration is secondary, not the main representation of confirmed places.

## Typography

Primary:
- Geist Sans

Data and times:
- Geist Mono

Principles:
- scale creates character
- limited font weights
- large dates and place names
- compact utility text
- avoid decorative display fonts

Suggested roles:
- Display date: Geist Sans Medium/Semibold
- Page title: Geist Sans Medium
- Card title: Geist Sans Medium
- Body: Geist Sans Regular
- Times/metadata: Geist Mono Regular/Medium

## Color tokens

Base:
- Ink: `#0C0C0C`
- Cloud: `#F4F1EA`
- Pure White: `#FFFFFF`
- Soft Grey: `#DADAD4`

Accents:
- Electric Lime: `#DCFC24`
- Exuberant Orange: `#FF5A36`
- Blue Violet: `#6959D9`
- Lavender Pink: `#F4C4EC`
- London Sky: `#A9D7DE`

Possible ambient gradient:
- London Sky → Electric Lime → Exuberant Orange

Rules:
- one dominant accent per screen
- black text on lime and most light accents
- statuses include label/icon, never color alone
- neutral backgrounds for content-heavy screens

## Shape language

- hero/day cards: 28–32 px radius
- secondary cards: 20–24 px radius
- pills: full radius
- restrained 1 px borders
- minimal shadow
- generous spacing
- large touch targets

## Bottom navigation

- floating black pill
- Journey, Saved, Trip
- active item uses an Electric Lime circular or pill treatment
- inactive icons/text use white or muted neutral
- respect mobile safe areas
- hide in deeply immersive activity details when appropriate

## Journey cover

Required hierarchy:
- weekday and trip-day count
- giant calendar date
- editorial destination visual
- short narrative title
- concise plan/booking metadata
- visible open-day affordance
- a partial hint of the next card may indicate horizontal movement

The 7 August cover:
- giant `07`
- Sky Garden / City atmosphere
- evening reference to Canary Wharf and The Hunger Games
- London Sky and Electric Lime as primary colors
- a restrained orange evening accent
- no dense itinerary on the cover

## Open day

- warm Cloud background
- compressed visual header
- sections such as Morning, Afternoon, Evening, Anytime and Nearby
- large activity cards
- flexible blocks do not require exact times
- confirmed anchors have clear status and time

## Activity detail

- immersive hero
- shared-element-like transition from card media
- time, title, area and status above the fold
- About
- Plan
- Location and Google Maps action
- Booking
- Nearby
- clear back control

## Motion principles

- motion explains hierarchy and spatial relationships
- day-to-day: horizontal depth and scale
- cover-to-day: vertical transformation
- card-to-detail: media expands into hero
- responsive, not slow
- support `prefers-reduced-motion`
- never make navigation depend only on animation

## Accessibility

- strong contrast
- readable text over media
- visible focus
- semantic headings
- labels for icons
- practical touch targets
- no status or navigation meaning communicated only through color
