import axios from 'axios'; // Import axios for HTTP requests
import React, { useState } from 'react';
import './Chatbot.css'; // Ensure you import the stylesheet

const API_KEY = '740be88f0981c6b4e261d692b35d6f8c'; // Your WeatherStack API key
const BASE_URL = 'http://api.weatherstack.com/current';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

  const fetchWeather = async (location) => {
    try {
      const response = await axios.get(`${BASE_URL}?access_key=${API_KEY}&query=${location}`);
      const data = response.data;
      
      if (data.current) {
        const weatherInfo = `Current weather in ${data.location.name}: ${data.current.temperature}°C, ${data.current.weather_descriptions[0]}`;
        setMessages((prevMessages) => [...prevMessages, { text: weatherInfo, type: 'bot' }]);
      } else {
        setMessages((prevMessages) => [...prevMessages, { text: 'Sorry, I could not retrieve the weather information.', type: 'bot' }]);
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setMessages((prevMessages) => [...prevMessages, { text: 'Sorry, there was an error fetching the weather data.', type: 'bot' }]);
    }
  };

  const handleSendMessage = () => {
    if (input.trim() === '') return;

    // Add the user's message to the chat history
    setMessages((prevMessages) => [...prevMessages, { text: input, type: 'user' }]);

    // Clear the input field
    setInput('');

    // Check for weather-related queries
    if (input.toLowerCase().includes('weather in')) {
      const location = input.split('weather in')[1].trim();
      fetchWeather(location);
    } else {
      // Simulate a default response
      setTimeout(() => {
        setMessages((prevMessages) => [...prevMessages, { text: 'Chatbot response here', type: 'bot' }]);
      }, 500);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chat-window">
        <div className="messages">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.type}`}>
              {message.text}
            </div>
          ))}
        </div>
        <div className="input-container">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
