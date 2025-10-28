// DOM elements
const coinSelect = document.getElementById('coin');
const fetchBtn = document.getElementById('fetchData');
const ctx = document.getElementById('priceChart').getContext('2d');
let priceChart; // Chart instance

// Fetch data and update chart
fetchBtn.addEventListener('click', () => {
    const coin = coinSelect.value;
    fetchCoinHistory(coin);
});

async function fetchCoinHistory(coin) {
    const url = `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=15`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        const prices = data.prices.map(([timestamp, price]) => ({
            date: new Date(timestamp).toLocaleDateString(),
            price: price
        }));
        updateChart(prices);
    } catch (error) {
        alert('Failed to fetch data. Please try again later.');
    }
}

function updateChart(prices) {
    const labels = prices.map(p => p.date);
    const values = prices.map(p => p.price);

    // Destroy previous chart if exists
    if (priceChart) priceChart.destroy();

    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Price (USD)',
                data: values,
                borderColor: '#2aa198',
                backgroundColor: 'rgba(42,161,152,0.14)',
                fill: true,
                pointRadius: 3,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true },
                tooltip: { enabled: true }
            }
        }
    });
}

// Initial load
fetchCoinHistory(coinSelect.value);
