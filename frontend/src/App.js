import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChartComponent from './components/ChartComponent';
import FormComponent from './components/FormComponent';
import MEQForm from './components/MEQForm';
import { updateChartData } from './utils/updateChartData';
import { optimalTimeConverter } from './utils/timeUtils';
import './App.css';

const App = () => {
  const [day, setDay] = useState(1);
  const [wakeUpTime, setWakeUpTime] = useState(7);
  const [drinkCaffeine, setDrinkCaffeine] = useState(true);
  const [hasEaten, setHasEaten] = useState(false);
  const [crowdednessWeight, setCrowdednessWeight] = useState(0.2);
  const [chronotype, setChronotype] = useState("intermediate");
  const [dataChart, setDataChart] = useState({});
  const [mealType, setMealType] = useState("carbs");
  const [mealTime, setMealTime] = useState(12);
  const [optimalTime, setOptimalTime] = useState("");
  const [blockedTimes, setBlockedTimes] = useState([]);

  const fetchData = async () => {
    try {
      const blockedTimesQuery = blockedTimes
        .map(bt => `blocked_times=${bt.start}-${bt.end}`)
        .join('&');
  
      const queryString = `/optimal_gym_time?day=${day}&wake_up_time=${wakeUpTime}&drink_caffeine=${drinkCaffeine}&has_eaten=${hasEaten}&crowdedness_weight=${crowdednessWeight}&chronotype=${chronotype}&meal_type=${mealType}&meal_time=${mealTime}&${blockedTimesQuery}`;
  
      console.log("Fetching data with query string:", queryString);
  
      const response = await fetch(queryString);
      const responseText = await response.text();
      const data = JSON.parse(responseText);
      updateChartData(data, wakeUpTime, drinkCaffeine, crowdednessWeight, setOptimalTime, setDataChart, hasEaten, blockedTimes);
  
    } catch (error) {
      console.log("Error during fetchData execution:", error?.message || error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [day, wakeUpTime, drinkCaffeine, hasEaten, crowdednessWeight, chronotype, mealType, mealTime, blockedTimes]);

  const calculateScore = (answers) => {
    const score = answers.reduce((acc, curr) => acc + curr, 0);
    if (score <= 41) {
      setChronotype('definite_evening');
    } else if (score <= 59) {
      setChronotype('moderate_evening');
    } else if (score <= 70) {
      setChronotype('intermediate');
    } else if (score <= 86) {
      setChronotype('moderate_morning');
    } else {
      setChronotype('definite_morning');
    }
  };

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={
            <div className="content-container">
              <div className="left-section">
                <div className='form-container'>
                  <FormComponent
                    day={day}
                    setDay={setDay}
                    wakeUpTime={wakeUpTime}
                    setWakeUpTime={setWakeUpTime}
                    drinkCaffeine={drinkCaffeine}
                    setDrinkCaffeine={setDrinkCaffeine}
                    hasEaten={hasEaten}
                    setHasEaten={setHasEaten}
                    crowdednessWeight={crowdednessWeight}
                    setCrowdednessWeight={setCrowdednessWeight}
                    chronotype={chronotype}
                    setChronotype={setChronotype}
                    mealType={mealType}
                    setMealType={setMealType}
                    mealTime={mealTime}
                    setMealTime={setMealTime}
                    blockedTimes={blockedTimes}
                    setBlockedTimes={setBlockedTimes}
                    setOptimalTime={setOptimalTime}
                  />
                </div>
                <div className="optimal-time-display">
                  <h2 className="optimal-time-title">Optimal Gym Time: {optimalTime ? optimalTimeConverter(optimalTime) : "calculating..."}</h2>
                </div>
              </div>
              <div className="right-section">
                <ChartComponent dataChart={dataChart} />
              </div>
            </div>
          } />
          <Route path="/meq" element={<MEQForm calculateScore={calculateScore} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
