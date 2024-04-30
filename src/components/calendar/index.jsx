import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Calendar = ({ selectedDate, onChange }) => {
  const [startDate, setStartDate] = useState(selectedDate);

  const handleDateChange = date => {
    setStartDate(date);
    onChange(date);
  };

  return (
    <div>
      <h2>Selecciona una fecha:</h2>
      <DatePicker selected={startDate} onChange={handleDateChange} />
    </div>
  );
};

export default Calendar;
