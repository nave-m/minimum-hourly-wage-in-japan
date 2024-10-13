import { LocalDate } from "@minimum-hourly-wage-in-japan/core/src/LocalDate";
import { MinimumHourlyWageRevision } from "@minimum-hourly-wage-in-japan/core/src/MinimumHourlyWageRevision";
import { fromListUnsafe } from "@minimum-hourly-wage-in-japan/core/src/NonEmptyList";
import { PrefectureCode } from "@minimum-hourly-wage-in-japan/core/src/PrefectureCode";
import { TermBetween, TermSince, TermUntil } from "@minimum-hourly-wage-in-japan/core/src/Term";
import { MinimumHourlyWageRevisionServiceImpl } from "./MinimumHourlyWageRevisionServiceImpl";

describe('MinimumHourlyWageQueryImpl', ()=> {
    
    describe('list', () => {
        const hokkaido20231001 = new MinimumHourlyWageRevision({prefectureCode: PrefectureCode.Hokkaido, hourlyWage: 960, effectiveDate: LocalDate.fromISO8601('2023-10-01'), publicationDate: LocalDate.fromISO8601('2023-09-01')});
        const aomori20231007 = new MinimumHourlyWageRevision({prefectureCode: PrefectureCode.Aomori, hourlyWage: 898, effectiveDate: LocalDate.fromISO8601('2023-10-07'), publicationDate: LocalDate.fromISO8601('2023-09-07')});
        const iwate20231004 = new MinimumHourlyWageRevision({prefectureCode: PrefectureCode.Iwate, hourlyWage: 893, effectiveDate: LocalDate.fromISO8601('2023-10-04'), publicationDate: LocalDate.fromISO8601('2023-09-04') });
        const hokkaido20241001 = new MinimumHourlyWageRevision({prefectureCode: PrefectureCode.Hokkaido, hourlyWage: 1010, effectiveDate: LocalDate.fromISO8601('2024-10-01'), publicationDate: LocalDate.fromISO8601('2024-08-30')});
        const aomori20241005 = new MinimumHourlyWageRevision({prefectureCode: PrefectureCode.Aomori, hourlyWage: 953, effectiveDate: LocalDate.fromISO8601('2024-10-05'), publicationDate: LocalDate.fromISO8601('2024-08-30')});
        const iwate20241004 = new MinimumHourlyWageRevision({prefectureCode: PrefectureCode.Iwate, hourlyWage: 952, effectiveDate: LocalDate.fromISO8601('2024-10-04'), publicationDate: null });
        it.each([
            [
                '発効日Since',
                new TermSince({since: LocalDate.fromISO8601('2024-10-05')}),
                [aomori20241005],
            ],
            [
                '発効日Until',
                new TermUntil({until: LocalDate.fromISO8601('2023-10-01')}),
                [hokkaido20231001],
            ],
            [
                '発効日Between',
                new TermBetween({since: LocalDate.fromISO8601('2023-10-01'), until: LocalDate.fromISO8601('2023-10-04')}),
                [hokkaido20231001, iwate20231004],
            ],
        ])('発効日の期間を指定して取得できる %s', async (_, effectiveDate, expected) => {
            expect(
                new MinimumHourlyWageRevisionServiceImpl({
                    revisions: [
                        hokkaido20231001, aomori20231007, iwate20231004,
                        hokkaido20241001, aomori20241005, iwate20241004,
                    ],
                }).list({effectiveDate, prefectureCodes: null })
            ).resolves.toEqual(expected);
        });
        it.each([
            [
                '単数指定(北海道だけ)',
                fromListUnsafe([PrefectureCode.Hokkaido]) ,
                [hokkaido20231001,hokkaido20241001],
            ],
            [
                '複数指定(青森と岩手)',
                fromListUnsafe([PrefectureCode.Aomori, PrefectureCode.Iwate]),
                [aomori20231007,iwate20231004, aomori20241005, iwate20241004],
            ]
            
        ])('都道府県の絞り込みができる %s', async (_, prefectureCodes, expected) => {
            const effectiveDate = new TermBetween({since: LocalDate.fromISO8601('2023-10-01'), until: LocalDate.fromISO8601('2024-11-30')}); // 全データ対象
            expect(
                new MinimumHourlyWageRevisionServiceImpl({
                    revisions: [
                        hokkaido20231001, aomori20231007, iwate20231004,
                        hokkaido20241001, aomori20241005, iwate20241004,
                    ],
                }).list({effectiveDate, prefectureCodes })
            ).resolves.toEqual(expected);
        });
    });
})