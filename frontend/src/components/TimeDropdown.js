import React, { useState, useEffect, useRef } from 'react';
// import '../App.css';
// import './TimeDropdown.css';

const TimeDropdown = ({ options, value, onChange }) => {
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef(null); // Ref for the dropdown container

  useEffect(() => {
    if (expanded && containerRef.current) {
      const selectedIndex = options.indexOf(value);
      const optionHeight = containerRef.current.firstChild.offsetHeight;
      const scrollTop = selectedIndex * optionHeight - (containerRef.current.clientHeight / 2 - optionHeight / 2);
      containerRef.current.scrollTo({ top: scrollTop, behavior: 'smooth' });
    }
  }, [expanded, value, options]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;

    // Lock scroll when reaching the top or bottom
    if (scrollTop <= 0) {
      e.target.scrollTop = 0;
    } else if (scrollTop + clientHeight >= scrollHeight) {
      e.target.scrollTop = scrollHeight - clientHeight;
    }
  };

  const handleClick = () => {
    setExpanded(!expanded); // Toggle expanded state
  };

  const handleSelect = (option) => {
    onChange(option); // Update selected option
    setExpanded(false); // Collapse after selection
  };

  return (
    <div className="time-dropdown">
      <div className="time-dropdown-header" onClick={handleClick}>
        {value} ▼
      </div>
      {expanded && (
        <div
          className="time-dropdown-container"
          ref={containerRef}
          onScroll={handleScroll}
        >
          {options.map((option, index) => (
            <div
              key={index}
              className={`time-dropdown-option ${option === value ? 'selected' : ''}`}
              style={{ height: '2.4rem' }} // Height adjusted for visible options
              onClick={() => handleSelect(option)} // Handle selection
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimeDropdown;
