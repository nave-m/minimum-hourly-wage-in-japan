import { formatInTimeZone } from "date-fns-tz";
import { LocalDate } from "../../core/LocalDate";
import { DateService } from "../../usecase/DateService";

export class DateServiceImpl implements DateService {
    currentDate(): LocalDate {
        // Date.getMonth()やDate.getDate()は実行環境に依存するので、タイムゾーン指定で現地の日付を取り出す
        return LocalDate.fromISO8601(formatInTimeZone(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd'))
    }
}