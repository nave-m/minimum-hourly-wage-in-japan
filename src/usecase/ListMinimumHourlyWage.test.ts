import { LocalDate } from "../core/LocalDate";
import { MinimumHourlyWageRevision } from "../core/MinimumHourlyWageRevision";
import { PrefectureCode } from "../core/PrefectureCode";
import { TermBetween } from "../core/Term";
import { DateService } from "./DateService";
import { ListMinimumHourlyWageInput, ListMinimumHourlyWageInteractor, ListMinimumHourlyWageOutput, ValidatedInput } from "./ListMinimumHourlyWage";
import { MinimumHourlyWageRevisionService } from "./MinimumHourlyWageRevisionService";
import { InvalidArgumentError } from "./UseCaseError";

describe('ListMinimumHourlyWageInteractor', () => {
    describe('validate', () => {
        it.each([
            [
                '最小構成(都道府県コード指定なし)', 
                new ListMinimumHourlyWageInput({
                    date: null,
                    prefectureCodes: null,
                }),
                new ValidatedInput({
                    date: null,
                    prefectureCodes: null,
                }),
            ],
            [
                '最小構成(都道府県コードが空)', 
                new ListMinimumHourlyWageInput({
                    date: null,
                    prefectureCodes: [],
                }),
                new ValidatedInput({
                    date: null,
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
                    dateService: createDateService(),
                    minimumHourlyWageRevisionService: createMinimumHourlyWageRevisionService(),
                }).validate(input)
            ).toStrictEqual(expected);
        });
        it('日付が不正な値の場合、InvalidArgumentErrorを投げる', () => {
            expect(() => {
                new ListMinimumHourlyWageInteractor({
                    dateService: createDateService(),
                    minimumHourlyWageRevisionService: createMinimumHourlyWageRevisionService(),
                }).validate(
                    new ListMinimumHourlyWageInput({
                        date: new Date(''),
                        prefectureCodes: null,
                    })
                );
            }).toThrow(
                new InvalidArgumentError({violations: [{property:'date', message: '日付として解釈できません'}]})
            );
        });
        it('都道府県コードが不正な値の場合、InvalidArgumentErrorを投げる', () => {
            expect(() => {
                new ListMinimumHourlyWageInteractor({
                    dateService: createDateService(),
                    minimumHourlyWageRevisionService: createMinimumHourlyWageRevisionService(),
                }).validate(
                    new ListMinimumHourlyWageInput({
                        date: null,
                        prefectureCodes: ['00', '01', '48'],
                    })
                );
            }).toThrow(
                new InvalidArgumentError({violations: [
                    {property: `prefectureCodes[0]`, message: '都道府県コードとして解釈できません'},
                    {property: `prefectureCodes[2]`, message: '都道府県コードとして解釈できません'},
                ]})
            );
        });
    });
    describe('invoke', () => {
        it('日付指定あり・都道府県絞り込みあり', async () => {
            const dateProvider = createDateService();
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
                    dateService: dateProvider,
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
            // Inputで日付を指定したので、現在の日付の取得は実施されない
            expect(dateProvider.currentDate).toHaveBeenCalledTimes(0);
            expect(minimumHourlyWageRevisionService.list).toHaveBeenCalledTimes(2);
            // 現在の時給の照会する
            expect(minimumHourlyWageRevisionService.list).toHaveBeenNthCalledWith(1, {
                // 前年の10月1日からInputで指定日した日まで
                effectiveDate: new TermBetween({since: LocalDate.fromISO8601('2023-10-01'), until: LocalDate.fromISO8601('2024-10-03')}),
                prefectureCodes: [PrefectureCode.Hokkaido, PrefectureCode.Aomori, PrefectureCode.Iwate],
            });
            // Inputで指定日した日が10月なので改定の照会を今年の10月から11月までの範囲で実施
            expect(minimumHourlyWageRevisionService.list).toHaveBeenNthCalledWith(2, {
                effectiveDate: new TermBetween({since: LocalDate.fromISO8601('2024-10-01'), until: LocalDate.fromISO8601('2024-11-30')}),
                prefectureCodes: [PrefectureCode.Hokkaido, PrefectureCode.Aomori, PrefectureCode.Iwate],
            });
        });
        it('日付指定なし・都道府県絞り込みなし', async () => {
            const dateProvider = createDateService();
            dateProvider.currentDate = jest.fn().mockReturnValueOnce(LocalDate.fromISO8601('2045-12-31'));
            const minimumHourlyWageRevisionService = createMinimumHourlyWageRevisionService();
            minimumHourlyWageRevisionService.list = jest.fn()
                .mockResolvedValueOnce([]);
            // 日付指定あり・都道府県絞り込みありのケースでOutputのパターン網羅はしたので、このケースは時給の照会に現在の日付が使われることだけを確認する
            expect(
                new ListMinimumHourlyWageInteractor({
                    dateService: dateProvider,
                    minimumHourlyWageRevisionService,
                }).invoke(new ListMinimumHourlyWageInput({date: null, prefectureCodes: null}))
            ).resolves.toStrictEqual(
                new ListMinimumHourlyWageOutput({minimumHourlyWages: []})
            );
            // Inputで日付を指定していないので、現在の日付の取得をする
            expect(dateProvider.currentDate).toHaveBeenCalledTimes(1);
            expect(minimumHourlyWageRevisionService.list).toHaveBeenCalledTimes(1);
            // 現在の時給の照会する
            expect(minimumHourlyWageRevisionService.list).toHaveBeenNthCalledWith(1, {
                // 前年の10月1日から現在の日付まで
                effectiveDate: new TermBetween({since: LocalDate.fromISO8601('2044-10-01'), until: LocalDate.fromISO8601('2045-12-31')}),
                prefectureCodes: null,
            });
            // 12月なので改定の照会はしない
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

const createDateService = (): DateService => {
    return {
        currentDate: jest.fn(),
    };
};

const createMinimumHourlyWageRevisionService = (): MinimumHourlyWageRevisionService => {
    return {
        list: jest.fn(),
    };
}