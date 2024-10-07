import express from 'express';
import { configure } from './app';
import { WinstonLoggingService } from '../winston/WinstonLoggingService';

const getPort = (mayBePortText: string | undefined): number => {
    const DEFAULT_PORT = 3000;
    if (mayBePortText == null) {
        return DEFAULT_PORT;
    }
    const mayBePortNumber = Number(mayBePortText);
    if (Number.isNaN(mayBePortNumber)) {
        return DEFAULT_PORT;
    } else {
        return mayBePortNumber;
    }
}

const port = getPort(process.env.RESTFUL_API_PORT);
const loggingService = new WinstonLoggingService({service: 'minimum-hourly-wage-in-japan-restful-api'})

const app = express();
app.disable('x-powered-by');
app.use((req, res, next) => {
    const send = res.send;
    res.send = (body) => {
        res.send = send;
        loggingService.info({
            message: 'access-log',
            request: {
                path: req.path,
                method: req.method,
                headers: req.headers,
                query: req.query,
                // 現状、GETのみなのでbodyはログに出力しない
            },
            response: {
                statusCode: res.statusCode,
                body: body,
            },
        });
        return res.send(body);
    };
    next();
});

configure({app, loggingService}).listen(port, () => {
    loggingService.info({message: `listening port: ${port}`});
});