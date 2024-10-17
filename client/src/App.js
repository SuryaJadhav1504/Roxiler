import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ChartComponent from './components/ChartComponent';
import Statistics from './components/Statistics';

function App() {
  return (
    <div>
      <ChartComponent />
      <Routes>
      <Route path="/api/statistics/:month" element={<Statistics />} />
      </Routes>
    </div>
  );
}

export default App;
