const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');


// Fetch all transactions
router.get('/api/transactions', async (req, res) => {
    try {
      const transactions = await Transaction.find({});
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

// Initialize database with data from external API
router.post('/init', async (req, res) => {
    const response = await fetch('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const data = await response.json();
    await Transaction.deleteMany({});
    await Transaction.insertMany(data);
    res.status(201).send('Database initialized');
});

// List transactions with pagination and search
router.get('/', async (req, res) => {
    const { month, search, page = 1, perPage = 10 } = req.query;
    const query = month ? { dateOfSale: { $regex: month, $options: 'i' } } : {};
    const transactions = await Transaction.find(query)
        .or([{ productTitle: { $regex: search, $options: 'i' } }, { productDescription: { $regex: search, $options: 'i' } }, { price: search }])
        .skip((page - 1) * perPage)
        .limit(perPage);
    
    const total = await Transaction.countDocuments(query);
    res.json({ transactions, total });
});

// Get statistics for the selected month
router.get('/api/statistics', async (req, res) => {
    const month = req.query.month; // Format: 'YYYY-MM'
    if (!month) {
        return res.status(400).json({ error: 'Month is required' });
    }

    // Split the month into year and month
    const [year, monthNumber] = month.split('-');
    const startDate = new Date(year, monthNumber - 1, 1); // Start of the month
    const endDate = new Date(year, monthNumber, 1); // Start of the next month

    try {
        // Fetch total sales and total sold items
        const totalSalesData = await Transaction.aggregate([
            { $match: { dateOfSale: { $gte: startDate, $lt: endDate } } },
            { $group: { _id: null, totalSales: { $sum: "$price" }, totalItems: { $sum: 1 } } }
        ]);

        // Calculate not sold items for the selected month
        // Fetch total not sold items from other months
        const totalNotSoldItems = await Transaction.countDocuments({
            price: 0,
            dateOfSale: { $lt: startDate } // Only count items sold before the selected month
        });

        res.json({
            totalSales: totalSalesData[0]?.totalSales || 0,
            totalSoldItems: totalSalesData[0]?.totalItems || 0,
            totalNotSoldItems: totalNotSoldItems , // Total items minus sold items
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});



/// Bar chart data route
// Price range categories
router.get('/api/bar-chart/monthly', async (req, res) => {
    const { month, year } = req.query;

    // Ensure month and year are provided
    if (!month || !year) {
        return res.status(400).json({ message: 'Month and year are required' });
    }

    const priceRanges = [
        { label: '0 - 100', min: 0, max: 100 },
        { label: '101 - 200', min: 101, max: 200 },
        { label: '201 - 300', min: 201, max: 300 },
        { label: '301 - 400', min: 301, max: 400 },
        { label: '401 - 500', min: 401, max: 500 },
        { label: '501 - 600', min: 501, max: 600 },
        { label: '601 - 700', min: 601, max: 700 },
        { label: '701 - 800', min: 701, max: 800 },
        { label: '801 - 900', min: 801, max: 900 },
        { label: '901 - above', min: 901, max: Infinity },
    ];

    const startDate = new Date(year, month - 1, 1); // Start of the month
    const endDate = new Date(year, month, 1); // Start of the next month

    try {
        const counts = await Promise.all(priceRanges.map(async (range) => {
            const count = await Transaction.countDocuments({
                price: { $gte: range.min, $lte: range.max },
                dateOfSale: { $gte: startDate, $lt: endDate }
            });
            return { label: range.label, count };
        }));

        res.json(counts);
    } catch (error) {
        console.error('Error fetching monthly bar chart data:', error);
        res.status(500).json({ message: 'Failed to fetch monthly bar chart data' });
    }
});





const transactions = [
    { price: 329.85, dateOfSale: "2021-11-27" },
    { price: 44.6, dateOfSale: "2021-10-27" },
    { price: 615.89, dateOfSale: "2022-07-27" },
    { price: 31.98, dateOfSale: "2021-10-27" },
    { price: 6950, dateOfSale: "2022-06-27" },
    { price: 168, dateOfSale: "2021-09-27" },
];

// Price range categories
// const priceRanges = [
//     { label: '0 - 100', min: 0, max: 100 },
//     { label: '101 - 200', min: 101, max: 200 },
//     { label: '201 - 300', min: 201, max: 300 },
//     { label: '301 - 400', min: 301, max: 400 },
//     { label: '401 - 500', min: 401, max: 500 },
//     { label: '501 - 600', min: 501, max: 600 },
//     { label: '601 - 700', min: 601, max: 700 },
//     { label: '701 - 800', min: 701, max: 800 },
//     { label: '801 - 900', min: 801, max: 900 },
//     { label: '901 - above', min: 901, max: Infinity },
// ];

// Bar chart route
// router.get('/transactions/bar-chart', (req, res) => {
//     const counts = priceRanges.map(range => {
//         const count = transactions.filter(item => item.price >= range.min && item.price <= range.max).length;
//         return { label: range.label, count };
//     });
//     res.json(counts);
// });

// Pie chart data
// Pie chart data
// Pie chart data
router.get('/api/pie-chart', async (req, res) => {
    const { month } = req.query;

    // Validate input
    if (!month || month < 1 || month > 12) {
        return res.status(400).json({ message: 'Month is required and should be between 1 and 12' });
    }

    try {
        // Find unique categories and count items for the given month regardless of year
        const items = await Transaction.aggregate([
            {
                $match: {
                    $expr: {
                        $eq: [{ $month: "$dateOfSale" }, parseInt(month)]
                    }
                }
            },
            {
                $group: {
                    _id: "$category", // Group by category
                    count: { $sum: 1 } // Count the number of items in each category
                }
            }
        ]);

        console.log("API called with month:", month); // Log the request parameters
        console.log("Items found:", items); // Log the items found

        // Format response for pie chart
        const formattedData = items.map(item => ({
            category: item._id,
            count: item.count
        }));

        res.json(formattedData);
    } catch (error) {
        console.error('Error fetching pie chart data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Define the endpoint
router.get('/api/transactions', async (req, res) => {
    try {
      const transactions = await Transaction.find();
      res.json(transactions);
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
  });
  
module.exports = router;
