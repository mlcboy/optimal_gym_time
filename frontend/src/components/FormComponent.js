import React from 'react';
import { convertToAmPm } from '../utils/timeUtils';

const FormComponent = ({
  day,
  setDay,
  wakeUpTime,
  setWakeUpTime,
  drinkCaffeine,
  setDrinkCaffeine,
  crowdednessWeight,
  setCrowdednessWeight,
  chronotype,
  setChronotype,
  optimalTime
}) => {
  return (
    <form className="form-container">
      <h1 className="title">Find Your Optimal Gym Time</h1>
      <label htmlFor="chronotype">Chronotype (MEQ Score):</label>
      <select id="chronotype" value={chronotype} onChange={(e) => setChronotype(e.target.value)} className="dropdown">
        <option value="definite_evening">Definite Evening</option>
        <option value="moderate_evening">Moderate Evening</option>
        <option value="intermediate">Intermediate</option>
        <option value="moderate_morning">Moderate Morning</option>
        <option value="definite_morning">Definite Morning</option>
      </select>
      <br/>
      <label htmlFor="day">Day of the Week:</label>
      <select id="day" value={day} onChange={(e) => setDay(parseInt(e.target.value))} className="dropdown">
        <option value="1">Monday</option>
        <option value="2">Tuesday</option>
        <option value="3">Wednesday</option>
        <option value="4">Thursday</option>
        <option value="5">Friday</option>
        <option value="6">Saturday</option>
        <option value="7">Sunday</option>
      </select>
      <br/>
      <label>
        <input type="checkbox" checked={drinkCaffeine} onChange={(e) => setDrinkCaffeine(e.target.checked)} />
        Do you drink caffeine?
      </label>
      <br/>
      {drinkCaffeine && (
        <>
          <label htmlFor="wakeUpTime">Wake Up Time (hour):</label>
          <select id="wakeUpTime" value={wakeUpTime} onChange={(e) => setWakeUpTime(parseInt(e.target.value))} className="dropdown">
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>{convertToAmPm(i)}</option>
            ))}
          </select>
          <br/>
        </>
      )}
      <label htmlFor="crowdednessWeight">How important is a crowded gym to you?</label>
    <div className="slider-container">
    <span className="slider-label small">Not Important</span>
    <input
        type="range"
        id="crowdednessWeight"
        min="0"
        max="0.4"
        step="0.05"
        value={crowdednessWeight}
        onChange={(e) => setCrowdednessWeight(parseFloat(e.target.value))}
    />
    <span className="slider-label small">Extremely Important</span>
    </div>
      <div className="optimal-time-container">
          <h2 className="optimal-time-title">Your optimal gym time is {optimalTime}</h2>
      </div>
    </form>
  );
};

export default FormComponent;
