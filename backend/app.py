from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pandas as pd
import numpy as np
from backend import graphing_functions as graph
import os

app = Flask(__name__, static_folder="../frontend/build", static_url_path="")
CORS(app)

# Load the dataset once at the start
gym_data = pd.read_csv("backend/gym_crowds.csv")
gym_data['date'] = pd.to_datetime(gym_data['date'])
gym_data_during_semester = gym_data[gym_data['is_during_semester'] == 1]

# Group by 'day_of_week' and 'hour', then calculate the average 'number_people'
grouped_df = gym_data_during_semester.groupby(['day_of_week', 'hour'])['number_people'].mean().reset_index()

# Chronotype peak times in seconds
chronotype_peaks = {
    "definite_evening": 19.4667 * 3600,  # 7:21 PM
    "moderate_evening": 18.9167 * 3600,  # 6:55 PM
    "intermediate": 18.35 * 3600,  # 6:21 PM
    "moderate_morning": 17.7833 * 3600,  # 5:47 PM
    "definite_morning": 17.2167 * 3600   # 5:13 PM
}

@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/optimal_gym_time', methods=['GET'])
def optimal_gym_time():
    # Get parameters from request
    current_day = request.args.get('day', default=1, type=int)
    wake_up_time = request.args.get('wake_up_time', default=7, type=int)
    drink_caffeine = request.args.get('drink_caffeine', default='false', type=str).lower() == 'true'
    has_eaten = request.args.get('has_eaten', default='false', type=str).lower() == 'true'
    crowdedness_weight = request.args.get('crowdedness_weight', default=0.2, type=float)
    chronotype = request.args.get('chronotype', default='intermediate', type=str)
    meal_type = request.args.get('meal_type', default='carbs', type=str)
    meal_time = request.args.get('meal_time', default=0, type=int)
    blocked_times = request.args.getlist('blocked_times')  # Get all blocked times
    print("Blocked Times Received:", blocked_times)
    
    # Adjust current_day to fit the dataset's day_of_week format (0 = Monday, 6 = Sunday)
    current_day = (current_day - 1) % 7  # Adjusting to 0-6 range

    # Parse blocked times
    parsed_blocked_times = []
    for blocked_time in blocked_times:
        try:
            start, end = map(int, blocked_time.split('-'))
            parsed_blocked_times.append((start * 3600, end * 3600))
        except ValueError as e:
            print(f"Error parsing blocked time {blocked_time}: {e}")

    # Times of the day in seconds with a step of ten minutes
    times = np.arange(0, 86400, 600)  # 600 seconds = 10 minutes

    # Input parameters
    peak_body_temp_time = chronotype_peaks.get(chronotype, 18.35 * 3600)  # Default to 6 PM if not found
    caffeine_best_time = wake_up_time * 3600    # Best time for caffeine intake at wake up time

    # Normalize each factor using the unshifted times array
    body_temp_scores = graph.normalize_bell_curve(times, peak_body_temp_time)
    if drink_caffeine:
        caffeine_scores = graph.normalize_exponential_decay(times, caffeine_best_time)
    else:
        caffeine_scores = np.zeros_like(times)
    crowd_scores = graph.normalize_crowdedness(times, grouped_df, current_day)

    # Initialize meal scores to zero
    meal_scores = np.zeros_like(times)
    
    if has_eaten:
        std = 0.5
        if meal_type == "carbs": 
            peak_meal_time = (meal_time + 1) * 3600
            std = 0.5
            weight_meal = 0.15
        elif meal_type == "carbs and protein":
            peak_meal_time = (meal_time + 2) * 3600
            std = 0.75
            weight_meal = 0.2
        else: #fat
            peak_meal_time = (meal_time + 3) * 3600
            std = 1
            weight_meal = 0.1
        meal_scores = graph.normalize_bell_curve(times, peak_meal_time, std)

    # Assign weights to each factor
    weight_body_temp = 0.5
    weight_caffeine = 0.2 if drink_caffeine else 0
    weight_crowd = crowdedness_weight
    if not has_eaten: weight_meal = 0

    # Calculate weighted scores for each factor
    weighted_body_temp = weight_body_temp * body_temp_scores
    weighted_caffeine = weight_caffeine * caffeine_scores
    weighted_crowd = weight_crowd * crowd_scores
    weighted_meal = weight_meal * meal_scores

    # Combine the factors to get the final score for each time
    final_scores = weighted_body_temp + weighted_caffeine + weighted_crowd + weighted_meal

    # Adjust final scores to ignore blocked times
    for start, end in parsed_blocked_times:
        for i in range(len(times)):
            if start <= times[i] < end:
                # Ensure arrays are not empty or undefined before modifying them
                if len(weighted_body_temp) > i:
                    weighted_body_temp[i] = 0
                if len(weighted_caffeine) > i:
                    weighted_caffeine[i] = 0
                if len(weighted_crowd) > i:
                    weighted_crowd[i] = 0
                if len(weighted_meal) > i:
                    weighted_meal[i] = 0
                
                # Set the final score to 0
                final_scores[i] = 0

    # Find the index with the highest score (from the unshifted times)
    optimal_index = np.argmax(final_scores)
    optimal_time_in_seconds = times[optimal_index]

    # Convert optimal time back to hours and minutes
    optimal_hour = int(optimal_time_in_seconds // 3600)
    optimal_minute = int((optimal_time_in_seconds % 3600) // 60)
    formatted_optimal_time = f"{optimal_hour:02}:{optimal_minute:02}"

    # Print the optimal time on the backend
    print(f"The optimal time to go to the gym is {formatted_optimal_time}")

    # Shift the x-axis labels so that the wake-up time is the first label
    shift_by = wake_up_time * 6  # Calculate the shift amount
    shifted_labels = np.roll(times, -shift_by)  # Shift times by wake-up time
    shifted_labels_in_hours = [(int(label) // 3600) % 24 for label in shifted_labels]  # Convert to hours

    # Shift the datasets to align with the shifted labels
    shifted_body_temp_scores = np.roll(weighted_body_temp, -shift_by).tolist()
    shifted_caffeine_scores = np.roll(weighted_caffeine, -shift_by).tolist()
    shifted_crowd_scores = np.roll(weighted_crowd, -shift_by).tolist()
    shifted_meal_scores = np.roll(weighted_meal, -shift_by).tolist()
    shifted_final_scores = np.roll(final_scores, -shift_by).tolist()

    # Return the optimal time and shifted datasets as a string with leading zeros if necessary
    return jsonify({
        'times': shifted_labels_in_hours,  # Use shifted times for x-axis labels
        'body_temp_scores': shifted_body_temp_scores,
        'caffeine_scores': shifted_caffeine_scores,
        'crowd_scores': shifted_crowd_scores,
        'meal_scores': shifted_meal_scores,
        'final_scores': shifted_final_scores,
        'optimal_time': formatted_optimal_time
    })


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))  # Get the port from the environment variable or default to 5000
    app.run(host='0.0.0.0', port=port)  # Run the app on all interfaces