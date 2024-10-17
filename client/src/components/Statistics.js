import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Statistics = () => {
    const [stats, setStats] = useState({ totalSales: 0, totalSoldItems: 0, totalNotSoldItems: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [month, setMonth] = useState(new Date().getMonth() + 1); // Default to current month
    const [year, setYear] = useState(new Date().getFullYear()); // Default to current year
    const [months] = useState(Array.from({ length: 12 }, (v, i) => i + 1)); // Array for months
    const [years] = useState(Array.from({ length: 5 }, (v, i) => new Date().getFullYear() - i)); // Last 5 years

    const fetchStatistics = async () => {
        try {
            const result = await axios.get(`http://localhost:5000/api/statistics`, {
                params: { month: `${year}-${month.toString().padStart(2, '0')}` }
            });
            setStats(result.data);
        } catch (error) {
            console.error("Error fetching statistics:", error.response ? error.response.data : error.message);
            setError("Failed to load data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatistics();
    }, [month, year]); // Fetch data whenever month or year changes

    return (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '20px' }}>
            <div style={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                padding: '20px',
                width: '300px',
                backgroundColor: '#fff'
            }}>
                <h3 style={{ textAlign: 'center' }}>Monthly Statistics</h3>
                <div style={{ marginBottom: '15px' }}>
                    <select value={month} onChange={e => setMonth(e.target.value)} style={{ marginRight: '10px' }}>
                        {months.map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                    <select value={year} onChange={e => setYear(e.target.value)}>
                        {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
                {loading ? (
                    <p style={{ textAlign: 'center' }}>Loading...</p>
                ) : error ? (
                    <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
                ) : (
                    <div>
                        <p>Total Sales: ${stats.totalSales}</p>
                        <p>Total Sold Items: {stats.totalSoldItems}</p>
                        <p>Total Not Sold Items: {stats.totalNotSoldItems}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Statistics;
