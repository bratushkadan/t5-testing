import dayjs from 'dayjs';

import { tsToFormattedDate, daysUntilNextBirthday } from './date';

describe('date utils', () => {
  describe('tsToFormattedDate', () => {
    it('should format unix timestamp as the start of the unix epoch in russian format', () => {
      // arrange
      const expectedDate = '01.01.1970';

      // act
      const actualDate = tsToFormattedDate(0);

      // assert
      expect(actualDate).toBe(expectedDate);
    });

    it('should format arbitrary unix timestamp in russian format', () => {
      // arrange
      const gmtDate = new Date('2019-07-17T23:58:00Z');
      const expectedDate = '18.07.2019';
  
      // act
      const actualDate = tsToFormattedDate(gmtDate.valueOf());
  
      // assert
      expect(actualDate).toBe(expectedDate);
    });
  });

  describe('daysUntilNextBirthday', () => {
    it('should calculate the amount of days until next birthday', () => {
      // arrange
      const twoDaysAgo = dayjs().subtract(1, 'y').add(2, 'd')

      // act
      const daysUntil = daysUntilNextBirthday(twoDaysAgo.valueOf())

      // assert
      expect(daysUntil).toBe(2)
    })
    
    it('should calculate the amount of days until next birthday as 0 if the birthday is today', () => {
      // arrange
      const todayBirthday = dayjs().subtract(10, 'y')

      // act
      const daysUntil = daysUntilNextBirthday(todayBirthday.valueOf())

      // assert
      expect(daysUntil).toBe(0)
    })
  })
});
