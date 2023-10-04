import dayjs from 'dayjs';

export function tsToFormattedDate(ts: number) {
  return dayjs(ts).format('DD.MM.YYYY');
}

export function daysUntilNextBirthday(ts: number): number {
  const birthday = dayjs(ts);
  const today = dayjs();

  if (birthday.date() === today.date() && birthday.month() === today.month()) {
    return 0;
  }

  const yearDiff = today.diff(birthday, 'y');
  const nextBirthday = dayjs(birthday).add(yearDiff + 1, 'y');

  // Round up decimal result
  const daysResult = Math.ceil(nextBirthday.diff(today, 'd', true))

  return daysResult;
}
