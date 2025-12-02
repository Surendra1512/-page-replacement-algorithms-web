// ============================================
// DOM Elements (initialized later)
// ============================================
let pagesInput;
let framesInput;
let framesSlider;
let simulateBtn;
let themeBtn;
let metricsSection;
let metricsGrid;
let resultsSection;
let resultsContainer;
let comparisonSection;
let comparisonChart;
let comparisonLegend;

// ============================================
// State
// ============================================
let currentResults = {};
const algorithmColors = {
  fifo: "#6366f1",
  lru: "#ec4899",
  optimal: "#10b981",
  clock: "#f59e0b"
};

// ============================================
// Theme Management
// ============================================
function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    if (themeBtn) themeBtn.textContent = "☀️";
  }
}

// ============================================
// Simulation
// ============================================
async function runSimulation() {
  const raw = pagesInput.value.trim();
  if (!raw) {
    alert("Please enter a reference string.");
    return;
  }

  const pages = raw.split(/\s+/).map(Number).filter(n => !isNaN(n));
  if (pages.length === 0) {
    alert("Reference string must contain numbers.");
    return;
  }

  const frames = parseInt(framesInput.value);
  if (isNaN(frames) || frames < 1) {
    alert("Number of frames must be at least 1.");
    return;
  }

  // Get selected algorithms
  const selectedAlgos = Array.from(
    document.querySelectorAll("input[name='algo']:checked")
  ).map((el) => el.value);

  if (selectedAlgos.length === 0) {
    alert("Please select at least one algorithm.");
    return;
  }

  simulateBtn.disabled = true;
  simulateBtn.innerHTML = '<span class="loading">⏳</span> Simulating...';

  try {
    currentResults = {};
    for (const algo of selectedAlgos) {
      const resp = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pages, frames, algo })
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || "Server error");
      }

      const data = await resp.json();
      currentResults[algo] = data;
    }

    renderResults(pages, frames, selectedAlgos);
  } catch (e) {
    alert("Error: " + e.message);
  } finally {
    simulateBtn.disabled = false;
    simulateBtn.innerHTML = "🚀 Simulate";
  }
}

// ============================================
// Render Results
// ============================================
function renderResults(pages, frames, selectedAlgos) {
  // Show sections
  metricsSection.style.display = "block";
  resultsSection.style.display = "block";
  comparisonSection.style.display = "block";

  // Render metrics
  renderMetrics(selectedAlgos);

  // Render individual results
  resultsContainer.innerHTML = "";
  for (const algo of selectedAlgos) {
    const result = currentResults[algo];
    resultsContainer.appendChild(createResultCard(algo, result));
  }

  // Render comparison chart
  renderComparisonChart(selectedAlgos);

  // Scroll to results
  setTimeout(() => {
    metricsSection.scrollIntoView({ behavior: "smooth" });
  }, 100);
}

// ============================================
// Render Metrics
// ============================================
function renderMetrics(selectedAlgos) {
  metricsGrid.innerHTML = "";

  for (const algo of selectedAlgos) {
    const result = currentResults[algo];
    const faults = result.result.faults;
    const hits = result.pages.length - faults;
    const hitRate = ((hits / result.pages.length) * 100).toFixed(1);

    const metricCard = document.createElement("div");
    metricCard.className = "metric-card";
    metricCard.style.borderLeftColor = algorithmColors[algo];
    metricCard.innerHTML = `
      <div class="metric-label">${algo.toUpperCase()}</div>
      <div class="metric-value">${faults}</div>
      <div class="metric-subtext">Faults • ${hitRate}% Hit Rate</div>
    `;
    metricsGrid.appendChild(metricCard);
  }
}

