import { LocalDate } from "@minimum-hourly-wage-in-japan/core/src/LocalDate";
import { MinimumHourlyWageRevision } from "@minimum-hourly-wage-in-japan/core/src/MinimumHourlyWageRevision";
import { PrefectureCode } from "@minimum-hourly-wage-in-japan/core/src/PrefectureCode";
import { TermBetween } from "@minimum-hourly-wage-in-japan/core/src/Term";
import { ListMinimumHourlyWageInput, ListMinimumHourlyWageInteractor, ListMinimumHourlyWageOutput, ValidatedInput } from "./ListMinimumHourlyWage";
import { MinimumHourlyWageRevisionService } from "./MinimumHourlyWageRevisionService";
import { InvalidArgumentError } from "./UseCaseError";

describe('ListMinimumHourlyWageInteractor', () => {
    describe('validate', () => {
        it.each([
            [
                '最小構成(都道府県コード指定なし)', 
                new ListMinimumHourlyWageInput({
                    date: new Date('2024-10-04'),
                    prefectureCodes: null,
                }),
                new ValidatedInput({
                    date: LocalDate.fromISO8601('2024-10-04'),
                    prefectureCodes: null,
                }),
            ],
            [
                '最小構成(都道府県コードが空)', 
                new ListMinimumHourlyWageInput({
                    date: new Date('2024-10-04'),
                    prefectureCodes: [],
                }),
                new ValidatedInput({
                    date: LocalDate.fromISO8601('2024-10-04'),
                    prefectureCodes: null,
                }),
            ],
            [
                '最大構成', 
                new ListMinimumHourlyWageInput({
                    date: new Date('2024-10-04'),
                    prefectureCodes: ['01', '47'],
                }),
                new ValidatedInput({
                    date: LocalDate.fromISO8601('2024-10-04'),
                    prefectureCodes: [PrefectureCode.Hokkaido, PrefectureCode.Okinawa],
                }),
            ],
        ])('正常な値であれば、ValidatedInputを返す %s', (_, input, expected) => {
            expect(
                new ListMinimumHourlyWageInteractor({
                    minimumHourlyWageRevisionService: createMinimumHourlyWageRevisionService(),
                }).validate(input)
            ).toStrictEqual(expected);
        });
        it.each([
            [
                '日付が指定されない',
                new ListMinimumHourlyWageInput({
                    date: null,
                    prefectureCodes: null,
                }),
                new InvalidArgumentError({violations: [{property:'date', message: '日付は必須です'}]}),
            ],
            [
                '日付が不正な値',
                new ListMinimumHourlyWageInput({
                    date: new Date(''),
                    prefectureCodes: null,
                }),
                new InvalidArgumentError({violations: [{property:'date', message: '日付として解釈できません'}]}),
            ],
            [
                '都道府県コードが不正な値',
                new ListMinimumHourlyWageInput({
                    date: null,
                    prefectureCodes: ['00', '01', '48'],
                }),
                new InvalidArgumentError({violations: [
                    {property: `prefectureCodes[0]`, message: '都道府県コードとして解釈できません'},
                    {property: `prefectureCodes[2]`, message: '都道府県コードとして解釈できません'},
                ]}),
            ]
        ])('入力の成約違反があればInvalidArgumentErrorを投げる %s', (_, input, expectedError) => {
            try {
                new ListMinimumHourlyWageInteractor({
                    minimumHourlyWageRevisionService: createMinimumHourlyWageRevisionService(),
                }).validate(input);
                throw new Error('validateメソッドが例外を投げていない');
            } catch(e) {
                expect(e).toStrictEqual(expectedError);
            }     
        });
    });
    describe('invoke', () => {
        it('都道府県絞り込みあり', async () => {
            const minimumHourlyWageRevisionService = createMinimumHourlyWageRevisionService();
            minimumHourlyWageRevisionService.list = jest.fn()
                .mockResolvedValueOnce([
                    // 前年度
                    new MinimumHourlyWageRevision({prefectureCode: PrefectureCode.Hokkaido, hourlyWage: 960, effectiveDate: LocalDate.fromISO8601('2023-10-01'), publicationDate: LocalDate.fromISO8601('2023-09-01')}),
                    new MinimumHourlyWageRevision({prefectureCode: PrefectureCode.Aomori, hourlyWage: 898, effectiveDate: LocalDate.fromISO8601('2023-10-07'), publicationDate: LocalDate.fromISO8601('2023-09-07')}),
                    new MinimumHourlyWageRevision({prefectureCode: PrefectureCode.Iwate, hourlyWage: 893, effectiveDate: LocalDate.fromISO8601('2023-10-04'), publicationDate: LocalDate.fromISO8601('2023-09-04') }),
                    // 当年度
                    new MinimumHourlyWageRevision({prefectureCode: PrefectureCode.Hokkaido, hourlyWage: 1010, effectiveDate: LocalDate.fromISO8601('2024-10-01'), publicationDate: LocalDate.fromISO8601('2024-08-30')}),
                    new MinimumHourlyWageRevision({prefectureCode: PrefectureCode.Aomori, hourlyWage: 953, effectiveDate: LocalDate.fromISO8601('2024-10-05'), publicationDate: LocalDate.fromISO8601('2024-08-30')}),
                    new MinimumHourlyWageRevision({prefectureCode: PrefectureCode.Iwate, hourlyWage: 952, effectiveDate: LocalDate.fromISO8601('2024-10-04'), publicationDate: null }),
                ]);
            await expect(
                new ListMinimumHourlyWageInteractor({
                    minimumHourlyWageRevisionService,
                }).invoke(new ListMinimumHourlyWageInput({date: new Date('2024-10-03'), prefectureCodes: ['01', '02', '03']}))
            ).resolves.toStrictEqual(
                new ListMinimumHourlyWageOutput({
                    minimumHourlyWages: [
                        {prefectureCode: PrefectureCode.Hokkaido, hourlyWage: 1010, next: null}, // 2024-10-01に改定されて次の改定はない
                        {prefectureCode: PrefectureCode.Aomori, hourlyWage: 898, next: {hourlyWage: 953, effectiveDate: LocalDate.fromISO8601('2024-10-05'), publicationDate: LocalDate.fromISO8601('2024-08-30') }},
                        {prefectureCode: PrefectureCode.Iwate, hourlyWage: 893, next: {hourlyWage: 952, effectiveDate: LocalDate.fromISO8601('2024-10-04'), publicationDate: null }},
                    ]
                })
            );
            expect(minimumHourlyWageRevisionService.list).toHaveBeenCalledTimes(1);
            expect(minimumHourlyWageRevisionService.list).toHaveBeenNthCalledWith(1, {
                // 照会期間はInputで指定日した日前年度の10月1日からInputで指定日した日の年度末まで
                effectiveDate: new TermBetween({since: LocalDate.fromISO8601('2023-10-01'), until: LocalDate.fromISO8601('2025-03-31')}),
                // Inputの都道府県指定がそのまま使われる
                prefectureCodes: [PrefectureCode.Hokkaido, PrefectureCode.Aomori, PrefectureCode.Iwate],
            });
        });
        it('都道府県絞り込みなし', async () => {
            const minimumHourlyWageRevisionService = createMinimumHourlyWageRevisionService();
            minimumHourlyWageRevisionService.list = jest.fn()
                .mockResolvedValueOnce([]);
            await expect(
                new ListMinimumHourlyWageInteractor({
                    minimumHourlyWageRevisionService,
                }).invoke(new ListMinimumHourlyWageInput({date: new Date('2045-04-01'), prefectureCodes: null}))
            ).resolves.toStrictEqual(
                new ListMinimumHourlyWageOutput({minimumHourlyWages: []})
            );
            expect(minimumHourlyWageRevisionService.list).toHaveBeenCalledTimes(1);
            expect(minimumHourlyWageRevisionService.list).toHaveBeenNthCalledWith(1, {
                // 照会期間はInputで指定日した日前年度の10月1日からInputで指定日した日の年度末まで
                effectiveDate: new TermBetween({since: LocalDate.fromISO8601('2044-10-01'), until: LocalDate.fromISO8601('2046-03-31')}),
                // Inputの都道府県指定がそのまま使われる
                prefectureCodes: null,
            });
        });
    });
});

const createMinimumHourlyWageRevisionService = (): MinimumHourlyWageRevisionService => {
    return {
        list: jest.fn(),
    };
}