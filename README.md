# Food Label Checker — Starter Pack (Barcode-first)

A minimal, deployable MVP for scanning a product barcode and showing ingredient chips with popover explanations. Uses **Next.js 14 (App Router)** + **TypeScript** + **TailwindCSS**. No database required by default; fetches data from **Open Food Facts (OFF)**.

> This is a demo — not medical advice. E-number origins and rules are simplified here.

## Features
- Barcode scan (native `BarcodeDetector` with manual fallback)
- OFF lookup (`/api/lookup/:gtin`), normalized into a friendly shape
- Ingredient **chips** with **popovers** (no page navigation)
- Simple nutrition snapshot + daily sugar impact
- Minimal rules/flags demo (e.g., carmine E120 -> not vegan)

## One‑click deploy (Vercel)
1. Push this repo to GitHub.
2. Import it in [Vercel](https://vercel.com/new).
3. No DB needed. Add env (optional):  
   - `NEXT_PUBLIC_OFF_BASE=https://world.openfoodfacts.org`
4. Deploy. Done.

## Local dev
```bash
pnpm i   # or npm i / yarn
pnpm dev # http://localhost:3000
```

## Project structure
```
src/
  app/
    api/lookup/[gtin]/route.ts  # OFF passthrough + normalize
    layout.tsx
    page.tsx                    # UI: scanner + product view
    globals.css
  components/
    BarcodeScanner.tsx
    IngredientChip.tsx
    IngredientPopover.tsx
    VerdictSummary.tsx
  lib/
    normalize.ts                # OFF -> internal mapping + simple verdict
    types.ts
    rules.ts                    # placeholder for deterministic rules
prisma/
  schema.prisma                 # optional, not required for deploy
```

## Notes
- The native **BarcodeDetector** works in Chromium-based browsers; there is a manual GTIN input fallback. You can add `@zxing/browser` camera fallback later.
- If you want caching or reformulation tracking, wire up Postgres (Prisma schema included). Otherwise this MVP is stateless.
- Extend `normalize.ts` and `rules.ts` to add more ingredients, origins, and rules. Connect EFSA/EU sources and your KB for production.

## Roadmap
- Deterministic rules (kids/pregnancy/allergy), smart swaps, recalls
- Localized UI (CZ/SK), richer origin labels, LLM-written micro-explanations with citations
- PWA polish and accessibility refinements


## New in this update
- **ZXing fallback** for camera scanning when `BarcodeDetector` is not supported.
- **GTIN validation** (EAN-13/UPC-A) to reduce bad lookups.
- **Preferences panel** (pregnancy, vegan, child age, allergies) stored in localStorage.
- **Basic context rules** applied client-side (allergen match, pregnancy caffeine, kids sugar, vegan compatibility).

### How to use
1. Start the dev server.
2. Set your preferences in the **Preferences** card.
3. Scan or enter a GTIN (try well-known products) and see flags adapt to your profile.

### Next tasks
- Move rules server-side for consistency and future APIs.
- Add more reliable allergen detection using OFF structured fields.
- Add smart swaps endpoint and recall checks.


---

# v5 Additions (LLM explanations, OCR fallback, Smart Swaps, server rules)

## New env vars
```
OPENAI_API_KEY=sk-...   # required for /api/explain and /api/ocr
NEXT_PUBLIC_OFF_BASE=https://world.openfoodfacts.org
```
(If `OPENAI_API_KEY` is absent, popovers fall back to KB text and OCR endpoint returns a config error.)

## New endpoints
- `POST /api/evaluate` → deterministic rules on server; input `{ product, ingredients, context }` → `{ verdict }`.
- `POST /api/explain`  → calls LLM with KB to write 2–3 sentence explainer; falls back to KB text if no key.
- `POST /api/ocr`      → optional OCR via OpenAI Vision (multipart or JSON base64). Returns `{ ingredients: string[] }`.
- `GET  /api/swaps?gtin=...&remove=E120,E250` → simple Smart Swaps using OFF search.

## New libs
- `src/lib/ingredient_kb.ts` – ~35 common E-numbers with role/origin/plain text.
- `src/lib/llm.ts` – minimal OpenAI client with guardrails.
- `src/lib/digital_link.ts` – GS1 Digital Link parser.
- `src/lib/i18n.ts` – i18n scaffold (English only for now).

## New UI
- `Preferences` card → context-aware rules (pregnancy, child age, allergies, vegan).
- `OcrUploader` card → label photo to ingredients (if OCR configured).
- `SmartSwaps` list → shows up to 5 alternatives that remove flagged E-numbers and sort by lower sugar/100 g.

## Step-by-step to run v5
1) **Clone/replace** the repo with this version.
2) **Add env** in Vercel (or `.env.local` for local dev):
   - `OPENAI_API_KEY` (optional but required for OCR + LLM explainers)
   - `NEXT_PUBLIC_OFF_BASE=https://world.openfoodfacts.org`
3) **Install & run**
   ```bash
   pnpm i
   pnpm dev
   ```
4) **Try it**
   - Set some preferences.
   - Scan or enter a GTIN.
   - Click ingredient chips → popovers will show KB text; if `OPENAI_API_KEY` is set, they’ll upgrade to 2–3 sentence LLM explanations.
   - Try **Scan label instead** with a photo of an ingredient panel (requires API key).
   - See **Smart swaps** list for alternatives.

## Notes
- This repo is still DB-free by default. When you want Pantry/Accounts/Recalls, wire Postgres via the included Prisma schema and add endpoints (see earlier roadmap).
