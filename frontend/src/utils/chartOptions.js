export const generateHourLabels = (wakeUpHour) => {
  let labels = [];
  for (let i = 0; i < 144; i++) {
    let totalMinutes = (wakeUpHour * 60) + (i * 10);
    let hour = Math.floor(totalMinutes / 60) % 24;
    let minute = totalMinutes % 60;
    let period = hour >= 12 ? 'PM' : 'AM';
    let standardHour = hour % 12 || 12; // Convert to 12-hour format

    // Show the hour label at the start of each hour
    if (minute === 0) {
      labels.push(`${standardHour}:00 ${period}`);
    } else {
      labels.push('');
    }
  }
  return labels;
};

export const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      display: true,
      labels: {
        color: '#dcdcdc' // Legend text color
      }
    },
    title: {
      display: true,
      text: 'Optimal Gym Time Calculation',
      padding: {
        top: 10,
        bottom: 30
      },
      color: '#dcdcdc', // Title text color
      font: {
        size: 20
      }
    },
    subtitle: {
      display: true,
      text: 'Analyze your best gym time based on multiple factors',
      color: '#a9a9a9', // Subtitle text color
      font: {
        size: 16
      },
      padding: {
        top: 0,
        bottom: 10
      }
    },
    annotation: {
      annotations: {} // This will be dynamically updated
    }
  },
  scales: {
    x: {
      title: {
        display: true,
        text: 'Hour of the Day',
        color: '#dcdcdc', // X-axis title color
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      ticks: {
        color: '#dcdcdc', // X-axis tick color
        font: {
          size: 14
        }
      }
    },
    y: {
      beginAtZero: true, // Ensure the scale starts at 0
      min: 0,
      max: 1, // This will ensure the y-axis runs from 0% to 100%
      ticks: {
        callback: (value) => `${Math.round(value * 100)}%`, // Convert values to percentages
        color: '#dcdcdc', // Y-axis tick color
        font: {
          size: 14
        }
      },
      title: {
        display: true,
        text: 'Score',
        color: '#dcdcdc', // Y-axis title color
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    }
  }
};
