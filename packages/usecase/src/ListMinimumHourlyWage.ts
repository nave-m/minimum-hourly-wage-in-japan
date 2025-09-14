import { asNonEmptyListOrNull, NonEmptyList } from "@minimum-hourly-wage-in-japan/core/src/NonEmptyList";
import { PrefectureCode, prefectureCodeFromText } from "@minimum-hourly-wage-in-japan/core/src/PrefectureCode";
import { MinimumHourlyWageRevisionService } from "./MinimumHourlyWageRevisionService";
import { InvalidArgumentError, UnexpectedError, UseCaseError, Violation } from "./UseCaseError";
import { TermBetween } from "@minimum-hourly-wage-in-japan/core/src/Term";
import { MinimumHourlyWageRevision } from "@minimum-hourly-wage-in-japan/core/src/MinimumHourlyWageRevision";
import { Interactor } from "./Interactor";
import { LocalDate } from "@minimum-hourly-wage-in-japan/core/src/LocalDate";

export class ListMinimumHourlyWageInteractor implements Interactor<ListMinimumHourlyWageInput,ListMinimumHourlyWageOutput> {
    private readonly minimumHourlyWageRevisionService: MinimumHourlyWageRevisionService;
    
    constructor(props: {
        minimumHourlyWageRevisionService: MinimumHourlyWageRevisionService;
    }) {
        this.minimumHourlyWageRevisionService = props.minimumHourlyWageRevisionService;
    }

    async invoke(input: ListMinimumHourlyWageInput): Promise<ListMinimumHourlyWageOutput> {
        try {
            const validatedInput = this.validate(input);
            const minimumHourlyWages = await this.getMinimumHourlyWages(validatedInput);
            return new ListMinimumHourlyWageOutput({ minimumHourlyWages });
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
    private validateDate(date: Date | null): LocalDate {
        try {
            if (date == null) {
                throw new InvalidArgumentError({
                    violations: [
                        {property:'date', message: '日付は必須です'}
                    ]
                });
            } else if (!Number.isNaN(date.getTime())) {
                return LocalDate.fromYMD(date.getFullYear(), date.getMonth() + 1, date.getDate())
            } 
            throw Error();
        } catch (error: unknown) {
            if (error instanceof InvalidArgumentError) {
                throw error;
            } else {
                throw new InvalidArgumentError({
                    violations: [
                        {property:'date', message: '日付として解釈できません'}
                    ]
                });
            }
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

    async getMinimumHourlyWages(validatedInput: ValidatedInput): Promise<MinimumHourlyWage[]> {
        // 最低賃金の改定定義を発効日が前年度の10月1日から当年度の年度末まで取得し、都道府県ごとにまとめる
        const candidatesAsMap: Map<PrefectureCode, NonEmptyList<MinimumHourlyWageRevision>> = (await this.minimumHourlyWageRevisionService.list({
            effectiveDate: new TermBetween({
                since: LocalDate.fromYMD(validatedInput.date.getJapaneseFiscalYear() - 1, 10, 1),
                until: LocalDate.fromYMD(validatedInput.date.getJapaneseFiscalYear() + 1, 3, 31),
            }),
            prefectureCodes: validatedInput.prefectureCodes,
        }))
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
        return Array.from(candidatesAsMap).map((prefectureCodeAndRevisionsTuple) => {
            const prefectureCode = prefectureCodeAndRevisionsTuple[0];
            const revisions = prefectureCodeAndRevisionsTuple[1];
            // 指定日現在の最低賃金
            const effectiveRevision =  revisions
                .filter((revision) => revision.isEffective(validatedInput.date))
                .sort((a, b) => { return (a.effectiveDate.getComparableNumber() < b.effectiveDate.getComparableNumber()) ? 1 : -1})[0];
            // 指定日より後の改定予定
            const mayBeNextRevision = revisions.find((revision) => !revision.isEffective(validatedInput.date))
            return {
                prefectureCode,
                hourlyWage: effectiveRevision.hourlyWage,
                next: mayBeNextRevision != null ? {
                    hourlyWage: mayBeNextRevision.hourlyWage,
                    effectiveDate: mayBeNextRevision.effectiveDate,
                    publicationDate: mayBeNextRevision.publicationDate,
                } : null,
            };
        });
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
    readonly date: LocalDate;
    readonly prefectureCodes: NonEmptyList<PrefectureCode> | null;
    constructor(props: {
        date: LocalDate;
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
