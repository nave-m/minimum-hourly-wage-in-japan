import { LocalDate } from "../../core/LocalDate";
import { DateProviderImpl } from "./DateProviderImpl";

describe('DateProviderImpl', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });
    describe('currentDate', () => {
        it('日本の日付を返す %s %s', () => {
            const now = new Date(Date.UTC(2024, 8, 30, 15, 0, 0));
            expect(now.getUTCFullYear()).toBe(2024);
            expect(now.getUTCMonth()).toBe(8); // 月はindex
            expect(now.getUTCDate()).toBe(30);
            jest.spyOn(global, 'Date')
                .mockImplementation(() => now);
            expect(new DateProviderImpl().currentDate()).toStrictEqual(LocalDate.fromISO8601('2024-10-01'));
        });
    });
})