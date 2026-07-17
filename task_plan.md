# Task Plan

## Current Goal
Extend the existing ReCo-Splat project page with paper-faithful qualitative results: an extensible multi-dataset video comparison, two draggable image-comparison viewers, an HTML ablation table, and the paper's overlap/redundancy figure.

## Current Phases
- [complete] Audit the supplied media folders and extract the ablation table plus overlap/redundancy figure from the PDF.
- [complete] Design the content schema and integrate the new qualitative sections into the existing page.
- [complete] Implement responsive, keyboard/touch-accessible video and image-comparison interactions.
- [complete] Validate asset loading, responsive layout, interaction behavior, and source consistency.
- [complete] Summarize the completed project-page update and the extension interface.

## Previous Completed Work
- [complete] Added the complete paper-derived dataset directory with official links.
- [complete] Replaced the static efficiency figure with synchronized interactive charts at 255 Kpixels.

## Decisions
- Treat the supplied PDF as the authority for what datasets and methods are mentioned.
- Link datasets to official project or repository pages, not third-party mirrors.
- Keep existing project-page visual language unless the new interaction needs a small supporting style extension.
- Keep future qualitative datasets data-driven in `script.js`, so adding an entry does not require duplicating page markup.
- Treat `short` preview images as dataset selectors and preserve the full-resolution comparison assets for the active viewer.

## Errors Encountered
| Error | Attempt | Resolution |
|---|---:|---|
| `pdftotext` is not installed on PATH | 1 | Use bundled Python with `pypdf` for text extraction, and inspect rendered pages with an available renderer. |
| Combined findings patch context mismatch | 1 | Re-read planning files and applied a smaller targeted patch. |
| Sandbox blocked the first local HTTP server bind | 1 | Restarted the temporary server with approved local bind permission. |
| In-app browser does not support `networkidle` load state | 1 | Switched to DOM snapshots and targeted state checks. |
| Browser requested an absent optional `favicon.ico` | 1 | No product impact; all page-owned scripts, styles, and images returned successfully. |
| Bundled `pdfimages` path was unavailable | 1 | Used `pypdf` to extract the page-5 image XObject directly at its native 1865x889 resolution. |
| `node` was not available on the shell PATH | 1 | Use the bundled workspace Node executable for JavaScript syntax checks. |
| macOS `tidy` treated valid HTML5 elements as unknown HTML4 | 1 | Use an HTML5 parser for structural validation instead of acting on obsolete parser warnings. |
| Bundled Python did not include `html5lib` | 1 | Retain the successful BeautifulSoup structural/asset checks; do not install a parser solely for redundant validation. |
