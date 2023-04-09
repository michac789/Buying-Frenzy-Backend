/**
 * Utility function to convert raw 'openingHours' string from 'restaurant_with_menu.ts'
 * to a valid form that is allowed in the database
 * @param openingHours: string from sample data (json given)
 * @returns string
 * return value is in the format HH:MM/HH:MM/.../HH:MM ('/' is the delimeter here),
 * where there are 14 HH:MM in total (24 hour format, so no am or pm, between 00:00 - 24:00)
 * first HH:MM = opening hour on monday, second = closing hour on monday
 * third = opening hour on tuesday, fourth = closing hour on tuesday
 * ...
 * 13th = opening hour on sunday, 14th = closing hour on sunday
 */
export function convertOpeningHoursString(openingHours: string): string {
  const openingHoursArray: string[] = new Array(14).fill('00:00');
  const queries: string[] = openingHours.split('/');
  const daysArr: string[] = [
    'Mon',
    'Tues',
    'Weds',
    'Thurs',
    'Fri',
    'Sat',
    'Sun',
  ];
  queries.forEach((query: string) => {
    const index: number = query.search(/[0-9]/);
    const dayStrs: string = query.slice(0, index).trim();
    const timeStr: string = query.slice(index).trim();
    let days: string[] = [];
    dayStrs.split(',').forEach((dayStr) => {
      if (dayStr.includes('-')) {
        let temp = dayStr.split('-');
        let firstIndex = daysArr.indexOf(temp[0].trim());
        let secondIndex = daysArr.indexOf(temp[1].trim());
        if (secondIndex < firstIndex) {
          days = days.concat(daysArr.slice(0, secondIndex + 1));
          days = days.concat(daysArr.slice(firstIndex, 7));
        } else {
          days = days.concat(daysArr.slice(firstIndex, secondIndex + 1));
        }
      } else {
        days = days.concat(dayStr.trim());
      }
    });
    let [openTime, closeTime]: string[] = timeStr.split('-');
    openTime = openTime.trim();
    closeTime = closeTime.trim();

    let [timeOpen, ampmOpen]: string[] = openTime.split(' ');
    let [hourOpen, minOpen]: any[] = timeOpen.split(':');
    if (ampmOpen === 'pm' && hourOpen !== '12')
      hourOpen = parseInt(hourOpen) + 12;
    if (hourOpen.toString().length === 1) hourOpen = '0' + hourOpen;
    minOpen = minOpen
      ? minOpen.toString().length === 1
        ? '0' + minOpen
        : minOpen
      : '00';
    const openTimeStr: string = hourOpen.toString() + ':' + minOpen;
    let [timeClose, ampmClose]: string[] = closeTime.split(' ');
    let [hourClose, minClose]: any[] = timeClose.split(':');
    if (ampmClose === 'pm' && hourClose !== '12')
      hourClose = parseInt(hourClose) + 12;
    if (hourClose.toString().length === 1) hourClose = '0' + hourClose;
    minClose = minClose
      ? minClose.toString().length === 1
        ? '0' + minClose
        : minClose
      : '00';
    const closeTimeStr: string = hourClose.toString() + ':' + minClose;
    days.forEach((day: string) => {
      const dayIndex = daysArr.indexOf(day.trim());
      openingHoursArray[dayIndex * 2] = openTimeStr;
      openingHoursArray[dayIndex * 2 + 1] = closeTimeStr;
    });
  });
  return openingHoursArray.join('/');
}
