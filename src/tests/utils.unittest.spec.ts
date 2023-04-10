import { isStoreOpen, getRelevance } from '../main/main.utils';
import { convertOpeningHoursString } from '../sample/sample.utils';

describe('Utils (in sample & main) Unit Test (*test output of utility functions)', () => {
  describe('Test convertOpeningHourString function', () => {
    it('Sample Case 1', () => {
      const sample =
        'Mon - Tues 3:45 pm - 8:15 pm / Weds 5:15 am - 11 pm / Thurs, Sun 8:45 am - 7:30 pm / Fri 10 am - 8:45 pm / Sat 5:45 am - 11 pm';
      const result = convertOpeningHoursString(sample);
      expect(result).toBe(
        '15:45/20:15/15:45/20:15/05:15/23:00/08:45/19:30/10:00/20:45/05:45/23:00/08:45/19:30',
      );
    });

    it('Sample Case 2', () => {
      const sample =
        'Sun - Mon 12:45 pm - 4:15 pm / Tues, Fri 4:30 pm - 6:45 pm / Weds 5:30 pm - 11:30 pm / Thurs 2 pm - 1:45 am';
      const result = convertOpeningHoursString(sample);
      expect(result).toBe(
        '12:45/16:15/16:30/18:45/17:30/23:30/14:00/01:45/16:30/18:45/00:00/00:00/12:45/16:15',
      );
    });

    it('Sample Case 3', () => {
      // annoying bad case (close hour is a.m, probably it's the next day)
      const sample =
        'Mon, Thurs 3 pm - 1:45 am / Tues 8 am - 3 pm / Weds, Sat 8:45 am - 3:45 am / Fri 4 pm - 2:45 am / Sun 5:45 pm - 7:15 pm';
      const result = convertOpeningHoursString(sample);
      expect(result).toBe(
        '15:00/01:45/08:00/15:00/08:45/03:45/15:00/01:45/16:00/02:45/08:45/03:45/17:45/19:15',
      );
    });

    it('Sample Case 4', () => {
      const sample =
        'Mon-Thurs 11 am - 10:30 pm  / Fri 11 am - 11 pm  / Sat 11:30 am - 11 pm  / Sun 4:30 pm - 10:30 pm';
      const result = convertOpeningHoursString(sample);
      expect(result).toBe(
        '11:00/22:30/11:00/22:30/11:00/22:30/11:00/22:30/11:00/23:00/11:30/23:00/16:30/22:30',
      );
    });

    it('Sample Case 5', () => {
      const sample =
        'Sun - Tues, Thurs 6 am - 6:15 pm / Weds 11:30 am - 3:15 am / Fri 11:45 am - 3 am / Sat 2:15 pm - 5:15 pm';
      const result = convertOpeningHoursString(sample);
      expect(result).toBe(
        '06:00/18:15/06:00/18:15/11:30/03:15/06:00/18:15/11:45/03:00/14:15/17:15/06:00/18:15',
      );
    });
  });

  describe('Test getRelevance function', () => {
    it('Sample Case 1', () => {
      const s1: string = 'hello';
      const s2: string = 'hallo';
      const result: number = getRelevance(s1, s2);
      expect(result.toFixed(2)).toBe('0.88');
    });

    it('Sample Case 2', () => {
      const s1: string = 'cat';
      const s2: string = 'act';
      const result: number = getRelevance(s1, s2);
      expect(result.toFixed(2)).toBe('0.56');
    });

    it('Sample Case 3', () => {
      const s1: string = 'hello';
      const s2: string = 'zzzz';
      const result: number = getRelevance(s1, s2);
      expect(result.toFixed(2)).toBe('0.00');
    });

    it('Sample Case 4', () => {
      const s1: string = 'hamburger';
      const s2: string = 'hamburg';
      const result: number = getRelevance(s1, s2);
      expect(result.toFixed(2)).toBe('0.96');
    });

    it('Sample Case 5', () => {
      const s1: string = 'The quick brown fox jumps over the lazy dog.';
      const s2: string = 'The quick brown dog jumps over the lazy fox.';
      const result: number = getRelevance(s1, s2);
      expect(result.toFixed(2)).toBe('0.96');
    });
  });

  describe('Test isStoreOpen function', () => {
    it('Sample Case 1', () => {
      const openingHours: string =
        '12:45/16:15/16:30/18:45/17:30/23:30/14:00/01:45/16:30/18:45/00:00/00:00/12:45/16:15';
      const dateTime: Date = new Date(2023, 3, 10, 16, 15); // 10 april 2023 (monday)
      const result: boolean = isStoreOpen(dateTime, openingHours);
      expect(result).toBe(true);
    });

    it('Sample Case 2', () => {
      const openingHours: string =
        '12:45/16:15/16:30/18:45/17:30/23:30/14:00/01:45/16:30/18:45/00:00/00:00/12:45/16:15';
      const dateTime: Date = new Date(2023, 3, 10, 12, 44); // 10 april 2023 (monday)
      const result: boolean = isStoreOpen(dateTime, openingHours);
      expect(result).toBe(false);
    });

    it('Sample Case 3', () => {
      const openingHours: string =
        '12:45/16:15/16:30/18:45/17:30/23:30/14:00/01:45/16:30/18:45/00:00/00:00/12:45/16:15';
      const dateTime: Date = new Date(2023, 3, 9, 13, 0); // 9 april 2023 (sunday)
      const result: boolean = isStoreOpen(dateTime, openingHours);
      expect(result).toBe(true);
    });

    it('Sample Case 4', () => {
      const openingHours: string =
        '12:45/16:15/16:30/18:45/17:30/23:30/14:00/01:45/16:30/18:45/00:00/00:00/12:45/16:15';
      const dateTime: Date = new Date(2023, 3, 8, 16, 15); // 8 april 2023 (saturday)
      const result: boolean = isStoreOpen(dateTime, openingHours);
      expect(result).toBe(false);
    });

    it('Sample Case 5', () => {
      const openingHours: string =
        '12:45/16:15/16:30/18:45/17:30/23:30/14:00/01:45/16:30/18:45/00:00/00:00/12:45/16:15';
      const dateTime: Date = new Date(2023, 3, 7, 16, 30);
      const result: boolean = isStoreOpen(dateTime, openingHours); // 7 april 2023 (friday)
      expect(result).toBe(true);
    });
  });
});
