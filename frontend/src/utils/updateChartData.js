import { chartOptions, generateHourLabels } from '../utils/chartOptions';
import { convertToAmPm } from './timeUtils';

export const updateChartData = (
  data,
  wakeUpTime,
  drinkCaffeine,
  crowdednessWeight,
  setOptimalTime,
  setDataChart,
  hasEaten,
  blockedTimes
) => {
  const weights = {
    chronotype: 0.4,
    wakeUpTime: 0.2,
    caffeine: 0.2,
    mealTiming: 0.1,
    crowdedness: crowdednessWeight // uses weight set by slider on form
  };

  // Generate labels for each 10-minute interval in a 24-hour period
  const labels = generateHourLabels(wakeUpTime);

  console.log('Body Temp Scores:', data.body_temp_scores);
  console.log('Crowd Scores:', data.crowd_scores);
  console.log('Caffeine Scores:', data.caffeine_scores);
  console.log('Meal Scores:', data.meal_scores);
  console.log('Final Scores:', data.final_scores);

  // Create datasets for the chart
  const datasets = [
    {
      label: 'Body Temperature Score',
      data: data.body_temp_scores,
      borderColor: 'red',
      backgroundColor: 'rgba(255, 0, 0, 0.5)',
      pointRadius: 0,
      fill: false,
    },
    {
      label: 'Crowd Score',
      data: data.crowd_scores,
      borderColor: 'green',
      backgroundColor: 'rgba(0, 255, 0, 0.5)',
      pointRadius: 0,
      fill: false,
    },
    {
      label: 'Final Score',
      data: data.final_scores,
      borderColor: 'black',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      pointRadius: 0,
      fill: false,
    }
  ];

  if (drinkCaffeine) {
    datasets.splice(2, 0, {
      label: 'Caffeine Score',
      data: data.caffeine_scores,
      borderColor: 'blue',
      backgroundColor: 'rgba(0, 0, 255, 0.5)',
      pointRadius: 0,
      fill: false,
    });
  }

  if (hasEaten) {
    datasets.splice(3, 0, {
      label: 'Meal Timing Score',
      data: data.meal_scores,
      borderColor: 'purple',
      backgroundColor: 'rgba(128, 0, 128, 0.5)',
      pointRadius: 0,
      fill: false,
    });
  }

  // Prepare annotations for final score zeros (blocked times)
  const blockedTimeAnnotations = [];
  for (let i = 0; i < data.final_scores.length; i++) {
    if (data.final_scores[i] === 0) {
      // Create a box annotation at this index
      blockedTimeAnnotations.push({
        type: 'box',
        xMin: i - 0.5,  // Start the tint before the index
        xMax: i + 0.5,  // End the tint after the index
        backgroundColor: 'rgba(255, 0, 0, 0.2)',
        borderColor: 'rgba(255, 0, 0, 0.6)',
        borderWidth: 1,
        label: {
          content: `Blocked Time`,
          enabled: false,  // Disable label if you want to reduce clutter
          position: 'center',
          color: 'rgba(255, 0, 0, 0.4)',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
        }
      });
    }
  }

  // Find the peak index after adjusting for blocked times
  const peakIndex = data.final_scores.indexOf(Math.max(...data.final_scores));

  // Set the optimal time in the state from the backend response
  setOptimalTime(data.optimal_time);

  // Update chart options with the annotation for peak time and blocked time shading
  const updatedOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      annotation: {
        annotations: {
          ...blockedTimeAnnotations.reduce((acc, annotation, index) => {
            acc[`blockedTime_${index}`] = annotation;
            return acc;
          }, {}),
          peakTimeLine: {
            type: 'line',
            xMin: peakIndex,
            xMax: peakIndex,
            borderColor: 'yellow',
            borderWidth: 2,
            borderDash: [6, 6],
            label: {
              content: `Peak Time: ${convertToAmPm((wakeUpTime * 3600 + peakIndex * 600) / 3600)}`,
              enabled: true,
              position: 'top',
              color: 'yellow',
              backgroundColor: 'rgba(0,0,0,0.8)',
              padding: {
                top: 5,
                bottom: 5,
              },
            },
          },
        },
      },
    },
  };

  // Set the updated chart data
  setDataChart({
    labels: labels,
    datasets: datasets,
    options: updatedOptions,
  });

  console.log("Chart updated with options:", updatedOptions);
};
