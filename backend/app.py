from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import graphing_functions as graph
from io import BytesIO
import base64

app = Flask(__name__, static_folder="../frontend/build", static_url_path="")
CORS(app)

# Load the dataset once at the start
gym_data = pd.read_csv("gym_crowds.csv")
gym_data['date'] = pd.to_datetime(gym_data['date'])
gym_data_during_semester = gym_data[gym_data['is_during_semester'] == 1]

# Group by 'day_of_week' and 'hour', then calculate the average 'number_people'
grouped_df = gym_data_during_semester.groupby(['day_of_week', 'hour'])['number_people'].mean().reset_index()

chronotype_peaks = {
    "definite_evening": 19.4667 * 3600,  #7:21 PM
    "moderate_evening": 18.9167 * 3600,  #6:55 PM
    "intermediate": 18.35 * 3600,  #6:21 PM
    "moderate_morning": 17.7833 * 3600,  #5:47 PM
    "definite_morning": 17.2167 * 3600   #5:13 PM
}

@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/optimal_gym_time', methods=['GET'])
def optimal_gym_time():
    current_day = request.args.get('day', default=1, type=int)
    wake_up_time = request.args.get('wake_up_time', default=7, type=int)
    drink_caffeine = request.args.get('drink_caffeine', default='false', type=str).lower() == 'true'
    crowdedness_weight = request.args.get('crowdedness_weight', default=0.2, type=float)
    chronotype = request.args.get('chronotype', default='intermediate', type=str)

    # Adjust current_day to fit the dataset's day_of_week format (0 = Monday, 6 = Sunday)
    current_day = (current_day - 1) % 7  # Adjusting to 0-6 range

    # Times of the day in seconds with a step of ten minutes
    times = np.arange(0, 86400, 600)  # 600 seconds = 10 minutes

    # Shift the array to start from the wake-up time
    wake_up_time_seconds = wake_up_time * 3600
    shifted_times = np.roll(times, -wake_up_time_seconds // 600)

    # Input parameters
    peak_body_temp_time = chronotype_peaks.get(chronotype, 18.35 * 3600)  # Default to 6 PM if not found
    caffeine_best_time = wake_up_time * 3600    # Best time for caffeine intake at 7 AM

    # Normalize each factor
    body_temp_scores = graph.normalize_bell_curve(shifted_times, peak_body_temp_time)
    if drink_caffeine:
        caffeine_scores = graph.normalize_exponential_decay(shifted_times, caffeine_best_time)
    else:
        caffeine_scores = np.zeros_like(shifted_times)
    crowd_scores = graph.normalize_crowdedness(shifted_times, grouped_df, current_day)

    # Assign weights to each factor
    weight_body_temp = 0.4
    weight_caffeine = 0.2 if drink_caffeine else 0
    weight_crowd = crowdedness_weight

    # Calculate weighted scores for each factor
    weighted_body_temp = weight_body_temp * body_temp_scores
    weighted_caffeine = weight_caffeine * caffeine_scores
    weighted_crowd = weight_crowd * crowd_scores

    # Combine the factors to get the final score for each time
    final_scores = weighted_body_temp + weighted_caffeine + weighted_crowd

    # Find the time with the highest score
    optimal_index = np.argmax(final_scores)
    optimal_time = (optimal_index * 600 + wake_up_time_seconds) % 86400

    # Convert optimal time back to hours and minutes
    optimal_hour = int(optimal_time // 3600)
    optimal_minute = int((optimal_time % 3600) // 60)
    print(f"The optimal time to go to the gym is {optimal_hour:02}:{optimal_minute:02}")

    # Return the optimal time as a string with leading zeros if necessary
    return jsonify({
        'times': times.tolist(),  # Convert numpy array to list
        'body_temp_scores': weighted_body_temp.tolist(),
        'caffeine_scores': weighted_caffeine.tolist(),
        'crowd_scores': weighted_crowd.tolist(),
        'final_scores': final_scores.tolist(),
    })

if __name__ == '__main__':
    app.run(debug=True)
