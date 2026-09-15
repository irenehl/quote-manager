# Visual Exploration with UI/UX Pro Max

The isolated `/diseno` page compares two variants using Rosa's sample order. It does not save changes to the application's store. The operator can edit pieces, width, and height, see the calculation, and try finalization within the prototype.

## Sources and rationale

Irene selected the locally installed `ui-ux-pro-max` skill. Searches covered design systems for a print quotation workspace and operations dashboard, industrial and readable professional typography, animation/accessibility/loading guidelines, and Next.js forms.

The first recommendation, a biophilic landing-page design, did not fit the product and was discarded. The second contributed data hierarchy, readable highlighting, and visible editing controls; unnecessary hero sections, metrics, and charts were excluded. The Lexend / Source Sans 3 pairing came from the Corporate Trust recommendation, with readability as the priority. Fonts are self-hosted, with OFL licenses in `public/fonts`.

## A · Workspace

Source Sans 3 at 16 px, ink #202633, secondary text #596476, and actions #234adb. A request sidebar, a full-width message, and order details alongside the total. Compact reading and visible controls, with light surfaces for daytime work in the print shop.

## B · Workshop Order

Lexend headings and Source Sans 3 for data, graphite #29292c, and yellow #f5c842 with dark text. The message sits on the left, measurements are prominent, and finalization appears below the details. A stronger visual identity, without bot conversation bubbles or a hero section.

## Shared requirements

Controls at least 44 px tall, 16 px body text, and supporting text at least 12 px except for short labels. Status uses text as well as color; focus is visible, numbers are tabular, and there is no decorative animation. At 375 px, the order is message → details → total. The prototype is labeled as such; additional sample requests do not appear to be functional buttons.

Irene chose A. It was applied to the application through `app/workspace.css`: Source Sans 3, ink blue, a full-width message, and products alongside the summary. The document preview is in an expandable section, open by default; inbox and detail navigation are separate on mobile. This design change did not introduce shadcn or alter quotation logic, vision, or the catalog.
