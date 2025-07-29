import {addWeeks, differenceInDays} from "date-fns";

/**
 * this is such a fucking horrible hack, but it is what it is.
 *
 * The function operates as follows:
 * 1. Maps the input date to the equivalent day/month in 2025 (the target academic year)
 * 2. Determines which term period the date falls into based on predefined term start dates
 * 3. Calculates the week number by counting days from the term start date
 * 4. Handles edge cases with appropriate fallbacks
 *
 * @param {Date} date - The date to calculate term and week for (can be any year)
 * @returns {{term: number|string, weekInTerm: number|string}} An object containing:
 *   - term: The term number (1-4) or "N/A" if the term couldn't be determined
 *   - weekInTerm: The week number within that term or "?" if it couldn't be determined
 *
 * @example
 * // Get term and week for current date
 * const { term, weekInTerm } = calculateTermAndWeek(new Date());
 * console.log(`Current term: ${term}, Week: ${weekInTerm}`);
 *
 * @example
 * // Get term and week for a specific date
 * const date = new Date('2024-07-29');
 * const { term, weekInTerm } = calculateTermAndWeek(date);
 * // Will return: { term: 3, weekInTerm: 2 } (using 2025 calendar)
 */
export const termStartDatesByYear: Record<number, Date[]> = {
  2025: [
    new Date(2025, 0, 27), // Jan 27, 2025 (Term 1)
    new Date(2025, 3, 28), // Apr 28, 2025 (Term 2)
    new Date(2025, 6, 14), // Jul 14, 2025 (Term 3)
    new Date(2025, 9, 13), // Oct 13, 2025 (Term 4)
  ],
};

export const termWeeks = [11, 9, 10, 10];

export function calculateTermAndWeek(date: Date) {
  // force calculations to use 2025 academic calendar
  const targetYear = 2025;

  // create a date with the same month/day but in 2025
  const targetDate = new Date(targetYear, date.getMonth(), date.getDate());
  const termStartDates = termStartDatesByYear[targetYear];

  if (!termStartDates) {
    return {term: "N/A", weekInTerm: "?"};
  }

  for (let i = 0; i < termStartDates.length; i++) {
    const termStart = termStartDates[i];
    const termEnd =
      i < termStartDates.length - 1
        ? termStartDates[i + 1]
        : addWeeks(termStart, termWeeks[i]);

    if (targetDate >= termStart && targetDate < termEnd) {
      const daysSinceTermStart = differenceInDays(targetDate, termStart);
      const weekInTerm = Math.floor(daysSinceTermStart / 7) + 1;
      return {term: i + 1, weekInTerm};
    }
  }

  // fallback if before first term start
  if (targetDate < termStartDates[0]) {
    return {term: 1, weekInTerm: 1};
  }
  // fallback if after last term end
  return {term: 4, weekInTerm: termWeeks[3]};
}