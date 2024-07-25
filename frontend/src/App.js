import React, { useState, useEffect } from 'react';
import ChartComponent from './components/ChartComponent';
import FormComponent from './components/FormComponent';
import './App.css';
import { convertToAmPm, optimalTimeConverter } from './utils/timeUtils';

const App = () => {
  const [day, setDay] = useState(1);
  const [wakeUpTime, setWakeUpTime] = useState(7);
  const [drinkCaffeine, setDrinkCaffeine] = useState(true);
  const [crowdednessWeight, setCrowdednessWeight] = useState(0.2);
  const [chronotype, setChronotype] = useState("intermediate");
  const [dataChart, setDataChart] = useState({});
  const [optimalTime, setOptimalTime] = useState("");

  const fetchData = async () => {
    const response = await fetch(`/optimal_gym_time?day=${day}&wake_up_time=${wakeUpTime}&drink_caffeine=${drinkCaffeine}&crowdedness_weight=${crowdednessWeight}&chronotype=${chronotype}`);
    const data = await response.json();
    updateChartData(data);
  };

  useEffect(() => {
    fetchData();
  }, [day, wakeUpTime, drinkCaffeine, crowdednessWeight, chronotype]);

  const updateChartData = (data) => {
    // Generate labels based on wake-up time with 1-hour increments
    const labels = Array.from({ length: 24 }, (_, i) => {
      const hour = (wakeUpTime + i) % 24;
      return convertToAmPm(hour);
    });

    // Calculate the datasets for body temperature, caffeine, crowd, and final scores
    const datasets = [
      {
        label: 'Body Temperature Score',
        data: data.body_temp_scores.filter((_, i) => i % 6 === 0), // Filter scores to match the hourly labels
        borderColor: 'red',
        backgroundColor: 'rgba(255, 0, 0, 0.5)',
        pointRadius: 0,
        fill: false,
      },
      {
        label: 'Crowd Score',
        data: data.crowd_scores.filter((_, i) => i % 6 === 0), // Filter scores to match the hourly labels
        borderColor: 'green',
        backgroundColor: 'rgba(0, 255, 0, 0.5)',
        pointRadius: 0,
        fill: false,
      },
      {
        label: 'Final Score',
        data: data.final_scores.filter((_, i) => i % 6 === 0), // Filter scores to match the hourly labels
        borderColor: 'black',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        pointRadius: 0,
        fill: false,
      }
    ];

    if (drinkCaffeine) {
      datasets.splice(1, 0, {
        label: 'Caffeine Score',
        data: data.caffeine_scores.filter((_, i) => i % 6 === 0), // Filter scores to match the hourly labels
        borderColor: 'blue',
        backgroundColor: 'rgba(0, 0, 255, 0.5)',
        pointRadius: 0,
        fill: false,
      });
    }

    // Calculate the optimal time
    const peakIndex = data.final_scores.indexOf(Math.max(...data.final_scores));
    const peakHourIndex = Math.floor(peakIndex / 6); // Adjust peakIndex for the hourly labels
    const peakTime = data.times[peakIndex];
    const optimalHour = Math.floor((peakTime / 3600 + wakeUpTime) % 24);
    const optimalMinute = Math.floor((peakTime % 3600) / 60);
    // const formattedOptimalTime = `${optimalHour}:${optimalMinute.toString().padStart(2, '0')}`;
    const formattedOptimalTime = `${optimalTimeConverter(optimalHour, optimalMinute)}`

    setOptimalTime(formattedOptimalTime);

    setDataChart({
      labels: labels,
      datasets: datasets,
      options: {
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
          annotation: {
            annotations: {
              peakTimeLine: {
                type: 'line',
                xMin: peakHourIndex, // Adjust annotation position to match filtered data
                xMax: peakHourIndex, // Adjust annotation position to match filtered data
                borderColor: 'purple',
                borderWidth: 2,
                borderDash: [6, 6], // Dashed line
                label: {
                  content: `Peak Time: ${formattedOptimalTime}`,
                  enabled: true,
                  position: 'top',
                  color: 'purple',
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  padding: {
                    top: 5,
                    bottom: 5
                  }
                }
              }
            }
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
      }
    });
  };

  return (
    <div className="app-container">
      <FormComponent
        day={day}
        setDay={setDay}
        wakeUpTime={wakeUpTime}
        setWakeUpTime={setWakeUpTime}
        drinkCaffeine={drinkCaffeine}
        setDrinkCaffeine={setDrinkCaffeine}
        crowdednessWeight={crowdednessWeight}
        setCrowdednessWeight={setCrowdednessWeight}
        chronotype={chronotype}
        setChronotype={setChronotype}
        optimalTime={optimalTime}
      />
      <ChartComponent dataChart={dataChart} />
    </div>
  );
};

export default App;
