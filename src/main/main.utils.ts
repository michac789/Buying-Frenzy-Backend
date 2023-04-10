// File to put extra utility functions
import { BadRequestException } from '@nestjs/common';
import { RestaurantSearchPaginator } from './dto/restaurant.dto';

// Given a queryset (array of data), itemsPerPage, page, perform pagination
export function paginate(
  qs: any,
  itemsPerPage: number,
  page: number,
): RestaurantSearchPaginator {
  if (qs.length == 0)
    return {
      items: qs,
      pagination: {
        totalPages: 0,
        totalItems: qs.length,
        hasNext: false,
        hasPrev: false,
      },
    };
  const totalItems = qs.length;
  const numPages = Math.ceil(totalItems / itemsPerPage);
  if (page < 1 || page > numPages)
    throw new BadRequestException(`Invalid Page Number (valid: 1-${numPages})`);
  const startIndex: number = (page - 1) * itemsPerPage;
  qs = qs.slice(startIndex, startIndex + Number(itemsPerPage));
  return {
    items: qs,
    pagination: {
      totalPages: numPages,
      totalItems: totalItems,
      hasNext: page < numPages,
      hasPrev: page > 1,
    },
  };
}

// given dateTime and openingHours, return true if store is open at dateTime else false
export function isStoreOpen(dateTime: Date, openingHours: string): boolean {
  // get the day of today (mon=0, tue=1, ..., sun=6), hour, min
  const day = (dateTime.getDay() + 6) % 7;
  const openingHoursArr = openingHours.split('/');
  const [currHour, currMin]: number[] = [
    dateTime.getHours(),
    dateTime.getMinutes(),
  ];
  const [openHour, openMin]: number[] = openingHoursArr[day * 2]
    .split(':')
    .map((x) => parseInt(x));
  const [closeHour, closeMin]: number[] = openingHoursArr[day * 2 + 1]
    .split(':')
    .map((x) => parseInt(x));
  if (openHour === 0 && openMin === 0 && closeHour === 0 && closeHour === 0)
    return false;
  return (
    (currHour > openHour || (currHour == openHour && currMin >= openMin)) &&
    (currHour < closeHour || (currHour == closeHour && currMin <= closeMin))
  );
}

// https://en.wikipedia.org/wiki/Jaro%E2%80%93Winkler_distance
// Jaro Winkler Distance, to calculate relevance between two different string
export function getRelevance(s1: string, s2: string, p: number = 0.1): number {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();
  const len1 = s1.length;
  const len2 = s2.length;
  if (len1 === 0 || len2 === 0) return 0;
  const maxDistance = Math.floor(Math.max(len1, len2) / 2) - 1;
  const matchIndexes1: boolean[] = new Array(len1).fill(false);
  const matchIndexes2: boolean[] = new Array(len2).fill(false);
  let matches = 0;
  let transpositions = 0;
  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - maxDistance);
    const end = Math.min(i + maxDistance + 1, len2);
    for (let j = start; j < end; j++) {
      if (s2[j] !== s1[i] || matchIndexes2[j]) {
        continue;
      }
      matchIndexes1[i] = true;
      matchIndexes2[j] = true;
      matches++;
      break;
    }
  }
  if (matches === 0) return 0;
  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (!matchIndexes1[i]) continue;
    while (!matchIndexes2[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }
  const jaro =
    (matches / len1 +
      matches / len2 +
      (matches - transpositions / 2) / matches) /
    3;

  let prefixLength = 0;
  for (let i = 0; i < len1; i++) {
    if (s1[i] !== s2[i]) break;
    prefixLength++;
  }
  const maxPrefixLength = Math.min(4, prefixLength);
  const winkler = jaro + maxPrefixLength * p * (1 - jaro);
  return winkler;
}
