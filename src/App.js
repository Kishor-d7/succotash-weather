import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [city, setCity] = useState('New York');
  const [forecastType, setForecastType] = useState('daily'); // 'daily' or 'hourly'
  const [weatherData, setWeatherData] = useState(null);
  const [hourlyForecast, setHourlyForecast] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState('');

  // Get background image based on the weather
  const getBackgroundImage = useCallback((condition) => {
    if (condition.includes('rain')) {
      return 'rainy.jpg';  // Use your image paths here
    } else if (condition.includes('clear')) {
      return 'sunny.jpg';
    } else {
      return 'cloudy.jpg';
    }
  }, []);

  // Get day or night based on the time of day
  const getDayOrNight = useCallback((time) => {
    const hour = new Date(time).getHours();
    return hour >= 6 && hour < 18 ? 'day' : 'night';
  }, []);

  // Fetch hourly forecast
  const fetchHourlyForecast = useCallback(async (city) => {
    const apiKey = 'BfwFT-hjeWonPODEFKd3sghjrGsTcAcVwijCdIVef_0'; // Your provided API key
    try {
      const response = await axios.get('http://api.weatherapi.com/v1/forecast.json', {
        params: { key: apiKey, q: city, hours: 24 }
      });
      const data = response.data;
      setHourlyForecast(data.forecast.forecastday[0].hour);  // Assuming the first day has hourly data
    } catch (error) {
      console.error('Error fetching hourly forecast:', error);
    }
  }, []);

  // Fetch weather data for a city
  const fetchWeather = useCallback(async (city) => {
    const apiKey = 'BfwFT-hjeWonPODEFKd3sghjrGsTcAcVwijCdIVef_0'; // Your provided API key
    try {
      const response = await axios.get('http://api.weatherapi.com/v1/forecast.json', {
        params: { key: apiKey, q: city, days: 1 }
      });
      const data = response.data;
      setWeatherData(data);

      const condition = data.current.condition.text.toLowerCase();
      setBackgroundImage(getBackgroundImage(condition));

      // If the forecast type is hourly, fetch hourly data
      if (forecastType === 'hourly') {
        fetchHourlyForecast(city);
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
    }
  }, [forecastType, getBackgroundImage, fetchHourlyForecast]);

  // Fetch weather when the component mounts or when city changes
  useEffect(() => {
    fetchWeather(city);
  }, [city, forecastType, fetchWeather]);

  return (
    <div style={{ backgroundImage: `url(${backgroundImage})` }}>
      <h1>Weather App</h1>
      <input 
        type="text" 
        value={city} 
        onChange={(e) => setCity(e.target.value)} 
        placeholder="Enter city" 
      />
      <div>
        <button onClick={() => setForecastType('daily')}>Daily</button>
        <button onClick={() => setForecastType('hourly')}>Hourly</button>
      </div>

      {weatherData && (
        <div>
          <h2>{weatherData.location.name}</h2>
          <p>{weatherData.current.temp_c}°C</p>
          <p>{weatherData.current.condition.text}</p>
          <p>{getDayOrNight(weatherData.location.localtime)}</p>
        </div>
      )}

      {forecastType === 'hourly' && hourlyForecast && (
        <div>
          <h3>Hourly Forecast</h3>
          {hourlyForecast.map((hour, index) => (
            <div key={index}>
              <p>{new Date(hour.time).toLocaleTimeString()}</p>
              <p>{hour.temp_c}°C</p>
              <p>{hour.condition.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
