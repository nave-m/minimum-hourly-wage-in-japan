import { sendUnaryData } from "@grpc/grpc-js";
import { ServerUraryCallAdapter } from "./ServerUraryCallAdapter";
import { ListViewsRequest, ListViewsResponse } from "./gen/jp/wage/api/v1/minimum_hourly_wage_api_pb";
import { ListMinimumHourlyWageInteractor, ListMinimumHourlyWageInput, MinimumHourlyWage, ListMinimumHourlyWageOutput } from "@minimum-hourly-wage-in-japan/usecase/src/ListMinimumHourlyWage";
import { LoggingService } from "@minimum-hourly-wage-in-japan/usecase/src/LoggingService";
import { InvalidArgumentError } from "@minimum-hourly-wage-in-japan/usecase/src/UseCaseError";
import { MinimumHourlyWageView, NextMinimumHourlyWageView } from "./gen/jp/wage/api/v1/minimum_hourly_wage_view_pb";
import { LocalDate } from "@minimum-hourly-wage-in-japan/core/src/LocalDate";
import { Date as GoogleDate } from "./gen/google/type/date_pb";

export class ListMinimumHourlyWageViews extends ServerUraryCallAdapter<ListMinimumHourlyWageInput, ListMinimumHourlyWageOutput, ListViewsRequest, ListViewsResponse> {
    protected readonly interactor: ListMinimumHourlyWageInteractor;
    constructor(props: {
        interactor: ListMinimumHourlyWageInteractor;
        loggingService: LoggingService;
    }) {
        super({loggingService: props.loggingService});
        this.interactor = props.interactor;
    }
    protected createInput(request: ListViewsRequest): ListMinimumHourlyWageInput {
        return new ListMinimumHourlyWageInput({
            date: this.extractDate(request),
            prefectureCodes: request.getPrefectureCodesList(),
        });
    }
    protected sendResponse(output: ListMinimumHourlyWageOutput, callback: sendUnaryData<ListViewsResponse>) {
        const response = new ListViewsResponse();
        response.setViewsList(
            output.minimumHourlyWages.map((minimumHourlyWage: MinimumHourlyWage) => {
                const view = new MinimumHourlyWageView();
                view.setPrefectureCode(minimumHourlyWage.prefectureCode);
                view.setHourlyWage(minimumHourlyWage.hourlyWage);
                if (minimumHourlyWage.next != null) {
                    const nextView = new NextMinimumHourlyWageView();
                    nextView.setHourlyWage(minimumHourlyWage.next.hourlyWage);
                    nextView.setEffectiveDate(this.presentGoogleDate(minimumHourlyWage.next.effectiveDate));
                    if (minimumHourlyWage.next.publicationDate != null) {
                        nextView.setPublicationDate(this.presentGoogleDate(minimumHourlyWage.next.publicationDate));
                    }
                    view.setNext(nextView);
                }
                return view;
            }),
        )
        callback(null, response);
    }
    private extractDate(request: ListViewsRequest): Date | null {
        const mayBeDate = request.getDate();
        if (mayBeDate == null) {
            throw new InvalidArgumentError({
                violations: [{property: 'date', message: '日付は必須です'}]
            });
        } else {
            return new Date(`${mayBeDate.getYear()}-${String(mayBeDate.getMonth()).padStart(2, '0')}-${String(mayBeDate.getDay()).padStart(2, '0')}`)
        }
    }
    private presentGoogleDate(localDate: LocalDate): GoogleDate {
        const googleDate = new GoogleDate();
        googleDate.setYear(localDate.year);
        googleDate.setMonth(localDate.month);
        googleDate.setDay(localDate.dayOfMonth);
        return googleDate;
    } 
}