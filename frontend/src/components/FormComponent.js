import React, { useState } from 'react';
import { convertToAmPm, convertAmPmTo24Hour, optimalTimeConverter } from '../utils/timeUtils';
import TimeDropdown from './TimeDropdown';
import Tooltip from './Tooltip';
import './OptimalTimeDisplay.css';
import '../App.css';

const BirdIcon = () => <span role="img" aria-label="Bird">🐦</span>;
const OwlIcon = () => <span role="img" aria-label="Owl">🦉</span>;

const FormComponent = ({
  day,
  setDay,
  wakeUpTime,
  setWakeUpTime,
  drinkCaffeine,
  setDrinkCaffeine,
  hasEaten,
  setHasEaten,
  crowdednessWeight,
  setCrowdednessWeight,
  chronotype,
  setChronotype,
  optimalTime,
  mealType,
  setMealType,
  mealTime,
  setMealTime,
  blockedTimes,
  setBlockedTimes
}) => {
  
  // Function to convert time in HH:MM format to total minutes since midnight
  const convertToMinutes = (time) => {
    if (typeof time === 'number') {
      return time * 60; // Convert hours to minutes
    }
  
    // If it's a string in HH:MM format, handle that case as well
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const addBlockedTime = () => {
    setBlockedTimes([...blockedTimes, { start: 9, end: 17 }]); // Default 24-hour format times
  };

  const updateBlockedTime = (index, field, value) => {
    const newBlockedTimes = blockedTimes.map((bt, i) => (
      i === index ? { ...bt, [field]: value } : bt
    ));
    setBlockedTimes(newBlockedTimes);
  };

  const handleBlockedTimeChange = (index, field, selectedTime) => {
    const selected24HourTime = convertAmPmTo24Hour(selectedTime);

    // Apply logic for AM/PM transitions if necessary
    const start = blockedTimes[index].start;
    const end = field === 'end' ? selected24HourTime : blockedTimes[index].end;

    // Check if the end time is before the start time (spanning over midnight)
    if (start && end && field === 'end') {
      const startInMinutes = convertToMinutes(start);
      const endInMinutes = convertToMinutes(end);

      // If the end time is earlier than the start time, assume it's on the next day
      if (endInMinutes < startInMinutes) {
        updateBlockedTime(index, 'end', selected24HourTime + 24); // Add 24 hours to represent next day
      } else {
        updateBlockedTime(index, 'end', selected24HourTime);
      }
    } else {
      updateBlockedTime(index, field, selected24HourTime);
    }
  };

  const handleMealTimeChange = (selectedTime) => {
    setMealTime(convertAmPmTo24Hour(selectedTime));
  };

  const handleWakeUpTimeChange = (selectedTime) => {
    setWakeUpTime(convertAmPmTo24Hour(selectedTime));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
  
    // Prepare blocked times as a string array in the format 'start-end'
    const blockedTimesFormatted = blockedTimes.map(bt => `${bt.start}-${bt.end}`);
  
    // Construct the query parameters
    const queryParams = new URLSearchParams({
      day,
      wake_up_time: wakeUpTime,
      drink_caffeine: drinkCaffeine,
      has_eaten: hasEaten,
      crowdedness_weight: crowdednessWeight,
      chronotype,
      meal_type: mealType,
      meal_time: mealTime,
    });
  
    // Append blocked times as multiple query parameters
    blockedTimesFormatted.forEach((bt) => queryParams.append('blocked_times', bt));
  
    try {
      const response = await fetch(`/optimal_gym_time?${queryParams.toString()}`, {
        method: 'GET',
      });
      
      const data = await response.json();
      console.log('Optimal Time:', data.optimal_time);
      console.log('Blocked Times:', data.blocked_times);
    } catch (error) {
      console.error('Error fetching optimal gym time:', error);
    }
  };

  const removeBlockedTime = (index) => {
    const newBlockedTimes = blockedTimes.filter((_, i) => i !== index);
    setBlockedTimes(newBlockedTimes);
  };

  const chronotypeMapping = [
    { value: 'definite_morning', label: 'Definite Morning' },
    { value: 'moderate_morning', label: 'Moderate Morning' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'moderate_evening', label: 'Moderate Evening' },
    { value: 'definite_evening', label: 'Definite Evening' }
  ];

  const handleChronotypeChange = (e) => {
    const value = parseInt(e.target.value);
    const index = Math.round(value / 25);
    setChronotype(chronotypeMapping[index].value);
  };

  const getChronotypeLabel = () => {
    const selected = chronotypeMapping.find(item => item.value === chronotype);
    return selected ? selected.label : 'Intermediate';
  };

  return (
    <form className="form-container" onSubmit={handleFormSubmit}>
      <h1 className="title">Find Your Optimal Gym Time</h1>

      <div className="section">
        <h2 className="section-title">Basics</h2>

        <label htmlFor="chronotype">
          Chronotype:
          <Tooltip text="Your chronotype represents your natural preference for waking up early or late." />
          </label>
        <div className="chronotype-slider-container" style={{ display: 'flex', alignItems: 'center' }}>
          <BirdIcon style={{ marginRight: '15px' }} />
          <input
            type="range"
            id="chronotype"
            min="0"
            max="100"
            step="25"
            value={chronotypeMapping.findIndex(item => item.value === chronotype) * 25}
            onChange={handleChronotypeChange}
            style={{ flex: 1 }}
          />
          <OwlIcon style={{ marginLeft: '15px' }} />
        </div>
        <div className="chronotype-label">{getChronotypeLabel()}</div>

        <br />
        <label htmlFor="day">
          Day of the Week:
          <Tooltip text="The day of the week influences gym crowd levels based on historical data." />
        </label>
        <select id="day" value={day} onChange={(e) => setDay(parseInt(e.target.value))} className="dropdown">
          <option value="1">Monday</option>
          <option value="2">Tuesday</option>
          <option value="3">Wednesday</option>
          <option value="4">Thursday</option>
          <option value="5">Friday</option>
          <option value="6">Saturday</option>
          <option value="7">Sunday</option>
        </select>

        <br />
        <label htmlFor="wakeUpTime">Wake Up Time:</label>
        <TimeDropdown 
          options={Array.from({ length: 24 }, (_, i) => convertToAmPm(i))} 
          value={convertToAmPm(wakeUpTime)} 
          onChange={handleWakeUpTimeChange} 
        />
      </div>

      <div className="divider"></div>

      <div className="section">
        <h2 className="section-title">Diet</h2>
        <label>Do you drink caffeine:</label>
        <div className="radio-container">
          <label>
            <input
              type="radio"
              name="drinkCaffeine"
              value="yes"
              checked={drinkCaffeine === true}
              onChange={() => setDrinkCaffeine(true)}
            />
            Yes
          </label>
          <label>
            <input
              type="radio"
              name="drinkCaffeine"
              value="no"
              checked={drinkCaffeine === false}
              onChange={() => setDrinkCaffeine(false)}
            />
            No
          </label>
        </div>
        <br />

        <label>Have you eaten:</label>
        <div className="radio-container">
          <label>
            <input
              type="radio"
              name="hasEaten"
              value="yes"
              checked={hasEaten === true}
              onChange={() => setHasEaten(true)}
            />
            Yes
          </label>
          <label>
            <input
              type="radio"
              name="hasEaten"
              value="no"
              checked={hasEaten === false}
              onChange={() => setHasEaten(false)}
            />
            No
          </label>
        </div>
        <br />

        {hasEaten && (
          <>
            <label htmlFor="mealType">
              Meal Macronutrients:
              <Tooltip text="The macronutrient composition of your meal can influence your exercise performance and the timing of your energy peak." />
            </label>
            <select id="mealType" value={mealType} onChange={(e) => setMealType(e.target.value)} className="dropdown">
              <option value="carbs">Carbs</option>
              <option value="carbs and protein">Carbs and Protein</option>
              <option value="fat">Fat</option>
            </select>
            <br />
            <label htmlFor="mealTime">Meal Time:</label>
            <TimeDropdown 
              options={Array.from({ length: 24 }, (_, i) => convertToAmPm(i))} 
              value={convertToAmPm(mealTime)} 
              onChange={handleMealTimeChange} 
            />
          </>
        )}
      </div>

      <div className="divider"></div>

      <div className="section">
        <h2 className="section-title">Personal Preferences</h2>
        <label htmlFor="crowdednessWeight">How important is an empty gym to you?</label>
        <br />
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
        <br />
        <br />

        <label>
          Blocked Times:
          <Tooltip text="Exclude specific times from being considered in your optimal gym time calculation." />
        </label>
        {blockedTimes.map((bt, index) => (
          <div key={index} className="blocked-time-container">
            <br></br>
            <label>Start Time:</label>
            <TimeDropdown 
              options={Array.from({ length: 24 }, (_, i) => convertToAmPm(i))} 
              value={convertToAmPm(bt.start)} 
              onChange={(selectedTime) => handleBlockedTimeChange(index, 'start', selectedTime)} 
            />
            <br></br>
            <label>End Time:</label>
            <TimeDropdown 
              options={Array.from({ length: 24 }, (_, i) => convertToAmPm(i))} 
              value={convertToAmPm(bt.end)} 
              onChange={(selectedTime) => handleBlockedTimeChange(index, 'end', selectedTime)} 
            />
            <button type="button" onClick={() => removeBlockedTime(index)}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={addBlockedTime}>Add Blocked Time</button>
      </div>
    </form>
  );
};

export default FormComponent;
