# AI Usage

LonaPunto was built with assistance from Codex, using the supplied project brief and an approved implementation plan. AI generated most of the application code, styles, tests, and initial documentation. Irene supplied the business context, challenged the initial scope, reviewed the workflow and UI, and tested the deployed application. This describes the contributions observed during development; it is not a measured percentage or a claim of line-by-line human review.

## Tools and workflow

- Codex assisted with implementation, debugging, tests, and documentation.
- UI/UX Pro Max informed the visual exploration. Irene selected option A, which was applied to the application. The comparison remains at `/diseno`; design decisions are recorded in [EXPLORATION.md](design-system/lonapunto/EXPLORATION.md).
- Verification used `node:test` through tsx, TypeScript/build checks, and browser interaction tests. The screenshot integration was checked against official OpenAI documentation.

## AI inside the product

Text matching and quotation calculations are deterministic. Product prices come from the server-side catalog, and an operator reviews each quote before finalizing it.

Optional screenshot reading uses an OpenAI vision model. The actual prompt and JSON schema are in [lib/vision.ts](lib/vision.ts). Screenshot content is treated as untrusted input. The model has no tools or permission to modify quotes, and its output is validated before being shown. The operator must review and may correct the extracted text before preparing the draft.

Initial provider tests used simulated responses because no local API key was configured. Irene later tested the deployed integration and confirmed it worked after debugging deployment access and provider errors. That confirmation is not a systematic evaluation of extraction accuracy, latency, or cost. Automated provider tests remain simulated.

## Prompts that shaped the implementation

The following are excerpts from actual requests. Spanish excerpts are translated into English for readability; they are not verbatim English prompts.

1. “If a workflow doesn't make sense, you can ask. I don't need you to redo everything at once,” followed by “review workflows, logic, feasibility.” This paused implementation and prompted a review of missing measurements, delivery, and price updates.
2. “This is the assignment. Do you think what we're doing fits the forward deployed developer role?” This focused the work on completing a new request through to a usable document with explicit limitations.
3. “PLEASE IMPLEMENT THIS PLAN” (original English), followed by the approved plan. It specified review states, manual corrections, finalized snapshots, and verification, replacing simulated sending with manual document delivery.
4. “Let's use UI/UX Pro Max instead,” followed by “A.” This led to a visual comparison and adoption of the selected design.

## Mistakes and corrections

- Implementation started before the workflow had been validated. Irene caught this and requested a review; the revised plan narrowed the scope to the core quotation workflow.
- Mobile review exposed a missing total when the document panel was hidden. Subtotal, tax, and total were added alongside the finalization action.
- The deployed screenshot reader initially rejected non-local hosts. The approved deployment origin was explicitly allowed, while other origins remained blocked.
- Provider errors initially combined temporary rate limits and exhausted quota into one message. Error handling now distinguishes known provider codes and logs a request reference without recording credentials, images, or extracted text.

The supplied brief also described an earlier parser issue involving “un evento” and the alias “hoja partida.” Regression tests cover it, but it is not claimed as an incident observed in this implementation.
