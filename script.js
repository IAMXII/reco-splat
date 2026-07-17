const filterButtons = [...document.querySelectorAll("[data-filter]")];
const datasetCards = [...document.querySelectorAll(".dataset-card")];
const datasetCount = document.querySelector("#dataset-count");

function applyDatasetFilter(filter) {
  let visibleCount = 0;

  datasetCards.forEach((card) => {
    const shouldShow = filter === "all" || card.dataset.group === filter;
    card.hidden = !shouldShow;

    if (shouldShow) {
      visibleCount += 1;
      card.animate(
        [
          { opacity: 0, transform: "translateY(10px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 260, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
      );
    }
  });

  datasetCount.textContent = visibleCount;
}

filterButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((candidate) => {
      const isSelected = candidate === button;
      candidate.classList.toggle("is-active", isSelected);
      candidate.setAttribute("aria-selected", String(isSelected));
    });

    applyDatasetFilter(button.dataset.filter);
  });

  button.addEventListener("keydown", (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const nextIndex = (index + direction + filterButtons.length) % filterButtons.length;
    filterButtons[nextIndex].focus();
    filterButtons[nextIndex].click();
  });
});

const methodData = {
  reco: {
    label: "ReCo-Splat",
    gs: "0.80M",
    maxImages: "70",
    note: "Fewest Gaussians and the highest input capacity in this comparison.",
  },
  da3: {
    label: "DA3",
    gs: "3.07M",
    maxImages: "56",
    note: "Processes 56 images while producing about 3.8× as many Gaussians as ReCo-Splat.",
  },
  dggt: {
    label: "DGGT",
    gs: "5.47M",
    maxImages: "12",
    note: "Largest representation and the lowest image capacity in this comparison.",
  },
  worldmirror: {
    label: "WorldMirror",
    gs: "2.38M",
    maxImages: "40",
    note: "About 3× the Gaussian count of ReCo-Splat, with a 40-image capacity.",
  },
  anysplat: {
    label: "AnySplat",
    gs: "2.41M",
    maxImages: "28",
    note: "About 3× the Gaussian count of ReCo-Splat, with a 28-image capacity.",
  },
};

const chartRows = [...document.querySelectorAll(".bar-row[data-method]")];
const selectedMethod = document.querySelector("#selected-method");
const selectedGs = document.querySelector("#selected-gs");
const selectedMax = document.querySelector("#selected-max");
const selectedNote = document.querySelector("#selected-note");

function selectMethod(method) {
  const data = methodData[method];
  if (!data) return;

  chartRows.forEach((row) => {
    const isActive = row.dataset.method === method;
    row.classList.toggle("is-active", isActive);
    row.setAttribute("aria-pressed", String(isActive));
  });

  selectedMethod.textContent = data.label;
  selectedGs.textContent = data.gs;
  selectedMax.textContent = data.maxImages;
  selectedNote.textContent = data.note;
}

chartRows.forEach((row) => {
  const data = methodData[row.dataset.method];
  const isMaxImageChart = row.closest(".chart-panel")?.classList.contains("max-image-panel");
  const value = isMaxImageChart ? `${data.maxImages} maximum images` : `${data.gs} mean Gaussians`;
  row.setAttribute("aria-label", `${data.label}: ${value}`);

  ["pointerenter", "focus", "click"].forEach((eventName) => {
    row.addEventListener(eventName, () => selectMethod(row.dataset.method));
  });
});

const efficiencyChart = document.querySelector("#efficiency-chart");

if ("IntersectionObserver" in window) {
  const chartObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.2 },
  );

  chartObserver.observe(efficiencyChart);
} else {
  efficiencyChart.classList.add("is-visible");
}

// Add future qualitative datasets here. The UI and synchronized players are
// generated from these records, so no additional page markup is required.
const novelViewDatasets = [
  {
    id: "auditorium",
    label: "Auditorium",
    preview: "nvs_video/auditorium_videos/short.jpg",
    videos: [
      { label: "Rendered RGB", src: "nvs_video/auditorium_videos/render_web.mp4" },
      { label: "Predicted depth", src: "nvs_video/auditorium_videos/depth_web.mp4" },
    ],
  },
  {
    id: "family",
    label: "Family",
    preview: "nvs_video/family_videos/short.jpg",
    videos: [
      { label: "Rendered RGB", src: "nvs_video/family_videos/render_web.mp4" },
      { label: "Predicted depth", src: "nvs_video/family_videos/depth_web.mp4" },
    ],
  },
  {
    id: "real",
    label: "Real",
    preview: "nvs_video/real_videos/short.jpg",
    videos: [
      { label: "Rendered RGB", src: "nvs_video/real_videos/render_web.mp4" },
      { label: "Predicted depth", src: "nvs_video/real_videos/depth_web.mp4" },
    ],
  },
  {
    id: "real-1",
    label: "Real II",
    preview: "nvs_video/real1_videos/short.jpg",
    videos: [
      { label: "Rendered RGB", src: "nvs_video/real1_videos/render_web.mp4" },
      { label: "Predicted depth", src: "nvs_video/real1_videos/depth_web.mp4" },
    ],
  },
];

