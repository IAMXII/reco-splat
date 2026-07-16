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
