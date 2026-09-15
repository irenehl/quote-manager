# LonaPunto Quote Manager

An internal tool for Karla, the operator of a fictional print shop in Soyapango, El Salvador. It turns orders pasted from WhatsApp into reviewed, printable quotes. Built for Option A of the AdoptAI challenge: reduce manual interpretation and calculation while keeping decisions that require context with the operator.

## Running locally

Requires Node.js 20.9 or later. Run `npm install`, `npm test`, `npm run build`, then `npm run start`. For development, use `npm run dev`. The app runs at http://127.0.0.1:43123. `/health` reports application identity and availability.

In environments that restrict Turbopack's internal ports, use `npm run build -- --webpack`. The latest implementation was verified with this alternative.

## Demo

The operator interface and sample messages are in Spanish. Labels below match the app.

1. Select Rosa: three 2×1 m banners → 6 m² → $108.00 + $14.04 VAT = $122.04.
2. Create a request by pasting only `Necesito vinil para la vitrina` (I need vinyl for the shop window). If the text contains no customer identity, the request uses `Cliente por identificar` (unidentified customer). Finalization is blocked until the measurements are completed.
3. Edit the order: 2 pieces, width 2 m, height 1 m. Save the review → 4 m² → $99.44 including VAT.
4. Finalize and open the document. Print → Save as PDF, then deliver it to the customer manually.
5. Edit a price in `Lista de precios` (price list). Drafts update; finalized quotes retain their amounts. To demonstrate concurrent changes, leave Rosa open in one tab and change LONA-13 in another: the first attempt to finalize requires reviewing the updated total.

## Decisions and architecture

Intake accepts text or a screenshot. Text extraction recovers names and phone numbers when explicitly provided through labels, introductions such as `me llamo` (my name is), or WhatsApp headers. A draft can be prepared without a customer identity. Screenshot reading produces editable text that must be checked against the image; it does not infer specifications from product photographs.

During review, `Editar cliente` (edit customer) lets the operator correct the name and phone number before finalizing. Both fields are optional and update the inbox and document when saved. Finalized quotes retain the approved details.

- Next.js App Router and server actions keep the UI, validation, and operations in one project. The interface uses React, CSS/Tailwind, Lucide icons, and native controls.
- `lib/match.ts`: alias rules, quantities preceding product names, pieces × width × height, thousands, and packs of 50. Repeated products retain separate lines. The parser prepares the draft; Karla always reviews it.
- `lib/store.ts`: process-local shared memory with `requiere_datos` (missing information), `por_revisar` (awaiting review), and `finalizada` (finalized) states. Each update increments a revision; operations reject stale revisions.
- `lib/quote.ts` and `lib/money.ts`: prices come from the server-side catalog. Money uses integer cents, line amounts are rounded individually, and VAT is calculated on the subtotal. Finalization saves the lines, business details, tax rate, totals, and seven-day validity period.
- Catalog editing is limited to prices. Manual order review supports adding/removing products and correcting quantities or measurements. Catalog changes preserve those corrections.
- `/cotizacion/[id]` renders both clearly labeled drafts and finalized documents as HTML. Printing uses the browser; data remains in memory until the process restarts.

## Validation

`npm test` covers quantities, measurements, units, rounding, untrusted prices, exceptions, stale revisions, and finalized-document immutability. `npm run build` checks compilation and TypeScript.

Browser checks covered a new request without a phone number, missing-measurement blocking, corrections, finalization, the document, a price edited in another tab, and rejection of stale revisions. Inbox and detail navigation were checked at 375 px without horizontal overflow.

The integrated browser allowed document inspection and activation of the print action, but did not expose a verifiable print dialog. Export to a PDF file still needs to be checked in a regular browser; no generated PDF file was inspected during verification.

## Limitations

The store runs in memory in a single process. Restarting restores the seed data and loses newly created requests, edits, and finalizations. This is not suitable for multiple processes or live business operations. Tabs do not receive real-time updates; the server checks revisions when saving or finalizing.

There is no Meta API integration, simulated sending, email delivery, login, inventory, catalog history, payments, or CRM. Text is processed with rules; optional screenshot reading uses a vision model. Quotes are delivered manually. PDFs are not generated on the server. The business tax ID (NIT) is fictional, and the quote is not a tax invoice.
