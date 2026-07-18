# Findings

## Repository
- The project is a static single-page site with `index.html`, `style.css`, and image assets.
- Existing user change: `.DS_Store` is modified and must remain untouched.

## Paper extraction
- The PDF has 11 pages. Text extraction works with bundled `pypdf`; system Poppler text tools are absent.
- The paper presents compactness as Gaussian count decoupled from input resolution/view count.
- Training datasets (7): CO3Dv2, WildRGBD, ScanNet++, Mid-Air, Hypersim, MatrixCity, Waymo Open Dataset.
- Evaluation datasets (5): TUM RGB-D, NYUv2, mip-NeRF 360, NTU4DRadLM, and RADGS (the evaluation sequence/source associated with the Rad-GS paper).
- At 255 Kpixels, Fig. 7/text reports MaxImage values: AnySplat 28, WorldMirror 40, DGGT 12, DA3 56, ReCo-Splat 70.
- Table 2 Gaussian counts vary by the four depth benchmarks. Method-level averages are: AnySplat 2.412M, WorldMirror 2.379M, DGGT 5.469M, DA3 3.067M, ReCo-Splat 0.800M.
- ReCo-Splat values span 0.653M-0.982M across the four benchmarks; the chart must label Gaussian values as four-benchmark means, not fixed per-scene counts.

## Official dataset links
- CO3Dv2: `https://ai.meta.com/datasets/co3d-dataset/`
- WildRGB-D: `https://wildrgbd.github.io/`
- ScanNet++: `https://scannetpp.mlsg.cit.tum.de/scannetpp/`
- Mid-Air: `https://midair.ulg.ac.be/`
- Hypersim: `https://github.com/apple/ml-hypersim`
- MatrixCity: `https://city-super.github.io/matrixcity/`
- Waymo Open Dataset: `https://waymo.com/open/`
- TUM RGB-D: `https://cvg.cit.tum.de/data/datasets/rgbd-dataset`
- NYUv2: `https://cs.nyu.edu/~fergus/datasets/nyu_depth_v2.html`
- mip-NeRF 360: `https://jonbarron.info/mipnerf360/`
- NTU4DRadLM: `https://github.com/junzhang2016/NTU4DRadLM`
- RADGS source paper: `https://arxiv.org/abs/2511.16091` (no public official dataset landing page was found).

## Implementation notes
- The current Dataset header control is an `<a>` without `href`; there is no dataset section.
- The current Compactness section contains three static stat tiles followed by `assets/efficiency.png`.
- The page has no JavaScript and only minimal desktop-focused CSS; the new chart should be dependency-free and responsive.
- Implement dataset filters and synchronized efficiency bars with local HTML/CSS/JS only.
- Implemented 12 external dataset cards with All/Training/Evaluation filtering and live counts.
- Implemented two synchronized animated horizontal bar panels. Hover, focus, and click update both panels and a shared method summary.
- Replaced the old static efficiency PNG in the page while retaining the asset on disk for provenance.
- Browser verification passed at 1280px desktop and 390px mobile widths with no horizontal overflow.
- Training and evaluation filters returned the expected 7 and 5 cards; synchronized chart selection returned two active rows and the correct shared values.
- All six page images loaded with non-zero natural dimensions, and browser console checks returned no warnings or errors.

