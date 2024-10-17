import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';

const BarChart = () => {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [month, setMonth] = useState(new Date().getMonth() + 1); // Default to current month
    const [year, setYear] = useState(new Date().getFullYear()); // Default to current year
    const [months] = useState(Array.from({ length: 12 }, (v, i) => i + 1)); // Array for months
    const [years] = useState(Array.from({ length: 5 }, (v, i) => new Date().getFullYear() - i)); // Last 5 years

    const fetchBarData = async () => {
        try {
            const result = await axios.get(`http://localhost:5000/api/bar-chart/monthly`, {
                params: { month, year }
            });
            const chartData = {
                labels: result.data.map(item => item.label),
                datasets: [{
                    label: 'Number of Items',
                    data: result.data.map(item => item.count),
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                }],
            };
            setData(chartData);
        } catch (error) {
            console.error("Error fetching bar chart data:", error.response ? error.response.data : error.message);
            setError("Failed to load data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBarData();
    }, [month, year]); // Fetch data whenever month or year changes

    return (
        <div style={{width:'100%',height:'500px'}}>
            <h3>Bar Chart of Items Sold by Price Range</h3>
            <div >
                <select value={month} onChange={e => setMonth(e.target.value)}>
                    {months.map(m => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </select>
                <select value={year} onChange={e => setYear(e.target.value)}>
                    {years.map(y => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
                {/* <button onClick={fetchBarData}>Fetch Data</button> */}
            </div>
            {loading ? <p>Loading...</p> : error ? <p>{error}</p> : <Bar data={data} options={{ responsive: true }} />}
        </div>
    );
};

export default BarChart;
