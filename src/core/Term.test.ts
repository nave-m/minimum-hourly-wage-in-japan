import { LocalDate } from "./LocalDate";
import { TermBetween, TermSince, TermUntil } from "./Term";

describe('TermSince', () => {
    describe('within', () => {
        it.each([
            ['sinceよりも前', new TermSince({since: LocalDate.fromISO8601('2023-10-03')}).within(LocalDate.fromISO8601('2023-10-02')), false],
            ['sinceと同じ', new TermSince({since: LocalDate.fromISO8601('2023-10-03')}).within(LocalDate.fromISO8601('2023-10-03')), true],
        ])('期間内判定ができる %s', (_, actual, expected) => {
            expect(actual).toBe(expected);
        });
    });
});

describe('TermUntil', () => {
    describe('within', () => {
        it.each([
            ['untilと同じ', new TermUntil({until: LocalDate.fromISO8601('2024-09-30')}).within(LocalDate.fromISO8601('2024-09-30')), true],
            ['untilよりも後', new TermUntil({until: LocalDate.fromISO8601('2024-09-30')}).within(LocalDate.fromISO8601('2024-10-01')), false],
        ])('期間内判定ができる %s', (_, actual, expected) => {
            expect(actual).toBe(expected);
        });
    });
})

describe('TermBetween', () => {
    describe('within', () => {
        it.each([
            ['sinceよりも前', new TermBetween({since: LocalDate.fromISO8601('2023-10-03'), until: LocalDate.fromISO8601('2024-09-30')}).within(LocalDate.fromISO8601('2023-10-02')), false],
            ['sinceと同じ', new TermBetween({since: LocalDate.fromISO8601('2023-10-03'), until: LocalDate.fromISO8601('2024-09-30')}).within(LocalDate.fromISO8601('2023-10-03')), true],
            ['untilと同じ', new TermBetween({since: LocalDate.fromISO8601('2023-10-03'), until: LocalDate.fromISO8601('2024-09-30')}).within(LocalDate.fromISO8601('2024-09-30')), true],
            ['untilよりも後', new TermBetween({since: LocalDate.fromISO8601('2023-10-03'), until: LocalDate.fromISO8601('2024-09-30')}).within(LocalDate.fromISO8601('2024-10-01')), false],
        ])('期間内判定ができる %s', (_, actual, expected) => {
            expect(actual).toBe(expected);
        });
    });
});