import axios from 'axios'; 
import {
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip
} from 'chart.js';
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Oval } from 'react-loader-spinner';
import './App.css';
import Chatbot from './Chatbot';

ChartJS.register(LineElement, CategoryScale, LinearScale, Title, Tooltip, Legend, PointElement);

function WeatherApp() {
    const [input, setInput] = useState('');
    const [weather, setWeather] = useState({ loading: false, data: {}, error: false });
    const [background, setBackground] = useState('');
    const [chartData, setChartData] = useState(null);
    const [forecastType, setForecastType] = useState('temperature'); // Default forecast type
    const [suggestion, setSuggestion] = useState('');

    const getDayOrNight = (timeZone) => {
        const date = new Date();
        const localTime = new Date(date.toLocaleString('en-US', { timeZone }));
        const hour = localTime.getHours();
        return hour >= 6 && hour < 18 ? 'day' : 'night';
    };

    const getBackgroundImage = async (condition, timeOfDay) => {
        const apiKey = 'BfwFT-hjeWonPODEFKd3sghjrGsTcAcVwijCdIVef_0';
        let query = `${condition} ${timeOfDay}`;
        try {
            const response = await axios.get('https://api.unsplash.com/search/photos', {
                params: { query, client_id: apiKey, per_page: 1 }
            });
            return response.data.results[0]?.urls?.regular || '/default-background.jpg';
        } catch (error) {
            console.error('Error fetching background image:', error);
            return '/default-background.jpg';
        }
    };

    const fetchHourlyForecast = async (city, selectedForecastType = forecastType) => {
        const apiKey = '73df865263c04ad286852023241209';
        try {
            const response = await axios.get('http://api.weatherapi.com/v1/forecast.json', {
                params: { key: apiKey, q: city, hours: 24 }
            });
            const hourlyData = response.data.forecast.forecastday[0].hour;
            const labels = hourlyData.map(hour =>
                new Date(hour.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            );

            const datasets = {
                temperature: {
                    label: 'Temperature (°C)',
                    data: hourlyData.map(hour => hour.temp_c),
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)'
                },
                humidity: {
                    label: 'Humidity (%)',
                    data: hourlyData.map(hour => hour.humidity),
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)'
                },
                pressure: {
                    label: 'Pressure (mb)',
                    data: hourlyData.map(hour => hour.pressure_mb),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)'
                },
                precipitation: {
                    label: 'Precipitation (mm)',
                    data: hourlyData.map(hour => hour.precip_mm),
                    borderColor: 'rgba(153, 102, 255, 1)',
                    backgroundColor: 'rgba(153, 102, 255, 0.2)'
                }
            };

            setChartData({
                labels,
                datasets: [datasets[selectedForecastType]]
            });
        } catch (error) {
            console.error('Error fetching hourly forecast:', error);
        }
    };

    const getSuggestions = (condition) => {
        const lowerCondition = condition.toLowerCase();
        
        if (lowerCondition.includes('sunny')) {
            return 'Suggestions: Stay hydrated and wear sunscreen!';
        } else if (lowerCondition.includes('rain')) {
            return 'Suggestions: Carry an umbrella and wear waterproof clothing.';
        } else if (lowerCondition.includes('snow')) {
            return 'Suggestions: Dress warmly and avoid travel if possible.';
        } else if (lowerCondition.includes('cloudy')) {
            return 'Suggestions: A light jacket should be enough.';
        } else if (lowerCondition.includes('fog')) {
            return 'Suggestions: Drive carefully and use fog lights if driving.';
        } else if (lowerCondition.includes('storm')) {
            return 'Suggestions: Stay indoors and avoid open areas!';
        } else if (lowerCondition.includes('windy')) {
            return 'Suggestions: Secure loose items and be cautious while driving.';
        } else if (lowerCondition.includes('overcast')) {
            return 'Suggestions: It might feel a bit cooler, so wear layers.';
        } else if (lowerCondition.includes('drizzle')) {
            return 'Suggestions: A light umbrella should suffice.';
        } else {
            return 'Suggestions: Check the weather for specific tips.';
        }
    };

    const fetchWeather = async (city) => {
        setWeather({ loading: true, data: {}, error: false });
        const apiKey = '73df865263c04ad286852023241209';
        try {
            const response = await axios.get('http://api.weatherapi.com/v1/current.json', {
                params: { key: apiKey, q: city }
            });
            const { current, location } = response.data;
            const condition = current.condition.text;
            const timeOfDay = getDayOrNight(location.tz_id);
            const image = await getBackgroundImage(condition, timeOfDay);

            setBackground(image);
            setWeather({ loading: false, data: response.data, error: false });
            fetchHourlyForecast(city);
            setSuggestion(getSuggestions(condition));
        } catch (error) {
            console.error('Error fetching weather data:', error);
            setWeather({ loading: false, data: {}, error: true });
        }
    };

    useEffect(() => {
        if (input) {
            fetchWeather(input);
        }
    }, [input]);

    const handleSearchChange = (event) => {
        setInput(event.target.value);
    };

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        if (input.trim()) {
            fetchWeather(input);
        }
    };

    const handleForecastChange = (event) => {
        setForecastType(event.target.value);
        if (weather.data.location) {
            fetchHourlyForecast(weather.data.location.name, event.target.value);
        }
    };

    const currentDate = weather.data.location
        ? new Date(weather.data.location.localtime).toLocaleDateString()
        : '';

    return (
        <div className="App" style={{ backgroundImage: `url(${background})` }}>
            <div className="header">
                <h1 className="title">Weather Forecast</h1>
            </div>

            <div className="search-bar">
                <form onSubmit={handleSearchSubmit}>
                    <input
                        type="text"
                        value={input}
                        onChange={handleSearchChange}
                        placeholder="Enter city"
                        className="city-search"
                    />
                </form>
            </div>

            {weather.loading && (
                <div className="loader">
                    <Oval color="#007bff" height={80} width={80} />
                </div>
            )}

            {weather.error && (
                <div className="error-message">City not found. Please try again.</div>
            )}

            {!weather.loading && weather.data.current && (
                <div className="weather-info">
                    <h2>Weather in {weather.data.location.name} on {currentDate}</h2>
                    <div className="current-weather">
                        <h3>Condition: {weather.data.current.condition.text}</h3>
                        <div className="temp">{weather.data.current.temp_c}°C</div>
                        <h4>Feels like: {weather.data.current.feelslike_c}°C</h4>
                        <h4>Humidity: {weather.data.current.humidity}%</h4>
                        <h4>Pressure: {weather.data.current.pressure_mb} mb</h4>
                    </div>
                    <div className="forecast-dropdown">
                        <label htmlFor="forecastType">Select forecast type: </label>
                        <select id="forecastType" value={forecastType} onChange={handleForecastChange}>
                            <option value="temperature">Temperature</option>
                            <option value="humidity">Humidity</option>
                            <option value="pressure">Pressure</option>
                            <option value="precipitation">Precipitation</option>
                        </select>
                    </div>
                    {chartData && (
                        <div className="chart-container">
                            <Line
                                data={chartData}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: {
                                            display: true,
                                            position: 'top'
                                        },
                                        title: {
                                            display: true,
                                            text: `${forecastType.charAt(0).toUpperCase() + forecastType.slice(1)} Forecast`
                                        }
                                    }
                                }}
                            />
                        </div>
                    )}
                    <div className="suggestions">
                        <h4>{suggestion}</h4>
                    </div>
                </div>
            )}

            <div className="chatbot">
                <Chatbot />
            </div>
        </div>
    );
}

export default WeatherApp;
