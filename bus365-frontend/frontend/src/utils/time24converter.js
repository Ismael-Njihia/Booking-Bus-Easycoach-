export function convertTo12HourFormat(time24) {
   // Extracting hours, minutes, and seconds from the time string
   var timeTokens = time24.split(':');
   var hours = parseInt(timeTokens[0]);
   var minutes = parseInt(timeTokens[1]);
   var seconds = parseInt(timeTokens[2]);

   // Determining AM/PM
   var period = hours >= 12 ? 'PM' : 'AM';

   // Converting hours to 12-hour format
   hours = hours % 12;
   hours = hours ? hours : 12; // Handle midnight (0 hours)

   // Adding leading zeros to minutes and seconds if necessary
   minutes = minutes < 10 ? '0' + minutes : minutes;
   seconds = seconds < 10 ? '0' + seconds : seconds;

   // Returning the formatted time
   return hours + ':' + minutes + ':' + seconds + ' ' + period;
}