const gaussianVideoDatasets = [
  {
    id: "family",
    label: "Family",
    preview: "gaussian_ply/family_short.png",
    videos: [
      { label: "DA3", src: "gaussian_ply/family_da3.mp4" },
      { label: "WorldMirror", src: "gaussian_ply/family_wm.mp4" },
      { label: "ReCo-Splat", src: "gaussian_ply/family_ours.mp4" },
    ],
  },
];

function formatVideoTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const rounded = Math.max(0, Math.floor(seconds));
  return `${Math.floor(rounded / 60)}:${String(rounded % 60).padStart(2, "0")}`;
}

function createVideoCards(grid, dataset) {
  grid.innerHTML = dataset.videos.map((video) => `
    <figure class="video-card">
      <video muted loop playsinline preload="metadata" poster="${dataset.preview}" aria-label="${dataset.label}: ${video.label}">
        <source src="${video.src}" type="video/mp4">
      </video>
      <figcaption>${video.label}</figcaption>
    </figure>
  `).join("");
}

function createSynchronizedVideoController(container) {
  const toggle = container.querySelector("[data-video-toggle]");
  const toggleIcon = toggle.querySelector("span[aria-hidden]");
  const toggleLabel = toggle.querySelector("[data-video-toggle-label]");
  const scrubber = container.querySelector("[data-video-scrubber]");
  const timeLabel = container.querySelector("[data-video-time]");
  let videos = [];
  let duration = 0;
  let animationFrame = 0;

  function setPlayingState(isPlaying) {
    toggleIcon.textContent = isPlaying ? "Ⅱ" : "▶";
    toggleLabel.textContent = isPlaying ? "Pause" : "Play";
    toggle.setAttribute("aria-label", `${isPlaying ? "Pause" : "Play"} synchronized videos`);
  }

  function updateDuration() {
    const durations = videos.map((video) => video.duration).filter(Number.isFinite);
    if (!durations.length) return;
    duration = Math.min(...durations);
    const current = videos[0]?.currentTime || 0;
    timeLabel.textContent = `${formatVideoTime(current)} / ${formatVideoTime(duration)}`;
  }

  function updateProgress() {
    const master = videos[0];
    if (!master || !duration) return;
    scrubber.value = String(Math.round((master.currentTime / duration) * 1000));
    timeLabel.textContent = `${formatVideoTime(master.currentTime)} / ${formatVideoTime(duration)}`;
  }

  function keepInSync() {
    const master = videos[0];
    if (!master || master.paused) return;

    videos.slice(1).forEach((video) => {
      if (Math.abs(video.currentTime - master.currentTime) > 0.09) {
        video.currentTime = master.currentTime;
      }
    });

    updateProgress();
    animationFrame = requestAnimationFrame(keepInSync);
  }

  function pauseAll() {
    cancelAnimationFrame(animationFrame);
    videos.forEach((video) => video.pause());
    updateProgress();
    setPlayingState(false);
  }

  async function playAll() {
    if (!videos.length) return;
    const startTime = videos[0].currentTime;
    videos.forEach((video) => {
      video.currentTime = startTime;
    });

    const results = await Promise.allSettled(videos.map((video) => video.play()));
    if (results.every((result) => result.status === "fulfilled")) {
      setPlayingState(true);
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(keepInSync);
    } else {
      pauseAll();
    }
  }

  function attach() {
    pauseAll();
    videos = [...container.querySelectorAll("video")];
    duration = 0;
    scrubber.value = "0";
    videos.forEach((video) => {
      video.addEventListener("loadedmetadata", updateDuration, { once: true });
    });
    updateDuration();
  }

  toggle.addEventListener("click", () => {
    if (videos[0]?.paused) {
      playAll();
    } else {
      pauseAll();
    }
  });

  scrubber.addEventListener("input", () => {
    if (!duration) return;
    const nextTime = (Number(scrubber.value) / 1000) * duration;
    videos.forEach((video) => {
      video.currentTime = nextTime;
    });
    updateProgress();
  });

  return { attach, pause: pauseAll };
}

