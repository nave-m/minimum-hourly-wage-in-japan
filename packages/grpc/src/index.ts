import { Server, ServerCredentials} from "@grpc/grpc-js";
import { configure } from "./app";
import { WinstonLoggingService } from '@minimum-hourly-wage-in-japan/winston/src/WinstonLoggingService';

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
const port = getPort(process.env.GRPC_API_PORT);
const host = `localhost:${port}`;

const server = new Server(); // TODO: アクセスログを記録するInterceptorを注入する
const loggingService = new WinstonLoggingService({service: 'minimum-hourly-wage-in-japan-grpc-api'})
configure({
    server,
    loggingService
}).bindAsync(host, ServerCredentials.createInsecure(), (error) => {
    if (error) {
        loggingService.error(error);
    } else {
        loggingService.info({message: `listening port: ${port}`});
    }
})