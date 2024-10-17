import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BarChart from './BarChart';
import PieChart from './PieChart';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

// Register the components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ChartComponent = () => {
    const [selectedMonth, setSelectedMonth] = useState('');
    const [datasets, setDatasets] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [showBarModal, setShowBarModal] = useState(false);
    const [showPieModal, setShowPieModal] = useState(false);

    const [statistics, setStatistics] = useState(null);
    const [loadingStats, setLoadingStats] = useState(false);
    const [errorStats, setErrorStats] = useState('');

    const handleShowBarModal = () => setShowBarModal(true);
    const handleCloseBarModal = () => setShowBarModal(false);
    const handleShowPieModal = () => setShowPieModal(true);
    const handleClosePieModal = () => setShowPieModal(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/transactions');
                setDatasets(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    const filteredData = datasets.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.price.toString().includes(searchTerm)
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const handleChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page on search
    };

    const [month, setMonth] = useState(1); // Default to January
    const [year, setYear] = useState(2024); // Default to 2024

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Sales Dashboard</h1>

            <div style={styles.buttonContainer}>
                <button style={styles.button} onClick={handleShowBarModal}>Show Bar Chart</button>
                {showBarModal && (
                    <div style={styles.modal}>
                        <div style={styles.modalContent}>
                            <span style={styles.closeButton} onClick={handleCloseBarModal}>&times;</span>
                            <BarChart month={selectedMonth} onClose={handleCloseBarModal} />
                        </div>
                    </div>
                )}
            </div>

            <div style={styles.buttonContainer}>
                <button style={styles.button} onClick={handleShowPieModal}>Show Pie Chart</button>
                {showPieModal && (
                    <div style={styles.modal}>
                        <div style={styles.modalContent}>
                            <span style={styles.closeButton} onClick={handleClosePieModal}>&times;</span>
                            <h2>Sales Data</h2>
                            Month:
                            <select value={month} onChange={(e) => setMonth(e.target.value)}>
                                {[...Array(12).keys()].map(i => (
                                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                                ))}
                            </select>
                            <PieChart month={month} year={year} />
                        </div>
                    </div>
                )}
            </div>

            <h2 style={styles.tableTitle}>Product Transactions</h2>
            <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleChange}
                style={styles.searchInput}
            />

            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.tableHeader}>Title</th>
                        <th style={styles.tableHeader}>Description</th>
                        <th style={styles.tableHeader}>Price</th>
                        <th style={styles.tableHeader}>Date of Sale</th>
                        <th style={styles.tableHeader}>Category</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.map(item => (
                        <tr key={item.id}>
                            <td style={styles.tableCell}>{item.title}</td>
                            <td style={styles.tableCell}>{item.description}</td>
                            <td style={styles.tableCell}>${item.price}</td>
                            <td style={styles.tableCell}>{new Date(item.dateOfSale).toLocaleDateString()}</td>
                            <td style={styles.tableCell}>{item.category}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={styles.pagination}>
                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    style={styles.paginationButton}
                >
                    Previous
                </button>
                <span> Page {currentPage} of {totalPages} </span>
                <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    style={styles.paginationButton}
                >
                    Next
                </button>
            </div>

            {/* Display Statistics */}
            {loadingStats ? (
                <p>Loading statistics...</p>
            ) : errorStats ? (
                <p>{errorStats}</p>
            ) : statistics && (
                <div style={styles.statistics}>
                    <h3>Statistics for {selectedMonth}</h3>
                    <p>Total Sales: ${statistics.totalSales}</p>
                    <p>Total Sold Items: {statistics.totalSoldItems}</p>
                    <p>Total Not Sold Items: {statistics.totalNotSoldItems}</p>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    },
    title: {
        textAlign: 'center',
        color: '#333',
    },
    buttonContainer: {
        marginBottom: '20px',
        textAlign: 'center',
    },
    button: {
        padding: '10px 15px',
        margin: '0 10px',
        border: 'none',
        borderRadius: '5px',
        backgroundColor: '#007bff',
        color: '#fff',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
    modal: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        background: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        position: 'relative',
        width: '90%',
        maxWidth: '500px',
    },
    closeButton: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: '20px',
        color: '#ff0000',
    },
    tableTitle: {
        marginTop: '20px',
        textAlign: 'center',
    },
    searchInput: {
        width: '100%',
        padding: '10px',
        marginBottom: '20px',
        border: '1px solid #ccc',
        borderRadius: '5px',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '20px',
        backgroundColor: '#ffffff',
    },
    tableHeader: {
        backgroundColor: '#f7f7f7',
        padding: '12px',
        textAlign: 'left',
        fontWeight: 'bold',
        color: '#555',
        border: '1px solid #ddd',
    },
    tableCell: {
        padding: '12px',
        border: '1px solid #ddd',
        color: '#333',
    },
    pagination: {
        textAlign: 'center',
        marginTop: '20px',
    },
    paginationButton: {
        padding: '10px 15px',
        margin: '0 10px',
        border: 'none',
        borderRadius: '5px',
        backgroundColor: '#007bff',
        color: '#fff',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
    statistics: {
        marginTop: '20px',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        backgroundColor: '#f7f7f7',
    },
};

export default ChartComponent;
