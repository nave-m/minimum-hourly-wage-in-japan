import winston from 'winston';
import { LoggingService } from '@minimum-hourly-wage-in-japan/usecase/src/LoggingService';

export class WinstonLoggingService implements LoggingService {
    readonly delegate: winston.Logger
    constructor(props: {
        service: string;
    }) {
        this.delegate = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(), 
                winston.format.json(),
            ),    
            defaultMeta: { service: props.service },
            transports: [new winston.transports.Console()],
        });
    }
    info(message: unknown): void {
        this.delegate.info(message);
    }
    error(message: unknown): void {
        this.delegate.error(message);
    }
}