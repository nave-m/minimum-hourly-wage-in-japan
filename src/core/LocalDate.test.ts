import { LocalDate } from "./LocalDate";

describe('LocalDate', () => {
    describe('fromYMD', () => {
        it.each([
            [2024, 1, 1],
            [2024, 2, 29],
            [2024, 12, 31],
        ])('年月日指定でインスタンスを作成できる %s %s %s', (year, month, dayOfMonth) => {
            const actual = LocalDate.fromYMD(year, month, dayOfMonth);
            expect(actual).toBeInstanceOf(LocalDate);
            expect(actual.year).toBe(year);
            expect(actual.month).toBe(month);
            expect(actual.dayOfMonth).toBe(dayOfMonth);
        });
        it.each([
            ['年がマイナス', -2024, 1, 1],
            ['月が1よりも小さい', 2024, 0, 1],
            ['月が12よりも大きい', 2024, 13, 1],
            ['日が1よりも小さい', 2024, 12, 0],
            ['日が31よりも大きい', 2024, 12, 32],
            ['閏年でないのに2/29', 2023, 2, 29],
        ])('日付として不正な場合はインスタンスを作成できない %s', (_, year, month, dayOfMonth) => {
            expect(() => {
                LocalDate.fromYMD(year, month, dayOfMonth);
            }).toThrow(Error);
        })
    });
    describe('fromISO8601', () => {
        it.each([
            ['2024-01-01', [2024, 1, 1]],
            ['2024-02-29', [2024, 2, 29]],
            ['2024-12-31', [2024, 12, 31]],
        ])('年月日指定でインスタンスを作成できる %s %s %s', (text, expected) => {
            const actual = LocalDate.fromISO8601(text);
            const [year, month, dayOfMonth] = expected;
            expect(actual).toBeInstanceOf(LocalDate);
            expect(actual.year).toBe(year);
            expect(actual.month).toBe(month);
            expect(actual.dayOfMonth).toBe(dayOfMonth);
        });
        it.each([
            ['ISO8601の日付の書式を満たささない(年がない)', '01-01'],
            ['ISO8601の日付の書式を満たささない(ハイフンがない)', '20240101'],
            ['ISO8601の日付の書式を満たささない(スラッシュ区切り)', '2024/01/01'],
            ['ISO8601の日付の書式を満たささない(時刻が余計)', '2024-01-01T00:00:00Z'],
            ['年がマイナス', '-2024-01-01'],
            ['月が1よりも小さい', '2024-00-01'],
            ['月が12よりも大きい', '2024-13-01'],
            ['日が1よりも小さい', '2024-12-00'],
            ['日が31よりも大きい', '2024-12-32'],
            ['閏年でないのに2/29', '2023-02-29'],
        ])('日付として不正な場合はインスタンスを作成できない %s', (_, text) => {
            expect(() => {
                LocalDate.fromISO8601(text);
            }).toThrow(Error);
        })
    });
    describe('getComparableNumber', () => {
        it('比較用の数字を返す', () => {
            expect(LocalDate.fromYMD(2024, 10, 1).getComparableNumber()).toBe(20241001);
        });
    });
});