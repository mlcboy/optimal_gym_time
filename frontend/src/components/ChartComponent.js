import React, { useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, SubTitle } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { chartOptions } from '../utils/chartOptions'; // Import chartOptions from your utils

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

const ChartComponent = ({ dataChart }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        chartRef.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (!dataChart.labels) {
    return <div>Loading...</div>;
  }

  return (
    <div className="graph-container" style={{ width: '100%', height: '100%' }}>
      <Line ref={chartRef} data={dataChart} options={{ ...chartOptions, ...dataChart.options }} />
    </div>
  );
};

export default ChartComponent;
