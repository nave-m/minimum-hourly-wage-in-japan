import { LocalDate } from "./LocalDate";
import { MinimumHourlyWageRevision } from "./MinimumHourlyWageRevision";
import { PrefectureCode } from "./PrefectureCode";

describe('MinimumHourlyWageRevision', () => {
    describe('constructor', () => {
        it('発効日がある改定情報を作成できる', () => {
            const actual = new MinimumHourlyWageRevision({
                prefectureCode: PrefectureCode.Hokkaido, 
                hourlyWage: 1010, 
                effectiveDate: LocalDate.fromISO8601('2024-10-01'), 
                publicationDate: LocalDate.fromISO8601('2024-08-30'),
            });
            expect(actual).toBeInstanceOf(MinimumHourlyWageRevision);
            expect(actual.prefectureCode).toBe(PrefectureCode.Hokkaido);
            expect(actual.hourlyWage).toBe(1010);
            expect(actual.effectiveDate).toStrictEqual(LocalDate.fromISO8601('2024-10-01'));
            expect(actual.publicationDate).toStrictEqual(LocalDate.fromISO8601('2024-08-30'));
        });
        it('発効日がない改定情報を作成できる', () => {
            const actual = new MinimumHourlyWageRevision({
                prefectureCode: PrefectureCode.Iwate, 
                hourlyWage: 952, 
                effectiveDate: LocalDate.fromISO8601('2023-10-04'), 
                publicationDate: null,
            });
            expect(actual).toBeInstanceOf(MinimumHourlyWageRevision);
            expect(actual.prefectureCode).toBe(PrefectureCode.Iwate);
            expect(actual.hourlyWage).toBe(952);
            expect(actual.effectiveDate).toStrictEqual(LocalDate.fromISO8601('2023-10-04'));
            expect(actual.publicationDate).toBeNull();
        });
        it('発効日が公示日よりも前だと作成できない', () => {
            expect(() => {
                new MinimumHourlyWageRevision({
                    prefectureCode: PrefectureCode.Hokkaido, 
                    hourlyWage: 960, 
                    effectiveDate: LocalDate.fromISO8601('2023-10-01'), 
                    publicationDate: LocalDate.fromISO8601('2023-10-01'),
                });
            }).toThrow(Error);
        });
        
    });
    describe('isEffective', () => {
        it('公示されていて発効日になっている場合、真', () => {
            expect(
                new MinimumHourlyWageRevision({
                    prefectureCode: PrefectureCode.Hokkaido, 
                    hourlyWage: 1010, 
                    effectiveDate: LocalDate.fromISO8601('2024-10-01'), 
                    publicationDate: LocalDate.fromISO8601('2024-08-30'),
                }).isEffective(LocalDate.fromISO8601('2024-10-01'))
            ).toBeTruthy();
        });
        it('公示されているが発効日の前なら、偽', () => {
            expect(
                new MinimumHourlyWageRevision({
                    prefectureCode: PrefectureCode.Hokkaido, 
                    hourlyWage: 1010, 
                    effectiveDate: LocalDate.fromISO8601('2024-10-01'), 
                    publicationDate: LocalDate.fromISO8601('2024-08-30'),
                }).isEffective(LocalDate.fromISO8601('2024-09-30'))
            ).toBeFalsy();
        });
        it('公示されてない場合、発効日になっていても、偽', () => {
            expect(
                new MinimumHourlyWageRevision({
                    prefectureCode: PrefectureCode.Hokkaido, 
                    hourlyWage: 1010, 
                    effectiveDate: LocalDate.fromISO8601('2024-10-01'), 
                    publicationDate: null
                }).isEffective(LocalDate.fromISO8601('2024-10-01'))
            ).toBeFalsy();
            expect(
                new MinimumHourlyWageRevision({
                    prefectureCode: PrefectureCode.Hokkaido, 
                    hourlyWage: 1010, 
                    effectiveDate: LocalDate.fromISO8601('2024-10-01'), 
                    publicationDate: null,
                }).isEffective(LocalDate.fromISO8601('2024-09-30'))
            ).toBeFalsy();
            // 答申後にマスタを更新して、官報が出たのに公示日の更新をしないまま発効日になってしまった場合なのでレアケース
        });
    });
});