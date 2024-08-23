import React, { useState, useEffect, useRef } from 'react';
import './Tooltip.css';

const Tooltip = ({ text }) => {
  const tooltipRef = useRef(null);
  const [position, setPosition] = useState('tooltip-top'); // Default position

  useEffect(() => {
    const handlePositioning = () => {
      if (tooltipRef.current) {
        const bounding = tooltipRef.current.getBoundingClientRect();

        // Check if the tooltip is near the top of the viewport and adjust the position accordingly
        if (bounding.top < window.innerHeight / 2) {
          setPosition('tooltip-bottom'); // Position below if near top of viewport
        } else {
          setPosition('tooltip-top'); // Position above otherwise
        }
      }
    };

    handlePositioning(); // Run on mount
    window.addEventListener('scroll', handlePositioning);
    window.addEventListener('resize', handlePositioning);

    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener('scroll', handlePositioning);
      window.removeEventListener('resize', handlePositioning);
    };
  }, []);

  return (
    <span className="tooltip-wrapper" ref={tooltipRef}>
      <span className="tooltip">?</span>
      <span className={`tooltip-text ${position}`}>{text}</span>
    </span>
  );
};

export default Tooltip;
