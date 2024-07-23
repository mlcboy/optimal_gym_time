import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import norm
import graphing_functions as graph

# Read the dataset
gym_data = pd.read_csv("https://raw.githubusercontent.com/moscmh/gym/main/crowdedness.csv")

# Convert 'date' column to datetime if necessary
gym_data['date'] = pd.to_datetime(gym_data['date'])

# Filter data to include only rows where 'is_during_semester' is 1
gym_data_during_semester = gym_data[gym_data['is_during_semester'] == 1]

# Group by 'day_of_week' and 'hour', then calculate the average 'number_people'
grouped_df = gym_data_during_semester.groupby(['day_of_week', 'hour'])['number_people'].mean().reset_index()

# Define days of the week
days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

# Get user input for the current day
current_day = days.index('Tuesday')  # Example input; replace with dynamic input

print(current_day)
# Times of the day in seconds with a step of ten minutes
times = np.arange(0, 86400, 600)  # 600 seconds = 10 minutes

# Shift the array to start from the wake-up time
wake_up_time = 7 * 3600
shifted_times = np.roll(times, -wake_up_time // 600)

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
optimal_time = (optimal_index * 600 + wake_up_time) % 86400

# Convert optimal time back to hours and minutes
optimal_hour = optimal_time // 3600
optimal_minute = (optimal_time % 3600) // 60
print(f"The optimal time to go to the gym is {optimal_hour:02}:{optimal_minute:02}")

# Plot the scores
plt.figure(figsize=(15, 10))

# Plot each factor with its weight
plt.plot(times / 3600, weighted_body_temp, label='Weighted Body Temperature Score', color='red', linestyle='--')
plt.plot(times / 3600, weighted_caffeine, label='Weighted Caffeine Score', color='blue', linestyle='--')
plt.plot(times / 3600, weighted_crowd, label='Weighted Crowd Score', color='green', linestyle='--')

# Plot the final score
plt.plot(times / 3600, final_scores, label='Final Score', color='black', linestyle='-', linewidth=2)
plt.axvline(optimal_time / 3600, color='purple', linestyle=':', label='Optimal Gym Time')

# Set the x-axis limits to show a full 24-hour period
plt.xlim(0, 23.9)

# Adjust x-axis to reflect hours starting from wake-up time, labeling every other hour
plt.xticks(ticks=np.arange(0, 24, 2), labels=[f'{(i + wake_up_time // 3600) % 24}:00' for i in range(0, 24, 2)])
plt.title('Optimal Gym Time Calculation with Weighted Factors')
plt.xlabel('Hour of the Day')
plt.ylabel('Score')
plt.grid(True)
plt.legend()
plt.show()
