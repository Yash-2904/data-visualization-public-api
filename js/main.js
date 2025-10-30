// Get DOM elements
const coinSelect = document.getElementById('coin');
const chartTypeSelect = document.getElementById('chartType');
const fetchBtn = document.getElementById('fetchData');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const darkModeToggle = document.getElementById('darkModeToggle');
const priceChartCanvas = document.getElementById('priceChart').getContext('2d');

let priceChart = null;
let cache = {}; // cache for API results

// Toggle dark mode
darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  if (document.body.classList.contains('dark')) {
    darkModeToggle.textContent = '☀️';
  } else {
    darkModeToggle.textContent = '🌙';
  }
});

// Fetch and update chart on button click
fetchBtn.addEventListener('click', () => {
  const coin = coinSelect.value;
  const chartType = chartTypeSelect.value;
  fetchCoinHistory(coin, chartType);
});

// Fetch coin history prices (past 15 days)
async function fetchCoinHistory(coin, chartType) {
  showLoading(true);
  showError(null);

  try {
    // Check cache
    if (cache[coin]) {
      updateChart(cache[coin], chartType, coin);
      showLoading(false);
      return;
    }

    const url = `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=15`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const prices = data.prices.map(([time, price]) => ({
      date: new Date(time).toLocaleDateString(),
      price,
    }));

    // Cache result
    cache[coin] = prices;

    updateChart(prices, chartType, coin);
  } catch (error) {
    showError('Failed to load data. Please try again later.');
  } finally {
    showLoading(false);
  }
}

// Update Chart.js chart
function updateChart(prices, chartType, coin) {
  const labels = prices.map((p) => p.date);
  const values = prices.map((p) => p.price.toFixed(2));

  // For pie chart, aggregate values into slices (e.g. last 5 days)
  let chartData, labelsData;
  if (chartType === 'pie') {
    labelsData = labels.slice(-5);
    chartData = values.slice(-5);
  } else {
    labelsData = labels;
    chartData = values;
  }

  if (priceChart) {
    priceChart.destroy();
  }

  priceChart = new Chart(priceChartCanvas, {
    type: chartType,
    data: {
      labels: labelsData,
      datasets: [
        {
          label: `${capitalize(coin)} Price (USD)`,
          data: chartData,
          backgroundColor: chartType === 'pie' ? generateColors(chartData.length) : 'rgba(42,161,152,0.3)',
          borderColor: 'rgba(42,161,152,1)',
          borderWidth: 2,
          fill: chartType === 'line',
          tension: 0.2,
          pointRadius: 3,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        tooltip: { enabled: true },
      },
      scales: chartType !== 'pie' ? {
        x: { title: { display: true, text: 'Date' } },
        y: { title: { display: true, text: 'Price (USD)' }, beginAtZero: false },
      } : {},
    },
  });
}

// Utility: Capitalize first letter
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Utility: Generate array of colors for pie slices
function generateColors(num) {
  const baseColors = [
    '#2aa198', '#f94144', '#f3722c', '#f9844a',
    '#43aa8b', '#577590', '#90be6d', '#f8961e',
  ];
  let colors = [];
  for (let i = 0; i < num; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  return colors;
}

// Show/Hide loading spinner
function showLoading(isLoading) {
  if (isLoading) {
    loadingEl.hidden = false;
  } else {
    loadingEl.hidden = true;
  }
}

// Show or hide error message
function showError(message) {
  if (message) {
    errorEl.textContent = message;
    errorEl.hidden = false;
  } else {
    errorEl.textContent = '';
    errorEl.hidden = true;
  }
}

// Initial load
window.onload = () => {
  fetchCoinHistory(coinSelect.value, chartTypeSelect.value);

  // Set dark mode toggle text depending on initial state
  darkModeToggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
};
