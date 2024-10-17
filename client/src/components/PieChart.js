import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import axios from 'axios';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

// Register the necessary components
Chart.register(ArcElement, Tooltip, Legend);

const PieChart = ({ month, onClose }) => {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchPieData = async () => {
        console.log("Fetching data for Month:", month); // Log the month
        setLoading(true);
        try {
            const result = await axios.get(`http://localhost:5000/api/pie-chart`, {
                params: { month }
            });
            const chartData = {
                labels: result.data.map(item => item.category), // Use category for labels
                datasets: [{
                    data: result.data.map(item => item.count),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
                        'rgba(255, 159, 64, 0.6)',
                    ],
                }],
            };
            console.log("Chart data prepared:", chartData); // Log prepared chart data
            setData(chartData);
        } catch (error) {
            console.error("Error fetching pie chart data:", error.response ? error.response.data : error.message);
            setError("Failed to load data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPieData();
    }, [month]);

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => {
                        const label = tooltipItem.label || '';
                        const count = tooltipItem.raw || 0;
                        return `${label}: ${count} items`;
                    },
                },
            },
        },
    };

    return (
        <div style={{
            background: '#fff',
            // border: '1px solid #ccc',
            borderRadius: '8px',
            // boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            padding: '20px',
            // width: '100%',
            height: '550px',
            position: 'relative',
        }}>
            <h3 style={{ textAlign: 'center' }}>Pie Chart of Items Sold by Category</h3>
            
            {loading ? (
                <p style={{ textAlign: 'center' }}>Loading...</p>
            ) : error ? (
                <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
            ) : (data.labels && data.labels.length > 0 ? (
                <Pie data={data} options={chartOptions} />
            ) : (
                <p style={{ textAlign: 'center' }}>No data available for this period.</p>
            ))}
        </div>
    );
};

export default PieChart;
