import { sendUnaryData, ServerUnaryCall, Server} from "@grpc/grpc-js";
import { ListViewsRequest, ListViewsResponse } from "./gen/jp/wage/api/v1/minimum_hourly_wage_api_pb";
import { MinimumHourlyWageService } from "./gen/jp/wage/api/v1/minimum_hourly_wage_api_grpc_pb";
import { ListMinimumHourlyWageInteractor } from '@minimum-hourly-wage-in-japan/usecase/src/ListMinimumHourlyWage';
import { ListMinimumHourlyWageViews } from "./ListMinimumHourlyWageViews";
import { LoggingService } from '@minimum-hourly-wage-in-japan/usecase/src/LoggingService';
import { MinimumHourlyWageRevisionServiceImpl } from '@minimum-hourly-wage-in-japan/local/src/MinimumHourlyWageRevisionServiceImpl';
import { InMemoryDataSource } from '@minimum-hourly-wage-in-japan/local/src/InMemoryDataSource';

export const configure = (props: {
    server: Server;
    loggingService: LoggingService;
}): Server => {
    const listViewsAdapter = new ListMinimumHourlyWageViews({
        loggingService: props.loggingService,
        interactor:  new ListMinimumHourlyWageInteractor({
            minimumHourlyWageRevisionService: new MinimumHourlyWageRevisionServiceImpl({
                revisions: InMemoryDataSource.load(),
            }),
        }),
    });
    props.server.addService(MinimumHourlyWageService, {
        listViews: (
            call: ServerUnaryCall<ListViewsRequest, ListViewsResponse>,
            callback: sendUnaryData<ListViewsResponse>,
        ): void => {
            listViewsAdapter.invoke(call, callback);
        },
    })
    return props.server;
    
}