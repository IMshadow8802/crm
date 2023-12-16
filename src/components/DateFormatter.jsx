import moment from 'moment';

const DateFormatter = (inputDate) => {
  const formatsToTry = [
    'MM/DD/YYYY h:mm:ss A', // Format: MM/DD/YYYY 12:00:00 AM/PM
    'YYYY/MM/DD',            // Format: YYYY/MM/DD
    'DD/MM/YYYY',            // Format: DD/MM/YYYY
    'MM/DD/YYYY',            // Format: MM/DD/YYYY
    'DD/MM/YYYY HH:mm:ss',   // Format: DD/MM/YYYY 00:00:00
  ];

  let formattedDate = '';

  for (const format of formatsToTry) {
    const parsedDate = moment(inputDate, format, true);

    if (parsedDate.isValid()) {
      formattedDate = parsedDate.format('YYYY-MM-DD');
      break;
    }
  }

  return formattedDate;
};

export default DateFormatter;
