export class LocalDate {
    readonly year: number; // 年 (西暦 紀元前非対応)
    readonly month: number; // 月 (indexではない 1から12)
    readonly dayOfMonth: number; // 日 dayだと週の中の曜日と混同する dateだと年月日と間際らしい
    private constructor(props: {
        year: number;
        month: number;
        dayOfMonth: number;
    }) {
        this.year = props.year;
        this.month = props.month;
        this.dayOfMonth = props.dayOfMonth;
    }
    getComparableNumber(): number {
        return this.dayOfMonth + 100 * this.month + 10000 * this.year;
    }
    static fromYMD(year: number, month: number, dayOfMonth: number) {
        if (!Number.isInteger(year) || year < 0) {
            throw new Error(`年は正の整数で指定してください ${year}`);
        }
        if (!Number.isInteger(month) || month < 1 || month > 12) {
            throw new Error(`月は1から12の整数で指定してください ${month}`);
        }
        if (!Number.isInteger(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) {
            throw new Error(`日は1から31の整数で指定してください ${dayOfMonth}`);
        }
        const date = new Date(year, month -1, dayOfMonth);
        if (Number.isNaN(date.getTime()) || date.getFullYear() != year || date.getMonth() != month -1, date.getDate() != dayOfMonth) {
            throw new Error(`日付として解釈できません year: ${year} month: ${month} day: ${dayOfMonth}`);
        }
        
        return new LocalDate({year, month, dayOfMonth: dayOfMonth});
    }
    static fromISO8601(text: string): LocalDate {
        if (!/^\d+-\d{2}-\d{2}$/.test(text)) {
            throw new Error(`ISO8601の日付形式ではありません ${text}`);
        }
        const [yearAsText, monthAsText, dayOfMonthAsText] = text.split('-');
        const yearAsNumber = Number(yearAsText)
        const monthAsNumber = Number(monthAsText);
        const dayOfMonthAsNumber = Number(dayOfMonthAsText);
        
        return LocalDate.fromYMD(yearAsNumber, monthAsNumber, dayOfMonthAsNumber);
    }
}