import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import norm

def normalize_bell_curve(times, peak_time, std_dev=4):
    """Normalize value using a bell curve centered at peak_time, considering wrap-around."""
    times = np.array(times)
    
    # Adjust times to consider the wrap-around
    adjusted_times = (times - peak_time) % 86400
    
    # Handle the wrap-around
    adjusted_times = np.where(adjusted_times > 43200, adjusted_times - 86400, adjusted_times)
    
    # Calculate the bell curve
    bell_curve = norm.pdf(adjusted_times / 3600, 0, std_dev)
    
    # Normalize the bell curve
    normalized_value = (bell_curve - bell_curve.min()) / (bell_curve.max() - bell_curve.min())
    return normalized_value

def normalize_exponential_decay(times, peak_time, decay_rate=0.1386):
    """Normalize value using an exponential decay function centered at peak_time, considering wrap-around."""
    times = np.array(times)
    
    # Adjust times to consider the wrap-around
    adjusted_times = (times - peak_time) % 86400
    
    # Calculate the exponential decay curve
    decay_curve = np.exp(-decay_rate * np.abs(adjusted_times) / 3600)
    
    # Normalize the decay curve
    normalized_value = (decay_curve - decay_curve.min()) / (decay_curve.max() - decay_curve.min())
    return normalized_value

def normalize_crowdedness(times, crowdedness_data, current_day):
    """Normalize value using crowdedness data, considering the current day, and invert the scores."""
    times = np.array(times) / 3600  # Convert seconds to hours
    
    # Get crowdedness data for the current day
    day_data = crowdedness_data[crowdedness_data['day_of_week'] == current_day].copy()
    
    # Ensure all hour values are present in the dataset
    all_hours = pd.DataFrame({'hour': np.arange(24)})
    day_data = pd.merge(all_hours, day_data, on='hour', how='left').fillna(method='ffill').fillna(method='bfill')
    
    # Create a finer grid for interpolation (every 10 minutes)
    finer_hours = np.arange(0, 24, 1/6)  # 1/6 hour = 10 minutes
    day_data_finer = pd.DataFrame({'hour': finer_hours})
    day_data_finer['number_people'] = np.interp(day_data_finer['hour'], day_data['hour'], day_data['number_people'])
    
    # Interpolate crowdedness scores for finer grid
    crowdedness_scores = np.interp(times, day_data_finer['hour'], day_data_finer['number_people'])
    
    # Normalize the scores
    max_crowdedness = day_data_finer['number_people'].max()
    min_crowdedness = day_data_finer['number_people'].min()
    if max_crowdedness == min_crowdedness:
        return np.ones_like(times) if max_crowdedness > 0 else np.zeros_like(times)
    
    normalized_value = (crowdedness_scores - min_crowdedness) / (max_crowdedness - min_crowdedness)
    
    # Invert the normalized value
    inverted_value = 1 - normalized_value
    
    return inverted_value