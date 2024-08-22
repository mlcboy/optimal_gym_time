import React from 'react';
import './OptimalTimeDisplay.css';

const OptimalTimeDisplay = ({ optimalTime }) => {
  return (
    <div className="optimal-time-container">
      <h2 className="optimal-time-title">Your Optimal Gym Time</h2>
      <div className="optimal-time">
        <span>{optimalTime}</span>
      </div>
    </div>
  );
};

export default OptimalTimeDisplay;
