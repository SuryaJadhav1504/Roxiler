import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TransactionsTable = () => {
    const [transactions, setTransactions] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [perPage] = useState(10);
    const [search, setSearch] = useState('');
    const [month, setMonth] = useState(3); // Default to March

    useEffect(() => {
        fetchTransactions();
    }, [month, page, search]);

    const fetchTransactions = async () => {
        setLoading(true); // Start loading
        try {
            const response = await axios.get(`/api/transactions`, {
                params: {
                    month,
                    search,
                    page,
                    perPage
                }
            });
            setTransactions(response.data.transactions);
            setTotal(response.data.total);
        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setLoading(false); // Stop loading
        }
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1); // Reset to first page on search
    };

    const handleMonthChange = (e) => {
        setMonth(Number(e.target.value));
        setPage(1); // Reset to first page when changing month
    };

    return (
        <div style={styles.container}>
            <h3 style={styles.header}>Transactions for {monthNames[month - 1]}</h3>
            <div style={styles.controls}>
                <select value={month} onChange={handleMonthChange} style={styles.select}>
                    {monthNames.map((name, index) => (
                        <option key={index} value={index + 1}>{name}</option>
                    ))}
                </select>
                <input 
                    type="text" 
                    placeholder="Search..." 
                    value={search} 
                    onChange={handleSearch} 
                    style={styles.searchInput} 
                />
            </div>
            {loading ? (
                <p style={styles.loading}>Loading...</p>
            ) : (
                <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                        <tr>
                            <th style={styles.tableHeaderCell}>Title</th>
                            <th style={styles.tableHeaderCell}>Description</th>
                            <th style={styles.tableHeaderCell}>Price</th>
                            <th style={styles.tableHeaderCell}>Date of Sale</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map(transaction => (
                            <tr key={transaction._id} style={styles.tableRow}>
                                <td style={styles.tableCell}>{transaction.productTitle}</td>
                                <td style={styles.tableCell}>{transaction.productDescription}</td>
                                <td style={styles.tableCell}>${transaction.price.toFixed(2)}</td>
                                <td style={styles.tableCell}>{new Date(transaction.dateOfSale).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <div style={styles.pagination}>
                <button 
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))} 
                    disabled={page === 1} 
                    style={styles.button}
                >
                    Previous
                </button>
                <button 
                    onClick={() => setPage(prev => Math.min(prev + 1, Math.ceil(total / perPage)))} 
                    disabled={page * perPage >= total} 
                    style={styles.button}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

// Month names for dropdown
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const styles = {
    container: {
        padding: '20px',
        maxWidth: '900px',
        margin: '0 auto',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#ffffff',
        backgroundImage: 'linear-gradient(to right, #f9f9f9, #eaeaea)',
    },
    header: {
        textAlign: 'center',
        marginBottom: '20px',
        color: '#333',
    },
    controls: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '20px',
    },
    select: {
        padding: '10px',
        marginRight: '10px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        fontSize: '16px',
    },
    searchInput: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        fontSize: '16px',
        boxShadow: '0 1px 5px rgba(0, 0, 0, 0.1)',
    },
    loading: {
        textAlign: 'center',
        color: '#555',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        backgroundColor: '#fff',
    },
    tableHeader: {
        backgroundColor: '#f7f7f7',
    },
    tableHeaderCell: {
        padding: '12px',
        border: '1px solid #ddd',
        textAlign: 'left',
        fontWeight: 'bold',
        color: '#555',
    },
    tableRow: {
        '&:hover': {
            backgroundColor: '#f1f1f1',
        },
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
};

export default TransactionsTable;
