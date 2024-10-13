import { LocalDate } from "./LocalDate";
import { PrefectureCode } from "./PrefectureCode";


export class MinimumHourlyWageRevision {
    readonly prefectureCode: PrefectureCode;
    readonly hourlyWage: number; // 整数
    readonly effectiveDate: LocalDate; // 発効日 (日付のみ有効)
    readonly publicationDate: LocalDate | null; // 公示日 (日付のみ有効)
    
    constructor(props: {
        prefectureCode: PrefectureCode;
        effectiveDate: LocalDate; // 発効日 (日付のみ有効)
        publicationDate: LocalDate | null; // 公示日 (日付のみ有効)
        hourlyWage: number; // 整数
    }) {
        if (props.publicationDate != null && props.publicationDate.getComparableNumber() >= props.effectiveDate.getComparableNumber()) {
            throw new Error(`発効日は公示日よりも後である必要があります`)
        }
        this.prefectureCode = props.prefectureCode;
        this.hourlyWage = props.hourlyWage;
        this.effectiveDate = props.effectiveDate;
        this.publicationDate = props.publicationDate;
    }

    public isEffective(date: LocalDate): boolean {
        return this.publicationDate != null 
            && this.effectiveDate.getComparableNumber() <= date.getComparableNumber();
    }
}