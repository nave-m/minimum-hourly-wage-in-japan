import express from 'express';
import { ListMinimumHourlyWageInteractor } from '../../usecase/ListMinimumHourlyWage';
import { DateServiceImpl } from '../date-fns/DateServiceImpl';
import { MinimumHourlyWageRevisionServiceImpl } from '../local/MinimumHourlyWageRevisionServiceImpl';
import { InMemoryDataSource } from '../local/InMemoryDataSource';
import { GetMinimumHourlyWageViews } from './GetMinimumHourlyWageViews';

const app = express();
app.disable('x-powered-by');

const getMinimumHourlyWageViews = new GetMinimumHourlyWageViews(
    new ListMinimumHourlyWageInteractor({
        dateService: new DateServiceImpl(),
        minimumHourlyWageRevisionService: new MinimumHourlyWageRevisionServiceImpl({
            revisions: InMemoryDataSource.load(),
        }),
    })
);

app.get('/api/v1/minimumHourlyWageViews', async (req, res) => {
    await getMinimumHourlyWageViews.invoke(req, res);
});

export default app;