function createScenePicker(container, datasets, onSelect) {
  container.innerHTML = datasets.map((dataset, index) => `
    <button class="scene-option${index === 0 ? " is-active" : ""}" type="button" role="tab" aria-selected="${index === 0}" data-scene-id="${dataset.id}">
      <img src="${dataset.preview}" alt="${dataset.label} scene preview">
      <span>${dataset.label}</span>
    </button>
  `).join("");

  const buttons = [...container.querySelectorAll(".scene-option")];
  buttons.forEach((button, index) => {
    button.addEventListener("click", () => {
      buttons.forEach((candidate) => {
        const isSelected = candidate === button;
        candidate.classList.toggle("is-active", isSelected);
        candidate.setAttribute("aria-selected", String(isSelected));
      });
      onSelect(datasets[index]);
    });

    button.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex = (index + direction + buttons.length) % buttons.length;
      buttons[nextIndex].focus();
      buttons[nextIndex].click();
    });
  });
}

function initializeVideoShowcase({ datasets, pickerId, gridId, comparisonId }) {
  const picker = document.querySelector(`#${pickerId}`);
  const grid = document.querySelector(`#${gridId}`);
  const comparison = document.querySelector(`#${comparisonId}`);

  createVideoCards(grid, datasets[0]);
  const controller = createSynchronizedVideoController(comparison);
  controller.attach();

  createScenePicker(picker, datasets, (dataset) => {
    controller.pause();
    createVideoCards(grid, dataset);
    controller.attach();
  });
}

initializeVideoShowcase({
  datasets: novelViewDatasets,
  pickerId: "nvs-scene-picker",
  gridId: "nvs-video-grid",
  comparisonId: "nvs-video-comparison",
});

initializeVideoShowcase({
  datasets: gaussianVideoDatasets,
  pickerId: "gaussian-video-dataset-picker",
  gridId: "gaussian-video-grid",
  comparisonId: "gaussian-video-comparison",
});

function updateComparisonValue(stage) {
  const range = stage.querySelector(".comparison-range");
  const leftLabel = stage.querySelector(".comparison-label-left")?.textContent || "left image";
  const rightLabel = stage.querySelector(".comparison-label-right")?.textContent || "right image";
  stage.style.setProperty("--split", `${range.value}%`);
  range.setAttribute("aria-valuetext", `${range.value} percent ${leftLabel} and ${100 - Number(range.value)} percent ${rightLabel}`);
}

document.querySelectorAll("[data-image-compare]").forEach((stage) => {
  const range = stage.querySelector(".comparison-range");
  range.addEventListener("input", () => updateComparisonValue(stage));
  updateComparisonValue(stage);
});

const spatialButtons = [...document.querySelectorAll("[data-spatial-source]")];
const spatialStage = spatialButtons[0]?.closest(".comparison-layout")?.querySelector("[data-image-compare]");

spatialButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    spatialButtons.forEach((candidate) => {
      const isSelected = candidate === button;
      candidate.classList.toggle("is-active", isSelected);
      candidate.setAttribute("aria-selected", String(isSelected));
    });

    const overlay = spatialStage.querySelector("[data-comparison-overlay]");
    const label = spatialStage.querySelector("[data-comparison-left-label]");
    overlay.src = button.dataset.spatialSource;
    overlay.alt = `${button.dataset.spatialLabel} comparison image`;
    label.textContent = button.dataset.spatialLabel;
    updateComparisonValue(spatialStage);
  });

  button.addEventListener("keydown", (event) => {
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const isForward = ["ArrowDown", "ArrowRight"].includes(event.key);
    const nextIndex = (index + (isForward ? 1 : -1) + spatialButtons.length) % spatialButtons.length;
    spatialButtons[nextIndex].focus();
    spatialButtons[nextIndex].click();
  });
});

const frameButtons = [...document.querySelectorAll("[data-frame]")];
const renderStage = document.querySelector(".render-comparison");

frameButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    frameButtons.forEach((candidate) => {
      const isSelected = candidate === button;
      candidate.classList.toggle("is-active", isSelected);
      candidate.setAttribute("aria-selected", String(isSelected));
    });

    const renderImage = renderStage.querySelector("[data-render-overlay]");
    const gaussianImage = renderStage.querySelector("[data-render-base]");
    renderImage.src = button.dataset.render;
    renderImage.alt = `ReCo-Splat rendered output for frame ${button.dataset.frame}`;
    gaussianImage.src = button.dataset.gaussian;
    gaussianImage.alt = `ReCo-Splat Gaussian ellipsoid distribution for frame ${button.dataset.frame}`;
  });

  button.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (index + direction + frameButtons.length) % frameButtons.length;
    frameButtons[nextIndex].focus();
    frameButtons[nextIndex].click();
  });
});
