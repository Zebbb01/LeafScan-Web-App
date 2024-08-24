import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import './ForecastTable.css';

const Forecast = () => {
  const [data, setData] = useState([]);
  const [sortConfig, setSortConfig] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/Disaster.csv'); // Ensure this path is correct
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const reader = response.body.getReader();
        const result = await reader.read();
        const decoder = new TextDecoder('utf-8');
        const csvData = decoder.decode(result.value);
        console.log('Raw CSV Data:', csvData); // Debugging: log the raw CSV data
        const parsedData = Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
        }).data;
        console.log('Parsed Data:', parsedData); // Debugging: log the parsed data
        setData(parsedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    let sortableData = [...data];
    if (sortConfig !== null) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig]);

  return (
    <div className='forecast-chart'>
      {sortedData.length > 0 ? (
        <table className='table'>
          <thead>
            <tr className='tr-table'>
              <th onClick={() => requestSort('Disaster')}>Disaster</th>
              <th onClick={() => requestSort('BeginningDate')}>Beginning Date</th>
              <th onClick={() => requestSort('EndingDate')}>Ending Date</th>
              <th onClick={() => requestSort('DisasterType')}>Disaster Type</th>
              <th onClick={() => requestSort('Deaths')}>Deaths</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <tr key={index}>
                <td>{row.Disaster}</td>
                <td>{row.BeginningDate}</td>
                <td>{row.EndingDate}</td>
                <td>{row.DisasterType}</td>
                <td>{row.Deaths}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
};

export default Forecast;
