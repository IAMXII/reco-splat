# ReCo-Splat Project Page

This repository is a dependency-free static project page. Serve the repository
root with any static HTTP server; `index.html`, `style.css`, and `script.js` are
the complete application.

## Add a qualitative dataset

The dataset selectors are generated from two configuration arrays near the top
of the qualitative-results block in `script.js`:

- `novelViewDatasets` contains a `short.jpg` preview and synchronized render/depth videos.
- `gaussianVideoDatasets` contains one preview and any number of synchronized method videos.

To add a dataset, copy one existing object, give it a unique `id`, update its
label and local media paths, and place the assets in the corresponding folder.
No HTML or CSS changes are required. Web videos should use H.264 with a
`yuv420p` pixel format for broad browser compatibility.
