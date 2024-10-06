import { asNonEmptyListOrNull, NonEmptyList } from "../core/NonEmptyList";
import { PrefectureCode, prefectureCodeFromText } from "../core/PrefectureCode";
import { DateService } from "./DateService";
import { MinimumHourlyWageRevisionService } from "./MinimumHourlyWageRevisionService";
import { InvalidArgumentError, UnexpectedError, UseCaseError, Violation } from "./UseCaseError";
import { TermBetween } from "../core/Term";
import { MinimumHourlyWageRevision } from "../core/MinimumHourlyWageRevision";
import { Interactor } from "./Interactor";
import { LocalDate } from "../core/LocalDate";

export class ListMinimumHourlyWageInteractor implements Interactor<ListMinimumHourlyWageInput,ListMinimumHourlyWageOutput> {
    private readonly dateService: DateService;
    private readonly minimumHourlyWageRevisionService: MinimumHourlyWageRevisionService;
    
    constructor(props: {
        dateService: DateService;
        minimumHourlyWageRevisionService: MinimumHourlyWageRevisionService;
    }) {
        this.dateService = props.dateService;
        this.minimumHourlyWageRevisionService = props.minimumHourlyWageRevisionService;
    }

    async invoke(input: ListMinimumHourlyWageInput): Promise<ListMinimumHourlyWageOutput> {
        try {
            const validatedInput = this.validate(input);
            const targetDate = validatedInput.date ? validatedInput.date : this.dateService.currentDate();
            const [effectiveRevisions, nextRevisions] = await Promise.all([
                this.getEffectiveRevisions(targetDate, validatedInput.prefectureCodes),
                this.getNextRevisions(targetDate, validatedInput.prefectureCodes),
            ]);
            return new ListMinimumHourlyWageOutput({
                minimumHourlyWages: effectiveRevisions.map((effectiveRevision) => {
                    const mayBeNext = nextRevisions.find((nextRevision) => nextRevision.prefectureCode == effectiveRevision.prefectureCode)
                    return {
                        prefectureCode: effectiveRevision.prefectureCode,
                        hourlyWage: effectiveRevision.hourlyWage,
                        next: mayBeNext ? {
                            hourlyWage: mayBeNext.hourlyWage,
                            effectiveDate: mayBeNext.effectiveDate,
                            publicationDate: mayBeNext.publicationDate,
                        } : null,
                    }
                })
            });
        } catch (e: unknown) {
            if (e instanceof UseCaseError) {
                throw e;
            } else if (e instanceof Error) {
                throw new UnexpectedError({original: e});
            } else {
                throw new UnexpectedError({original: new Error(`${e}`)});
            }
        }
    }
    validate(input: ListMinimumHourlyWageInput): ValidatedInput {
        return new ValidatedInput({
            date: this.validateDate(input.date),
            prefectureCodes: this.validatePrefectureCodes(input.prefectureCodes),
        });
    }
    private validateDate(date: Date | null): LocalDate | null {
        try {
            if (date == null) {
                return null;
            } else if (!Number.isNaN(date.getTime())) {
                return LocalDate.fromYMD(date.getFullYear(), date.getMonth() + 1, date.getDate())
            } 
            throw Error();
        } catch {
            throw new InvalidArgumentError({
                violations: [
                    {property:'date', message: '日付として解釈できません'}
                ]
            });
        }
    }
    private validatePrefectureCodes(prefectureCodes: string[] | null): NonEmptyList<PrefectureCode> | null { 
        if (prefectureCodes != null) {
            const violations: Violation[] = [];
            const converted: PrefectureCode[] = [];
            prefectureCodes.forEach((code, index) => {
                try {
                    converted.push(prefectureCodeFromText(code));
                } catch {
                    violations.push(
                        {property: `prefectureCodes[${index}]`, message: '都道府県コードとして解釈できません'}
                    )
                }
            });
            if (violations.length > 0) {
                throw new InvalidArgumentError({
                    violations
                });
            } else {
                return asNonEmptyListOrNull(converted);
            }
        } else {
            return null;
        }
    }

