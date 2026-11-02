/**
 * Birthday + age logic for Anshu ("Pineapple").
 * The birth date is immutable: 1999-02-04. All calendar maths run in Asia/Kolkata
 * so the age flips at midnight *her* time, not the visitor's.
 */
export const BIRTH_YEAR = 1999;
export const BIRTH_MONTH = 2; // February
export const BIRTH_DAY = 4;
export const BIRTH_ISO = "1999-02-04";
export const TIME_ZONE = "Asia/Kolkata";

export interface ZonedParts {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  hour: number; // 0-23
  minute: number;
  second: number;
}

/** Returns the wall-clock parts of `date` in the given IANA time zone. */
export function getZonedParts(date: Date = new Date(), timeZone: string = TIME_ZONE): ZonedParts {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hourCycle: "h23",
  });
  const map: Record<string, number> = {};
  for (const part of fmt.formatToParts(date)) {
    if (part.type !== "literal") map[part.type] = parseInt(part.value, 10);
  }
  return {
    year: map.year,
    month: map.month,
    day: map.day,
    hour: (map.hour ?? 0) % 24,
    minute: map.minute ?? 0,
    second: map.second ?? 0,
  };
}

/** Full years completed since 1999-02-04, evaluated in Asia/Kolkata. */
export function computeAge(now: Date = new Date(), timeZone: string = TIME_ZONE): number {
  const { year, month, day } = getZonedParts(now, timeZone);
  let age = year - BIRTH_YEAR;
  const beforeBirthdayThisYear = month < BIRTH_MONTH || (month === BIRTH_MONTH && day < BIRTH_DAY);
  if (beforeBirthdayThisYear) age -= 1;
  return age;
}

export function isBirthdayToday(now: Date = new Date(), timeZone: string = TIME_ZONE): boolean {
  const { month, day } = getZonedParts(now, timeZone);
  return month === BIRTH_MONTH && day === BIRTH_DAY;
}

export interface NextBirthdayInfo {
  year: number;
  daysUntil: number; // 0 on the birthday itself
  ageTurning: number;
}

/** The next (or current, if today) February 4th, and how many whole days away it is. */
export function nextBirthday(now: Date = new Date(), timeZone: string = TIME_ZONE): NextBirthdayInfo {
  const { year, month, day } = getZonedParts(now, timeZone);
  const passed = month > BIRTH_MONTH || (month === BIRTH_MONTH && day > BIRTH_DAY);
  const targetYear = passed ? year + 1 : year;
  const todayUtc = Date.UTC(year, month - 1, day);
  const targetUtc = Date.UTC(targetYear, BIRTH_MONTH - 1, BIRTH_DAY);
  const daysUntil = Math.round((targetUtc - todayUtc) / 86_400_000);
  return { year: targetYear, daysUntil, ageTurning: targetYear - BIRTH_YEAR };
}

/** Human copy for the age ring, e.g. "28 wonderful years". */
export function ageLabel(age: number): string {
  return `${age} wonderful ${age === 1 ? "year" : "years"}`;
}

export function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}
