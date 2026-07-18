# Task Plan

## Current Goal
Fix the Gaussian comparison loading issue, compact the qualitative-result layout, and deliver an approximately two-minute 1080p MP4 that uses all supplied project-page media with English synthetic narration and burned-in subtitles.

## Current Phases
- [complete] Reproduce and diagnose the black/unloaded Gaussian comparison pane; normalize assets only if decoding or geometry requires it.
- [complete] Place overlap/redundancy and Gaussian contrast side by side, and reduce the render/Gaussian viewer footprint.
- [complete] Build a 120-second storyboard covering all figures, charts, image pairs, and video clips; write English narration and subtitle timing.
- [complete] Generate synthetic narration, compose the 1920x1080 H.264/AAC MP4, and burn in subtitles.
- [complete] Validate the repaired page interactions and final video duration, streams, legibility, and representative frames.

## Previous Completed Work
- [complete] Added the complete paper-derived dataset directory with official links.
- [complete] Replaced the static efficiency figure with synchronized interactive charts at 255 Kpixels.

## Decisions
- Treat the supplied PDF as the authority for what datasets and methods are mentioned.
- Link datasets to official project or repository pages, not third-party mirrors.
- Keep existing project-page visual language unless the new interaction needs a small supporting style extension.
- Keep future qualitative datasets data-driven in `script.js`, so adding an entry does not require duplicating page markup.
- Treat `short` preview images as dataset selectors and preserve the full-resolution comparison assets for the active viewer.
- Deliver the presentation video locally in MP4 format; do not publish or deploy the project page.
- Target 1920x1080, 30 fps, roughly 120 seconds, H.264 video, AAC audio, English narration, and burned-in English subtitles with an SRT sidecar.
- Include every supplied qualitative media group: paper figures/charts, all four NVS render/depth pairs, all three Family method videos, all four Gaussian-contrast sources, and all four render/Gaussian frame pairs.
- Preserve user-owned source images and route the webpage through `gaussian_contrast/web/` derivatives normalized to real 618x406 RGB PNGs.
- Cache-bust `style.css` and `script.js` so the repaired comparison and compact layout are not masked by stale local-browser assets.
- Keep the analysis semantics explicit: Gaussian contrast is the left intra-view panel; overlap redundancy is the right inter-view panel.

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
| Sandbox blocked the local preview server bind | 1 | Restarted the same local-only server with the approved scoped server command. |
| Initial burned-in subtitle size obscured parts of the comparison charts at 1080p | 1 | Reduced the ASS font and bottom margin, then re-encoded only the final delivery file. |
