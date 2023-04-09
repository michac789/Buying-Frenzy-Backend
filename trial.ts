function isStoreOpen(dateTime, openingHours) {
  // get the day of today (mon=0, tue=1, ..., sun=6), hour, min
  const day = (dateTime.getDay() - 1) % 7;
  const openingHoursArr = openingHours.split('/');
  const [currHour, currMin] = [dateTime.getHours(), dateTime.getMinutes()];
  console.log(openingHoursArr, day);
  const [openHour, openMin] = openingHoursArr[day * 2].split(':');
  const [closeHour, closeMin] = openingHoursArr[day * 2 + 1].split(':');
  console.log(currHour, currMin, openHour, openMin, closeHour, closeMin);

  return (
    (currHour > openHour || (currHour == openHour && currMin >= openMin)) &&
    (currHour < closeHour || (currHour == closeHour && currMin <= closeMin))
  );
}

const openingHours =
  '12:45/16:15/16:30/18:45/17:30/23:30/14:00/01:45/16:30/18:45/00:00/00:00/12:45/16:15';
const dateTime = new Date(2023, 3, 9, 13, 0);

// let d = new Date(2023, 3, 10, 16, 15);
// let o =
//   '12:45/16:15/16:30/18:45/17:30/23:30/14:00/01:45/16:30/18:45/00:00/00:00/12:45/16:15';
let a = isStoreOpen(dateTime, openingHours);
console.log(a);