## 2026-07-17 qualitative-results extension
- New source folders are currently untracked and must be preserved as user-provided assets: `gaussian_ply/`, `gaussian_contrast/`, `gaussian_render/`, and `nvs_video/`.
- Requested deliverables: extensible dataset-based method videos; draggable Gaussian spatial-distribution comparison; draggable render/Gaussian comparison; HTML ablation table; paper overlap/redundancy figure.
- `gaussian_ply/family_short.png` is the current dataset selector preview. The three Family videos are DA3, WorldMirror, and ReCo-Splat.
- `gaussian_contrast/` currently contains DA3, WorldMirror, ReCo-Splat, and ground-truth/reference images.
- `gaussian_render/` currently contains four render/Gaussian image pairs keyed by frame id.
- `nvs_video/` contains four 8-second render/depth video pairs (Auditorium, Family, Real, Real 1), each with a `short.jpg` preview. The user's `short.jpg` instruction therefore makes this folder part of the qualitative selector UI even though it was not separately named in the prose request.
- Family method-comparison videos are aligned 6-second, 30 fps, 3840x2160 H.264 clips for DA3, WorldMirror, and ReCo-Splat.
- The spatial comparison should expose DA3, WorldMirror, and the RGB reference as selectable left-side sources against ReCo-Splat on the right.
- The render/Gaussian pairs are all 672x378 and can be matched exactly by frame ids 0035, 0053, 0083, and 0124.
- Paper Table 3 is the requested ablation table. It contains four ablations/variants over Real, CP, and Valley with PSNR, SSIM, LPIPS, and active GS count.
- Paper Figure 4 is titled "Visualization of overlap redundancy and opacity compression." Its native embedded image was extracted to `assets/overlap_redundancy.png` at 1865x889; red regions indicate projected 3D areas with redundant multi-view Gaussians.
- The final qualitative UI uses four data-driven ReCo-Splat render/depth scenes, one extensible three-method Gaussian video dataset, three selectable spatial-comparison sources, and four render/Gaussian frame pairs.
- Supplied NVS clips used MPEG-4 Part 2, so H.264/yuv420p `*_web.mp4` derivatives were created for browser compatibility; originals remain untouched.
- Media and typography now share a consistent scale: native media aspect ratios, 18px media radii, 0.74-0.88rem media/caption text, and 1.45-2.05rem module headings with mobile overrides.

## 2026-07-18 page repair and demo video
- The supplied screenshot shows the selected RGB reference correctly in the left clipped region, while the ReCo-Splat base region remains dark. The source dimensions are already close in aspect ratio, so this is not sufficient evidence of a size mismatch; reproduce before cropping.
- Requested layout: overlap/redundancy and Gaussian spatial contrast in one two-column row; render/Gaussian comparison visibly smaller than the current full-width viewer.
- Requested video: approximately two minutes, MP4, synthetic English voiceover plus English subtitles, and coverage of qualitative results and comparison charts.
- Current source audit: DA3 and Ours are 8-bit RGBA PNGs at 618x406 and 616x406; WorldMirror is 616x408 RGBA PNG; `gt.png` currently contains JPEG bytes at 308x203 despite its `.png` extension. A derived, uniformly encoded web set is safer than modifying these user-owned originals.
- The user has modified `gaussian_contrast/gt.png`, `gaussian_contrast/wm.png`, and added a root-level `wm.png` since the earlier pass; preserve them and generate normalized derivatives in a separate folder.
- Browser reproduction on the current local page loads both `ours.png` (616x406) and each left-side source successfully. With RGB reference selected, the left half renders the 308x203 JPEG-backed asset and the right half renders ReCo-Splat; therefore the reported black pane is not caused by aspect-ratio mismatch.
- A robust fix is still warranted because source encodings are inconsistent and the original comparison uses direct `clip-path` on the image element. Normalize derived assets to one real PNG geometry/encoding and use a full-size clipped wrapper so a failed/late overlay cannot obscure the base layer.
- Generated four derived 618x406, 8-bit RGB PNG comparison sources in `gaussian_contrast/web/`; the page now uses those paths without overwriting the user's originals.
- Replaced direct image clipping with a full-size clipped overlay wrapper above an explicit z-indexed base image.
- Moved the overlap/redundancy figure into the spatial-analysis module beside the Gaussian contrast at desktop widths, and constrained the render/Gaussian viewer to 800px.
- The first post-edit browser reload showed new HTML with stale CSS, confirming caching was a plausible contributor to inconsistent behavior. Versioned CSS/JS URLs forced the repaired layout to load.
- Final browser check at the desktop viewport reports two 523px analysis columns, a 523px Gaussian compare stage, and an 800px render viewer. RGB reference and ReCo-Splat both load as normalized 618x406 sources.
