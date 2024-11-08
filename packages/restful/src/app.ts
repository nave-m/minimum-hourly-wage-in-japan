
import { ListMinimumHourlyWageInteractor } from '@minimum-hourly-wage-in-japan/usecase/src/ListMinimumHourlyWage';
import { MinimumHourlyWageRevisionServiceImpl } from '@minimum-hourly-wage-in-japan/local/src/MinimumHourlyWageRevisionServiceImpl';
import { InMemoryDataSource } from '@minimum-hourly-wage-in-japan/local/src/InMemoryDataSource';
import { GetMinimumHourlyWageViews } from './GetMinimumHourlyWageViews';
import { Application } from 'express';
import { LoggingService } from '@minimum-hourly-wage-in-japan/usecase/src/LoggingService';

export const configure = (props: {
    app: Application;
    loggingService: LoggingService;
}): Application => {
    const getMinimumHourlyWageViews = new GetMinimumHourlyWageViews({
        loggingService: props.loggingService,
        interactor: new ListMinimumHourlyWageInteractor({
            minimumHourlyWageRevisionService: new MinimumHourlyWageRevisionServiceImpl({
                revisions: InMemoryDataSource.load(),
            }),
        }),
    });
    props.app.get('/api/v1/minimumHourlyWageViews', async (req, res) => {
        await getMinimumHourlyWageViews.invoke(req, res);
    });
    props.app.get('/api/v1/health', (_, res) => {
        res.sendStatus(200);
    });
    return props.app;
};