from flask import Flask, request, jsonify, send_file
import pandas as pd
import numpy as np
import graphing_functions as graph

app = Flask(__name__)

def convert_np_types(data):
    if isinstance(data, dict):
        return {k: convert_np_types(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [convert_np_types(i) for i in data]
    elif isinstance(data, np.generic):
        return data.item()
    elif isinstance(data, np.ndarray):
        return data.tolist()
    else:
        return data

@app.route('/')
def index():
    return send_file('index.html')

@app.route('/optimal_gym_time', methods=['GET'])
def optimal_gym_time():
    current_day = request.args.get('day', default=1, type=int)
    wake_up_time = request.args.get('wake_up_time', default=7, type=int)

    # Read the dataset
    gym_data = pd.read_csv("https://raw.githubusercontent.com/moscmh/gym/main/crowdedness.csv")

    # Convert 'date' column to datetime if necessary
    gym_data['date'] = pd.to_datetime(gym_data['date'])

    # Filter data to include only rows where 'is_during_semester' is 1
    gym_data_during_semester = gym_data[gym_data['is_during_semester'] == 1]

    # Group by 'day_of_week' and 'hour', then calculate the average 'number_people'
    grouped_df = gym_data_during_semester.groupby(['day_of_week', 'hour'])['number_people'].mean().reset_index()

    # Times of the day in seconds with a step of ten minutes
    times = np.arange(0, 86400, 600)  # 600 seconds = 10 minutes

    # Shift the array to start from the wake-up time
    wake_up_time_sec = wake_up_time * 3600
    shifted_times = np.roll(times, -wake_up_time_sec // 600)

    # Input parameters
    peak_body_temp_time = 18 * 3600  # Peak body temperature at 6 PM
    caffeine_best_time = 7 * 3600    # Best time for caffeine intake at 7 AM

    # Normalize each factor
    body_temp_scores = graph.normalize_bell_curve(shifted_times, peak_body_temp_time)
    caffeine_scores = graph.normalize_exponential_decay(shifted_times, caffeine_best_time)
    crowd_scores = graph.normalize_crowdedness(shifted_times, grouped_df, current_day)

    # Assign weights to each factor
    weight_body_temp = 0.5
    weight_caffeine = 0.3
    weight_crowd = 0.2

    # Calculate weighted scores for each factor
    weighted_body_temp = weight_body_temp * body_temp_scores
    weighted_caffeine = weight_caffeine * caffeine_scores
    weighted_crowd = weight_crowd * crowd_scores

    # Combine the factors to get the final score for each time
    final_scores = weighted_body_temp + weighted_caffeine + weighted_crowd

    # Find the time with the highest score
    optimal_index = np.argmax(final_scores)
    optimal_time = (optimal_index * 600 + wake_up_time_sec) % 86400

    # Convert optimal time back to hours and minutes
    optimal_hour = optimal_time // 3600
    optimal_minute = (optimal_time % 3600) // 60

    result = {
        'optimal_hour': optimal_hour,
        'optimal_minute': optimal_minute
    }

    # Convert NumPy types to native Python types
    result = convert_np_types(result)

    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