// ============================================
// Create Result Card
// ============================================
function createResultCard(algo, data) {
  const card = document.createElement("div");
  card.className = "result-card";

  const faults = data.result.faults;
  const hits = data.pages.length - faults;
  const hitRate = ((hits / data.pages.length) * 100).toFixed(1);

  card.innerHTML = `
    <div class="result-header">
      <div class="result-algo">${algo.toUpperCase()}</div>
      <div class="fault-count">${faults} Faults</div>
    </div>

    <div class="frames-visualization">
      <div class="frame-label">Final Frame State:</div>
      <div class="frames-display">
        ${data.result.steps[data.result.steps.length - 1].frames
          .map((f) => `<div class="frame ${f === -1 ? "empty" : ""}">${f === -1 ? "—" : f}</div>`)
          .join("")}
      </div>
    </div>

    <table class="steps-table">
      <thead>
        <tr>
          <th>Step</th>
          <th>Page</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${data.result.steps
          .map(
            (step, idx) => `
          <tr class="${step.status === "Fault" ? "fault-row" : "hit-row"}">
            <td>${idx + 1}</td>
            <td>${step.page}</td>
            <td>${step.status}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>

    <div style="margin-top: 1rem; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
      Hit Rate: ${hitRate}% | Total Steps: ${data.pages.length}
    </div>
  `;

  return card;
}

// ============================================
// Render Comparison Chart
// ============================================
function renderComparisonChart(selectedAlgos) {
  comparisonChart.innerHTML = "";
  comparisonLegend.innerHTML = "";

  const maxFaults = Math.max(
    ...selectedAlgos.map((algo) => currentResults[algo].result.faults)
  );

  for (const algo of selectedAlgos) {
    const faults = currentResults[algo].result.faults;
    const percentage = (faults / maxFaults) * 100;

    const barContainer = document.createElement("div");
    barContainer.className = "chart-bar-container";

    const bar = document.createElement("div");
    bar.className = "chart-bar";
    bar.style.background = `linear-gradient(180deg, ${algorithmColors[algo]} 0%, ${darkenColor(algorithmColors[algo])} 100%)`;
    bar.style.height = `${Math.max(percentage, 10)}%`;

    const value = document.createElement("div");
    value.className = "chart-value";
    value.textContent = faults;

    const label = document.createElement("div");
    label.className = "chart-label";
    label.textContent = algo.toUpperCase();

    barContainer.appendChild(value);
    barContainer.appendChild(bar);
    barContainer.appendChild(label);
    comparisonChart.appendChild(barContainer);

    // Add legend
    const legendItem = document.createElement("div");
    legendItem.className = "legend-item";
    const colorBall = document.createElement("div");
    colorBall.className = "legend-color";
    colorBall.style.backgroundColor = algorithmColors[algo];
    legendItem.appendChild(colorBall);
    legendItem.appendChild(
      document.createTextNode(
        `${algo.toUpperCase()}: ${faults} faults (${((faults / currentResults[algo].pages.length) * 100).toFixed(1)}%)`
      )
    );
    comparisonLegend.appendChild(legendItem);
  }
}

// ============================================
// Utility Functions
// ============================================
function darkenColor(hex) {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = 30;
  const usePound = true;

  const R = (num >> 16) & 255;
  const G = (num >> 8) & 255;
  const B = num & 255;

  return (
    (usePound ? "#" : "") +
    (
      0x1000000 +
      (Math.max(0, R - amt) * 0x10000) +
      (Math.max(0, G - amt) * 0x100) +
      Math.max(0, B - amt)
    )
      .toString(16)
      .slice(1)
  );
}

// ============================================
// Initialize
// ============================================
function initializeDOMElements() {
  pagesInput = document.getElementById("pages");
  framesInput = document.getElementById("frames");
  framesSlider = document.getElementById("framesSlider");
  simulateBtn = document.getElementById("simulateBtn");
  themeBtn = document.getElementById("themeBtn");

  metricsSection = document.getElementById("metricsSection");
  metricsGrid = document.getElementById("metricsGrid");
  resultsSection = document.getElementById("resultsSection");
  resultsContainer = document.getElementById("resultsContainer");
  comparisonSection = document.getElementById("comparisonSection");
  comparisonChart = document.getElementById("comparisonChart");
  comparisonLegend = document.getElementById("comparisonLegend");
}

function setupEventListeners() {
  if (!themeBtn) return;
  
  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    themeBtn.textContent = isDark ? "☀️" : "🌙";
  });

  if (framesInput && framesSlider) {
    framesInput.addEventListener("input", (e) => {
      framesSlider.value = e.target.value;
    });

    framesSlider.addEventListener("input", (e) => {
      framesInput.value = e.target.value;
    });
  }

  if (simulateBtn) {
    simulateBtn.addEventListener("click", runSimulation);
  }

  initTheme();
}

document.addEventListener("DOMContentLoaded", () => {
  initializeDOMElements();
  setupEventListeners();
});
