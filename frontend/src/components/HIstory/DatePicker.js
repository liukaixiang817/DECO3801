import * as React from 'react';
import Badge from '@mui/material/Badge';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import "./calendarStyle.css"
import { colors } from '@mui/material';

// A custom day component to display badges for highlighted days
function ServerDay(props) {
  const { highlightedDays = [], day, outsideCurrentMonth, ...other } = props;
  
  // Get the current date (without time) for comparison
  const today = dayjs().startOf('day');
  
  // Check if the day is highlighted
  const isHighlighted = highlightedDays.includes(day.format('YYYY-MM-DD'));

  // Check if the day is before or the same as today
  const isPastOrToday = day.isBefore(today, 'day') || day.isSame(today, 'day');
  
  return (
    <Badge
      key={day.toString()}
      overlap="circular"
      // Show badges only for days up to the current date, within the current month
      badgeContent={
        isPastOrToday && !outsideCurrentMonth ? (
          isHighlighted ? <CloseIcon  style={{color: "red"}}/> : <CheckIcon  style={{color: "green"}}/>
        ) : undefined
      }
    >
      <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
    </Badge>
  );
}

// The main calendar component
const BasicDateCalendar = ({ highlightedDays }) => {
  return (
    <div style={{ height: '300px' }}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateCalendar
        sx={{ height: '100%' }}
        slots={{
          day: ServerDay,  // Use the custom day rendering function
        }}
        slotProps={{
          day: { highlightedDays },  // Pass the highlighted days to the day component
        }}
      />
      </LocalizationProvider>
    </div>
    
  );
};

export default BasicDateCalendar;