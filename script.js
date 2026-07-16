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
