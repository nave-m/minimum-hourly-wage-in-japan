import { LocalDate } from "../core/LocalDate";

export interface DateService {
    currentDate(): LocalDate;
}