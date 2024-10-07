import winston from 'winston';
import { LoggingService } from '../../usecase/LoggingService';

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
    /* eslint-disable @typescript-eslint/no-explicit-any */
    info(message: any): void {
        this.delegate.info(message);
    }
    /* eslint-disable @typescript-eslint/no-explicit-any */
    error(message: any): void {
        this.delegate.error(message);
    }
}