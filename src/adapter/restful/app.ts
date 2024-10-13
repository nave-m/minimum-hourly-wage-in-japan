
import { ListMinimumHourlyWageInteractor } from '../../usecase/ListMinimumHourlyWage';
import { MinimumHourlyWageRevisionServiceImpl } from '../local/MinimumHourlyWageRevisionServiceImpl';
import { InMemoryDataSource } from '../local/InMemoryDataSource';
import { GetMinimumHourlyWageViews } from './GetMinimumHourlyWageViews';
import { Application } from 'express';
import { LoggingService } from '../../usecase/LoggingService';

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
    return props.app;
};