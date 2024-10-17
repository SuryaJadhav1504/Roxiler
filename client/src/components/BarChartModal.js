import React, { useState } from 'react';
import BarChart from './BarChart'; // Make sure the path is correct

const BarChartModal = ({ month, onClose }) => {
    return (
        <div style={modalStyles}>
            <div style={modalContentStyles}>
                <BarChart month={month} onClose={onClose} />
            </div>
        </div>
    );
};


const modalStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

const modalContentStyles = {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    width: '80%',
    maxHeight: '80%',
    overflow: 'auto',
};

export default BarChartModal;
