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
        it('改定時期・都道府県絞り込みあり', async () => {
            const minimumHourlyWageRevisionService = createMinimumHourlyWageRevisionService();
            minimumHourlyWageRevisionService.list = jest.fn()
                .mockResolvedValueOnce([
                    // 昨年の10月1日から2024-10-03現在までに発効となった時給
                    new MinimumHourlyWageRevision({prefectureCode: PrefectureCode.Hokkaido, hourlyWage: 960, effectiveDate: LocalDate.fromISO8601('2023-10-01'), publicationDate: LocalDate.fromISO8601('2023-09-01')}),
                    new MinimumHourlyWageRevision({prefectureCode: PrefectureCode.Aomori, hourlyWage: 898, effectiveDate: LocalDate.fromISO8601('2023-10-07'), publicationDate: LocalDate.fromISO8601('2023-09-07')}),
                    new MinimumHourlyWageRevision({prefectureCode: PrefectureCode.Iwate, hourlyWage: 893, effectiveDate: LocalDate.fromISO8601('2023-10-04'), publicationDate: LocalDate.fromISO8601('2023-09-04') }),
                    new MinimumHourlyWageRevision({prefectureCode: PrefectureCode.Hokkaido, hourlyWage: 1010, effectiveDate: LocalDate.fromISO8601('2024-10-01'), publicationDate: LocalDate.fromISO8601('2024-08-30')}),
                ])
                .mockResolvedValueOnce([
                    // 2024-10-04およびそれよりも未来の改定
                    new MinimumHourlyWageRevision({prefectureCode: PrefectureCode.Aomori, hourlyWage: 953, effectiveDate: LocalDate.fromISO8601('2024-10-05'), publicationDate: LocalDate.fromISO8601('2024-08-30')}),
                    new MinimumHourlyWageRevision({prefectureCode: PrefectureCode.Iwate, hourlyWage: 952, effectiveDate: LocalDate.fromISO8601('2024-10-04'), publicationDate: null }),
                ]);
            expect(
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
            // Inputで指定日した日が10月なので「現在の時給の照会」と「改定の照会」の２回実施される
            expect(minimumHourlyWageRevisionService.list).toHaveBeenCalledTimes(2);
            // 現在の時給の照会期間は前年の10月1日からInputで指定日した日まで
            expect(minimumHourlyWageRevisionService.list).toHaveBeenNthCalledWith(1, {
                effectiveDate: new TermBetween({since: LocalDate.fromISO8601('2023-10-01'), until: LocalDate.fromISO8601('2024-10-03')}),
                prefectureCodes: [PrefectureCode.Hokkaido, PrefectureCode.Aomori, PrefectureCode.Iwate],
            });
            // 改定の照会期間は今年の10月から11月まで
            expect(minimumHourlyWageRevisionService.list).toHaveBeenNthCalledWith(2, {
                effectiveDate: new TermBetween({since: LocalDate.fromISO8601('2024-10-01'), until: LocalDate.fromISO8601('2024-11-30')}),
                prefectureCodes: [PrefectureCode.Hokkaido, PrefectureCode.Aomori, PrefectureCode.Iwate],
            });
        });
        it('改定時期外・都道府県絞り込みなし', async () => {
            const minimumHourlyWageRevisionService = createMinimumHourlyWageRevisionService();
            minimumHourlyWageRevisionService.list = jest.fn()
                .mockResolvedValueOnce([]);
            expect(
                new ListMinimumHourlyWageInteractor({
                    minimumHourlyWageRevisionService,
                }).invoke(new ListMinimumHourlyWageInput({date: new Date('2045-12-31'), prefectureCodes: null}))
            ).resolves.toStrictEqual(
                new ListMinimumHourlyWageOutput({minimumHourlyWages: []})
            );
            // 12月なので改定の照会はせず、現在の時給の照会だけされる
            expect(minimumHourlyWageRevisionService.list).toHaveBeenCalledTimes(1);
            // 現在の時給の照会期間は前年の10月1日からInputで指定日した日まで
            expect(minimumHourlyWageRevisionService.list).toHaveBeenNthCalledWith(1, {
                effectiveDate: new TermBetween({since: LocalDate.fromISO8601('2044-10-01'), until: LocalDate.fromISO8601('2045-12-31')}),
                prefectureCodes: null,
            });
        });
    });
    describe('getTermOfNextRevision', () => {
        it.each([
            [LocalDate.fromISO8601('2024-08-01'), new TermBetween({since: LocalDate.fromISO8601('2024-10-01'), until: LocalDate.fromISO8601('2024-11-30')})],
            [LocalDate.fromISO8601('2025-09-10'), new TermBetween({since: LocalDate.fromISO8601('2025-10-01'), until: LocalDate.fromISO8601('2025-11-30')})],
            [LocalDate.fromISO8601('2026-10-20'), new TermBetween({since: LocalDate.fromISO8601('2026-10-01'), until: LocalDate.fromISO8601('2026-11-30')})],
            [LocalDate.fromISO8601('2027-11-30'), new TermBetween({since: LocalDate.fromISO8601('2027-10-01'), until: LocalDate.fromISO8601('2027-11-30')})],
        ])('8月から11月の場合は改定情報を取得するための発効日の期間(その年の10/1~11/30)を返す %o', (targetDate, expected) => {
            expect(ListMinimumHourlyWageInteractor.getTermOfNextRevision(targetDate)).toEqual(expected);
        });
        it.each([
            [LocalDate.fromISO8601('2021-01-01')],
            [LocalDate.fromISO8601('2022-02-02')],
            [LocalDate.fromISO8601('2023-03-03')],
            [LocalDate.fromISO8601('2024-04-04')],
            [LocalDate.fromISO8601('2025-05-05')],
            [LocalDate.fromISO8601('2026-06-06')],
            [LocalDate.fromISO8601('2027-07-31')],
            [LocalDate.fromISO8601('2028-12-01')],
        ])('1月~7月・12月の場合は改定情報を取得する必要がないのでnullを返す %o', (targetDate) => {
            expect(ListMinimumHourlyWageInteractor.getTermOfNextRevision(targetDate)).toBeNull();
        });
    });
});

const createMinimumHourlyWageRevisionService = (): MinimumHourlyWageRevisionService => {
    return {
        list: jest.fn(),
    };
}