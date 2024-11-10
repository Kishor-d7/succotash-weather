import React from 'react';
import { Line } from 'react-chartjs-2';

const ChartPage = () => {
	const data = {
		labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], // You can dynamically add days here
		datasets: [
			{
				label: 'Temperature in °C',
				data: [22, 24, 19, 23, 26], // Example temperature data
				backgroundColor: 'rgba(75, 192, 192, 0.6)',
				borderColor: 'rgba(75, 192, 192, 1)',
				borderWidth: 2,
				fill: true,
			},
		],
	};

	const options = {
		scales: {
			y: {
				beginAtZero: true,
			},
		},
	};

	return (
		<div className="chart-container">
			<h2>Weather Data Visualization</h2>
			<Line data={data} options={options} />
		</div>
	);
};

export default ChartPage;
