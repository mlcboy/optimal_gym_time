import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, SubTitle } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  SubTitle,
  annotationPlugin
);

const options = {
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
      annotations: {}
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
      title: {
        display: true,
        text: 'Score',
        color: '#dcdcdc', // Y-axis title color
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      ticks: {
        color: '#dcdcdc', // Y-axis tick color
        font: {
          size: 14
        }
      }
    }
  }
};

const ChartComponent = ({ dataChart }) => {
  return (
    <div className="graph-container">
      {dataChart.labels && (
        <Line data={dataChart} options={dataChart.options} />
      )}
    </div>
  );
};

export default ChartComponent;
