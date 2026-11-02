import { describe, expect, it } from "vitest";
import { ageLabel, computeAge, getZonedParts, isBirthdayToday, nextBirthday } from "@/lib/birthdayAge";

// Helper: an instant that is `local` wall-clock in Asia/Kolkata (UTC+5:30, no DST).
const ist = (iso: string) => new Date(`${iso}+05:30`);

describe("computeAge (Asia/Kolkata)", () => {
  it("is 28 on 4 February 2027 from the first second of the day", () => {
    expect(computeAge(ist("2027-02-04T00:00:00"))).toBe(28);
    expect(computeAge(ist("2027-02-04T23:59:59"))).toBe(28);
  });
  it("is still 27 one second before midnight IST on 3 February 2027", () => {
    expect(computeAge(ist("2027-02-03T23:59:59"))).toBe(27);
  });
  it("is 27 in late 2026", () => {
    expect(computeAge(ist("2026-11-02T12:00:00"))).toBe(27);
    expect(computeAge(ist("2026-12-31T23:59:59"))).toBe(27);
  });
  it("uses Kolkata time, not UTC, around midnight", () => {
    // 3 Feb 2027 20:00 UTC == 4 Feb 2027 01:30 IST → already 28 in Kolkata.
    expect(computeAge(new Date("2027-02-03T20:00:00Z"))).toBe(28);
    // 4 Feb 2027 18:00 UTC == 4 Feb 23:30 IST → still the birthday.
    expect(isBirthdayToday(new Date("2027-02-04T18:00:00Z"))).toBe(true);
    // 4 Feb 2027 19:00 UTC == 5 Feb 00:30 IST → no longer the birthday.
    expect(isBirthdayToday(new Date("2027-02-04T19:00:00Z"))).toBe(false);
  });
  it("never hardcodes 28: 2028 and 1999 edge cases", () => {
    expect(computeAge(ist("2028-02-04T00:00:00"))).toBe(29);
    expect(computeAge(ist("1999-02-04T00:00:00"))).toBe(0);
    expect(computeAge(ist("2000-02-03T00:00:00"))).toBe(0);
    expect(computeAge(ist("2000-02-04T00:00:00"))).toBe(1);
  });
});

describe("nextBirthday", () => {
  it("counts days until 4 Feb 2027 from 2 Nov 2026", () => {
    const info = nextBirthday(ist("2026-11-02T10:00:00"));
    expect(info.year).toBe(2027);
    expect(info.daysUntil).toBe(94);
    expect(info.ageTurning).toBe(28);
  });
  it("is 0 days on the birthday itself", () => {
    expect(nextBirthday(ist("2027-02-04T15:00:00")).daysUntil).toBe(0);
  });
  it("rolls to next year the day after", () => {
    const info = nextBirthday(ist("2027-02-05T00:00:00"));
    expect(info.year).toBe(2028);
    expect(info.daysUntil).toBe(364);
  });
});

describe("helpers", () => {
  it("formats the age label", () => {
    expect(ageLabel(28)).toBe("28 wonderful years");
    expect(ageLabel(1)).toBe("1 wonderful year");
  });
  it("reads zoned parts with a 0–23 hour", () => {
    const p = getZonedParts(new Date("2027-02-03T20:00:00Z"));
    expect(p).toMatchObject({ year: 2027, month: 2, day: 4, hour: 1, minute: 30 });
  });
});