    async getEffectiveRevisions(targetDate: LocalDate, prefectureCodes: NonEmptyList<PrefectureCode> | null): Promise<MinimumHourlyWageRevision[]> {
        // 発効日が前年の10月1日から指定日まで取得するが、
        // 10月以降は同一都道府県で改定前後の最低賃金の定義が重複することがある
        // なので都道府県ごとに最低賃金定義をまとめる
        const candidatesAsMap = (await this.minimumHourlyWageRevisionService.list({
            effectiveDate: new TermBetween({since: LocalDate.fromYMD(targetDate.year -1, 10, 1), until: targetDate}),
            prefectureCodes: prefectureCodes,
        }))
            .filter((revision) => revision.isEffective(targetDate))
            .reduce(
                (map, revision) => {
                    const mayBeRevisions = map.get(revision.prefectureCode);
                    if (mayBeRevisions != null) {
                        map.set(revision.prefectureCode, [...mayBeRevisions, revision])
                    } else {
                        map.set(revision.prefectureCode, [revision]);
                    }
                    return map;
                }, 
                new Map<PrefectureCode, NonEmptyList<MinimumHourlyWageRevision>>()
            );
        // 最低賃金定義が改定前後で重複した場合は最新のものを使う
        return Array.from(candidatesAsMap).map((prefectureCodeAndResitionsTupple) => {
            const revisions = prefectureCodeAndResitionsTupple[1];
            return revisions.sort((a, b) => { return (a.effectiveDate.getComparableNumber() < b.effectiveDate.getComparableNumber()) ? 1 : -1})[0];
        });
    }
    async getNextRevisions(targetDate: LocalDate, prefectureCodes: NonEmptyList<PrefectureCode> | null): Promise<MinimumHourlyWageRevision[]> {
        const mayBeEffectiveDateTerm = ListMinimumHourlyWageInteractor.getTermOfNextRevision(targetDate);
        if (mayBeEffectiveDateTerm != null) {
            return (
                await this.minimumHourlyWageRevisionService.list({
                    effectiveDate: mayBeEffectiveDateTerm,
                    prefectureCodes: prefectureCodes,
                })
            ).filter((revision) => !revision.isEffective(targetDate));
        } else {
            return [];
        }
    }
    static getTermOfNextRevision(targetDate: LocalDate): TermBetween | null {
        const TARGET_MONTHES = [8, 9, 10, 11]; // 改定を気にする必要があるのは8月から11月まで
        if(TARGET_MONTHES.includes(targetDate.month)) {
            return new TermBetween({since: LocalDate.fromYMD(targetDate.year, 10, 1), until: LocalDate.fromYMD(targetDate.year, 11, 30)})
        } else {
            return null;
        }
    }
}

export class ListMinimumHourlyWageInput {
    readonly date: Date | null;
    readonly prefectureCodes: string[] | null;
    constructor(props: {
        date: Date | null;
        prefectureCodes: string[] | null
    }) {
        this.date = props.date;
        this.prefectureCodes = props.prefectureCodes;
    }
    
}

export class ValidatedInput {
    readonly date: LocalDate | null;
    readonly prefectureCodes: NonEmptyList<PrefectureCode> | null;
    constructor(props: {
        date: LocalDate | null;
        prefectureCodes: NonEmptyList<PrefectureCode> | null;
    }) {
        this.date = props.date;
        this.prefectureCodes = props.prefectureCodes;
    }
}

export class ListMinimumHourlyWageOutput {
    readonly minimumHourlyWages: MinimumHourlyWage[];
    constructor (props: {
        minimumHourlyWages: MinimumHourlyWage[];
    }) {
        this.minimumHourlyWages = props.minimumHourlyWages;
    }
}

export type NextMinimumHourlyWage = {
    hourlyWage: number;
    readonly effectiveDate: LocalDate;
    readonly publicationDate: LocalDate | null;
};

export type MinimumHourlyWage = {
    readonly prefectureCode: PrefectureCode;
    readonly hourlyWage: number;
    readonly next: NextMinimumHourlyWage | null;
};
