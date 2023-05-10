import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [unprocessedRecords, setUnprocessedRecords] = useState([]);

  useEffect(() => {
    fetchUnprocessedRecords();
  }, []);

  const fetchUnprocessedRecords = async () => {
    try {
      const response = await axios.get('/getLocalRecords');
      setUnprocessedRecords(response.data.records);
    } catch (error) {
      console.error('Error fetching unprocessed records:', error);
    }
  };

  const handleAccept = async (record, providerAddress) => {
    try {
      await axios.post('/addRecordPay', {
        record,
        providerAddress,
        payment: 'yourPaymentValue', // Replace this with the appropriate payment value
      });
      fetchUnprocessedRecords();
    } catch (error) {
      console.error('Error accepting record:', error);
    }
  };

  return (
    <div className="App">
      <h1>Unprocessed Records</h1>
      <ul>
        {unprocessedRecords.map((recordObj, index) => (
          <li key={index}>
            {recordObj.record}
            <button onClick={() => handleAccept(recordObj.record, recordObj.providerAddress)}>Accept</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
