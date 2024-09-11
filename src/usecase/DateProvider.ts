import { LocalDate } from "../core/LocalDate";

export interface DateProvider {
    currentDate(): LocalDate;
}