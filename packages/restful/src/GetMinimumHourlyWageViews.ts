import { Request, Response } from "express";
import { ListMinimumHourlyWageInteractor, ListMinimumHourlyWageInput, MinimumHourlyWage, ListMinimumHourlyWageOutput } from "@minimum-hourly-wage-in-japan/usecase/src/ListMinimumHourlyWage";
import { RestfulAdapter } from "./RestfulAdapter";
import { components } from "./gen/schema";
import { LocalDate } from "@minimum-hourly-wage-in-japan/core/src/LocalDate";
import { InvalidArgumentError } from "@minimum-hourly-wage-in-japan/usecase/src/UseCaseError";
import { LoggingService } from "@minimum-hourly-wage-in-japan/usecase/src/LoggingService";

type OkResponseBodyType = components["schemas"]["GetMinimumHourlyWagesViewsResponseBody"];

export class GetMinimumHourlyWageViews extends RestfulAdapter<ListMinimumHourlyWageInput, ListMinimumHourlyWageOutput> {
    protected readonly interactor: ListMinimumHourlyWageInteractor;
    constructor(props: {
        interactor: ListMinimumHourlyWageInteractor;
        loggingService: LoggingService;
    }) {
        super({loggingService: props.loggingService});
        this.interactor = props.interactor;
    }
    protected createInput(req: Request): ListMinimumHourlyWageInput {
        return new ListMinimumHourlyWageInput({
            date: this.extractDate(req),
            prefectureCodes: this.extractPrefectureCodes(req),
        });
    }
    protected sendResponse(output: ListMinimumHourlyWageOutput, res: Response): void {
        const body: OkResponseBodyType = {
            minimumHourlyWageViews: output.minimumHourlyWages.map((minimumHourlyWage: MinimumHourlyWage) => {
                return {
                    prefectureCode: minimumHourlyWage.prefectureCode,
                    hourlyWage: minimumHourlyWage.hourlyWage,
                    next: minimumHourlyWage.next ? {
                        hourlyWage: minimumHourlyWage.next.hourlyWage,
                        effectiveDate: this.presentISO8601(minimumHourlyWage.next.effectiveDate),
                        publicationDate: minimumHourlyWage.next.publicationDate ? this.presentISO8601(minimumHourlyWage.next.publicationDate) : null,
                    } : null,
                }
            })
        };
        res.send(body);
    }
    private extractDate(req: Request): Date | null{
        try {
            const mayBeDate = req.query.date as string | string[] | undefined;
            if (mayBeDate == null) {
                return null;
            } else if (Array.isArray(mayBeDate)) {
                throw new InvalidArgumentError({
                    violations: [{property: 'date', message: '日付は文字列で指定してください'}]
                });
            } else {
                return new Date(mayBeDate);
            }
        } catch (error: unknown) {
            if (error instanceof InvalidArgumentError) {
                throw error;
            } else {
                throw new InvalidArgumentError({
                    violations: [{property: 'date', message: '日付は文字列で指定してください'}]
                });
            }
        }   
    }
    private extractPrefectureCodes(req: Request): string[] | null {
        try {
            const mayBePrefectureCodes = req.query.prefectureCodes as string | string[] | undefined;
            if (mayBePrefectureCodes == null) {
                return null
            } else if (Array.isArray(mayBePrefectureCodes)) {
                return mayBePrefectureCodes;
            } else {
                throw new InvalidArgumentError({
                    violations: [{property: 'prefectureCodes', message: '都道府県コードは配列で指定してください'}]
                });
            }
        } catch (error: unknown) {
            if (error instanceof InvalidArgumentError) {
                throw error;
            } else {
                throw new InvalidArgumentError({
                    violations: [{property: 'prefectureCodes', message: '都道府県コードは配列で指定してください'}]
                });
            }
        }
    }
    private presentISO8601(localDate: LocalDate): string {
        return `${localDate.year}-${String(localDate.month).padStart(2, '0')}-${String(localDate.dayOfMonth).padStart(2, '0')}`;
    }
}