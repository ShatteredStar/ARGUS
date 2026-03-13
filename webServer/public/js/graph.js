// 1. Flatten all device history
let allLogins = [];
if (window.userHistoryData !== null && window.userHistoryData !== undefined) {
    allLogins = Object.values(window.userHistoryData).flat();
}

// 2. Count logins per date (YYYY-MM-DD)
const dailyCounts = {};
allLogins.forEach(entry => {
    let timestamp = entry.loginTime || entry.loginTIme;
    if (timestamp !== undefined && timestamp !== null && typeof timestamp === 'string') {
        const dateKey = timestamp.split(' ')[0]; 
        if (dailyCounts[dateKey] === undefined) {
            dailyCounts[dateKey] = 0;
        }
        dailyCounts[dateKey] = dailyCounts[dateKey] + 1;
    }
});

// 3. Generate the last 30 days (even those with 0 users)
const chartLabels = [];
const chartData = [];

// We start 29 days ago to include "today" as the 30th day
for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    
    // Format for data lookup: YYYY-MM-DD
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${d.getDate().toString().padStart(2, '0')}`;
    
    // Format for chart label: Mar 2
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    chartLabels.push(label);
    
    // If we have a count for this day, use it. Otherwise, use 0.
    if (dailyCounts[dateKey] !== undefined) {
        chartData.push(dailyCounts[dateKey]);
    } else {
        chartData.push(0);
    }
}



// 4. Render Chart
const ctx = document.getElementById('activityChart')?.getContext('2d');
if (ctx !== undefined && ctx !== null) {
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartLabels,
            datasets: [{
                label: 'Active Laptops',
                data: chartData,
                borderColor: '#00c1d4',
                backgroundColor: 'rgba(0, 193, 212, 0.1)',
                borderWidth: 2,
                tension: 0,
                fill: true
            }]
        },
        options: {
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1 // Since you are counting people
                    }
                },
                x: { 
                    grid: { display: false } 
                }
            }
        }
    });
}