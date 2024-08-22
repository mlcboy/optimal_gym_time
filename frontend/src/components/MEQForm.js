import React, { useState } from 'react';
import './MEQForm.css';

const questions = [
  "1. What time would you get up if you were entirely free to plan your day?",
  "2. What time would you go to bed if you were entirely free to plan your evening?",
  "3. If there is a specific time at which you have to get up in the morning, to what extent are you dependent on being woken up by an alarm clock?",
  "4. Assuming adequate environmental conditions, how easy do you find getting up in the morning?",
  "5. How alert do you feel during the first half hour after having woken in the morning?",
  "6. How is your appetite during the first half-hour after having woken in the morning?",
  "7. During the first half-hour after having woken in the morning, how tired do you feel?",
  "8. When you have no commitments the next day, at what time do you go to bed compared to your usual bedtime?",
  "9. You have decided to engage in some physical exercise. A friend suggests that you do this for one hour twice a week and the best time for him is between 7:00-8:00 am. Bearing in mind nothing but your own internal clock, how do you think you would perform?",
  "10. At what time in the evening do you feel tired and as a result in need of sleep?",
  "11. You wish to be at your peak performance for a two-hour test which you know is going to be mentally exhausting and will demand your total concentration. You are entirely free to plan your day and there is no commitment the next day. At which time of the day would you choose to take the test?",
  "12. If you went to bed at 11:00 PM at what level of tiredness would you be?",
  "13. For some reason you have gone to bed several hours later than usual, but there is no need to get up at any particular time the next morning. Which ONE of the following events are you most likely to experience?",
  "14. One night you have to remain awake between 4:00-6:00 AM in order to carry out a night watch. You have no commitments the next day. Which ONE of the alternatives will suit you best?",
  "15. You have to do two hours of hard physical work. You are entirely free to plan your day and in particular there is no commitment the next day. Which ONE of the following times would you choose?",
  "16. You have decided to engage in hard physical exercise. A friend suggests that you do this for one hour twice a week and the best time for him is between 10:00-11:00 PM. Bearing in mind nothing else but your own internal clock, how well do you think you would perform?",
  "17. Suppose that you can choose your own work hours. Assume that you worked a five-hour day (including breaks) and that your job was interesting and paid by results. Which FIVE CONSECUTIVE HOURS would you select?",
  "18. At what time of day do you think that you reach your “feeling best” peak?",
  "19. One hears about “morning” and “evening” types of people. Which one of these types do you consider yourself to be?",
];

const MEQForm = ({ calculateScore }) => {
  const [answers, setAnswers] = useState(Array(questions.length).fill(0));

  const handleInputChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = parseInt(value, 10);
    setAnswers(newAnswers);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    calculateScore(answers);
  };

  return (
    <div className="meq-form-container">
      <h1>Morningness-Eveningness Questionnaire (MEQ)</h1>
      <form onSubmit={handleSubmit}>
        {questions.map((question, index) => (
          <div key={index} className="question-container">
            <label>{question}</label>
            <select value={answers[index]} onChange={(e) => handleInputChange(index, e.target.value)}>
              <option value="0">Select an answer</option>
              {/* Add options for each question here */}
              <option value="1">Option 1</option>
              <option value="2">Option 2</option>
              <option value="3">Option 3</option>
              <option value="4">Option 4</option>
              <option value="5">Option 5</option>
            </select>
          </div>
        ))}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default MEQForm;
